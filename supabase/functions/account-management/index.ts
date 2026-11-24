import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Não autorizado." }, 401);
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return jsonResponse({ error: "Sessão inválida ou expirada." }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    // Buscar perfil do solicitante
    const { data: callerProfile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("id, role, status")
      .eq("id", user.id)
      .single();

    if (profileErr || !callerProfile) {
      return jsonResponse({ error: "Perfil de usuário não encontrado." }, 404);
    }

    if (callerProfile.status === "suspended") {
      return jsonResponse({ error: "Sua conta está suspensa." }, 403);
    }

    if (action === "delete_self") {
      // Impedir exclusão se for o único administrador ativo
      if (callerProfile.role === "admin") {
        const { count } = await supabaseAdmin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin")
          .eq("status", "active");

        if ((count ?? 0) <= 1) {
          return jsonResponse(
            { error: "Você é o único administrador ativo. Promova outro usuário a administrador antes de excluir sua conta." },
            400
          );
        }
      }

      const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (delError) throw delError;

      return jsonResponse({ success: true });
    }

    // Ações exclusivas de administrador
    if (callerProfile.role !== "admin") {
      return jsonResponse({ error: "Acesso restrito a administradores." }, 403);
    }

    if (action === "admin_list_users") {
      const { data: profiles, error: listErr } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name, avatar_url, role, status, provider, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (listErr) throw listErr;

      // Contar outputs por usuário
      const { data: outputRows } = await supabaseAdmin
        .from("outputs")
        .select("user_id");

      const counts: Record<string, number> = {};
      for (const row of outputRows ?? []) {
        counts[row.user_id] = (counts[row.user_id] || 0) + 1;
      }

      const users = (profiles ?? []).map((p) => ({
        ...p,
        outputs_count: counts[p.id] || 0,
      }));

      return jsonResponse({ success: true, users });
    }

    if (action === "admin_update_user") {
      const targetUserId = body?.targetUserId;
      const role = body?.role;
      const status = body?.status;

      if (!targetUserId) {
        return jsonResponse({ error: "targetUserId é obrigatório." }, 400);
      }

      if (targetUserId === user.id) {
        return jsonResponse({ error: "Você não pode alterar seu próprio nível de acesso ou status aqui." }, 400);
      }

      const updates: Record<string, string> = {};
      if (role === "user" || role === "admin") updates.role = role;
      if (status === "active" || status === "suspended") updates.status = status;

      if (Object.keys(updates).length === 0) {
        return jsonResponse({ error: "Nenhuma alteração válida informada." }, 400);
      }

      const { data: updated, error: updErr } = await supabaseAdmin
        .from("profiles")
        .update(updates)
        .eq("id", targetUserId)
        .select()
        .single();

      if (updErr) throw updErr;
      return jsonResponse({ success: true, user: updated });
    }

    if (action === "admin_delete_user") {
      const targetUserId = body?.targetUserId;
      if (!targetUserId) {
        return jsonResponse({ error: "targetUserId é obrigatório." }, 400);
      }

      if (targetUserId === user.id) {
        return jsonResponse({ error: "Use a opção 'Excluir minha conta' nas suas configurações para remover a própria conta." }, 400);
      }

      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(targetUserId);
      if (delErr) throw delErr;

      return jsonResponse({ success: true });
    }

    return jsonResponse({ error: "Ação desconhecida." }, 400);
  } catch (err: any) {
    console.error("account-management error:", err);
    return jsonResponse({ error: err?.message || "Erro interno no servidor." }, 500);
  }
});
