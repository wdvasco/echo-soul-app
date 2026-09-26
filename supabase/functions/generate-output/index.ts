import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isValidOutputPackage(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  const hasB1 = Boolean(obj.bloco1_audio?.titulo && obj.bloco1_audio?.letras && obj.bloco1_audio?.style_tag);
  const hasB2 = Boolean(obj.bloco2_visual?.arte_principal && obj.bloco2_visual?.thumbnail);
  const hasB3 = Boolean(obj.bloco3_youtube?.titulo && obj.bloco3_youtube?.descricao);
  const hasB4 = Boolean(obj.bloco4_seo?.tags_youtube);
  return hasB1 && hasB2 && hasB3 && hasB4;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY not configured. Add it to Edge Function secrets.");
    }

    // 1. Consultar modelos ativos na conta Groq
    let availableModelIds: string[] = [];
    try {
      const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
      });
      if (modelsRes.ok) {
        const modelsJson = await modelsRes.json();
        const allModels: Array<{ id: string }> = modelsJson?.data ?? [];
        availableModelIds = allModels
          .map(m => m.id)
          .filter(id => {
            const low = id.toLowerCase();
            return !low.includes("whisper") &&
                   !low.includes("guard") &&
                   !low.includes("orpheus") &&
                   !low.includes("audio");
          });
      }
    } catch (e) {
      console.warn("Error fetching /v1/models from Groq:", e);
    }

    // Priorizar openai/gpt-oss-20b pois gera a resposta completa sem esgotar tokens de reasoning
    const priorityList = [
      "openai/gpt-oss-20b",
      "openai/gpt-oss-120b",
      "qwen/qwen3.8-27b",
      "allam-2-7b"
    ];

    const modelsToTry: string[] = [];
    for (const p of priorityList) {
      if (availableModelIds.includes(p) && !modelsToTry.includes(p)) {
        modelsToTry.push(p);
      }
    }
    for (const id of availableModelIds) {
      if (!modelsToTry.includes(id)) {
        modelsToTry.push(id);
      }
    }
    if (modelsToTry.length === 0) {
      modelsToTry.push("openai/gpt-oss-20b");
    }

    console.log("Ordered models to try:", JSON.stringify(modelsToTry));

    const body = await req.json();
    const { tema, modo, bpm, genero, moods, instrumentacao, tipo_vocal, style_tag_usuario } = body;

    const moodStr = (moods ?? []).join(", ") || "atmospheric";
    const instrStr = (instrumentacao ?? []).join(", ") || "synthesizers";

    const styleSection = modo === "execucao"
      ? `The user provided these exact technical style keywords that MUST be used as-is: "${style_tag_usuario ?? ''}"`
      : `Architect the full technical style based on: Mood: ${moodStr}. Genre: ${genero}. Instruments: ${instrStr}. BPM: ${bpm}.`;

    const systemPrompt = `You are ECHO SOUL, an AI music production assistant for a DJ with 20+ years of experience.
You generate ready-to-use content packages for SUNO AI and YouTube.
Always respond with valid JSON only. No markdown, no extra text, no explanation.
All content must be in English.
IMPORTANT: You MUST generate all 4 blocks in the JSON: bloco1_audio, bloco2_visual, bloco3_youtube, and bloco4_seo. Do not omit any block!
You MUST include emoji characters exactly as instructed in the description template.`;

    const descTemplate = [
      "Echo Soul is a channel dedicated to the deep and immersive atmosphere of [GENRE] and [RELATED GENRE].",
      "",
      "[ONE PARAGRAPH: atmospheric journey description. Include the song title in quotes, vocal type, key instruments, BPM.]",
      "",
      "Immerse yourself in this [MOOD ADJECTIVE] late-night mood.",
      "",
      "Technical Credits:",
      "\u2022 Genre: [PRIMARY GENRE] / [SECONDARY DESCRIPTOR]",
      "\u2022 Mood: [MOOD 1], [MOOD 2], [MOOD 3]",
      "\u2022 Key Elements: [INSTRUMENT 1], [INSTRUMENT 2], [INSTRUMENT 3]",
      "\u2022 Tempo: [BPM] BPM",
      "",
      "Follow Echo Soul for more curated sound experiences.",
      "",
      "[5-6 HASHTAGS INLINE e.g. #DeepHouse #EchoSoul #LateNight]",
      "",
      "\uD83C\uDF19 [SHORT CINEMATIC TAGLINE SENTENCE.]",
      "",
      "\uD83C\uDFA7 [SHORT SENSORY OR GROOVE TAGLINE SENTENCE.]",
      "",
      "\uD83D\uDD14 Subscribe and turn on notifications to discover new tracks every week."
    ].join("\n");

    const userPrompt = `Generate a complete music production package for these parameters:
- Theme/Title idea: ${tema}
- Mode: ${modo === "execucao" ? "Execution (use exact keywords below)" : "Creation (architect the style)"}
- BPM: ${bpm}
- Genre: ${genero}
- Mood/Atmosphere: ${moodStr}
- Instrumentation: ${instrStr}
- Vocal Type: ${tipo_vocal}
${styleSection}

Return this exact JSON structure with ALL 4 BLOCKS FULLY POPULATED:
{
  "bloco1_audio": {
    "titulo": "2-5 word English song title, dark and evocative",
    "letras": "[Intro]\\nshort instrumental cue\\n\\n[Verse]\\nline 1\\nline 2\\nline 3\\nline 4\\n\\n[Chorus]\\nline 1\\nline 2\\nline 3\\nline 4\\n\\n[Chorus]\\nline 1\\nline 2\\nline 3\\nline 4\\n\\n[Break]\\nline 1\\nline 2\\nline 3\\nline 4\\n\\n[Chorus]\\nline 1\\nline 2\\nline 3\\nline 4\\n\\n[Outro]\\nline 1\\nline 2",
    "style_tag": "8-14 comma-separated SUNO style keywords including BPM, genre, key instruments, vocal type, mood"
  },
  "bloco2_visual": {
    "arte_principal": "Detailed dark urban cinematic image prompt: Scene, Lighting, Color palette, Aesthetic, Atmosphere",
    "thumbnail": "YouTube thumbnail prompt: bold composition, high contrast, readable title, impactful central visual",
    "video_loop": "3-5 sentence urban motion loop for a YouTube visualizer synchronized with the beat, dark aesthetic"
  },
  "bloco3_youtube": {
    "titulo": "[Song Name] | [Emotional Descriptor] | [Genre] Mix | [BPM] BPM",
    "descricao": "FOLLOW THIS TEMPLATE EXACTLY INCLUDING THE EMOJI LINES AT THE END:\\n${descTemplate}",
    "hashtags": ["#DeepHouse","#LateNightVibes","#HouseMusic","#ElectronicMusic","#ChillHouse","#DJMix","#NightDrive","#CinematicHouse","#UndergroundHouse","#SlowBurn","#EchoSoul","#UrbanSeries","#EchoSoulDJ","#SunoAI","#AIMusic"],
    "comentario_fixado": "A short engaging question in English to spark conversation in YouTube comments"
  },
  "bloco4_seo": {
    "tags_youtube": ["deep house 2025","late night house music","chill house mix","underground house","melodic house","house music dj set","night drive music","focus music electronic","study beats house","dark house music","groovy house","soulful house","atmospheric house","cinematic house music","deep house vibes","electronic music mix","dj mix 2025","house music playlist"]
  }
}

MANDATORY RULES:
- Include ALL 4 blocks: bloco1_audio, bloco2_visual, bloco3_youtube, bloco4_seo. Do not skip or truncate bloco3_youtube or bloco4_seo!
- ALL content in English.
- The descricao field MUST end with the 3 emoji lines (🌙, 🎧, 🔔).
- hashtags array: exactly 15 items.
- tags_youtube array: 15-20 plain text tags.`;

    let parsedOutput: Record<string, any> | null = null;
    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const maxTokens = model.includes("qwen") ? 950 : 3500;
        console.log(`Calling model: ${model} with maxTokens: ${maxTokens}`);

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.75,
            max_tokens: maxTokens,
            response_format: { type: "json_object" },
          }),
        });

        if (!groqRes.ok) {
          const errText = await groqRes.text();
          lastError = `Model ${model}: ${errText}`;
          console.warn(`Groq error with model ${model}:`, errText);
          continue;
        }

        const groqData = await groqRes.json();
        const rawText = groqData?.choices?.[0]?.message?.content ?? "";
        if (!rawText) continue;

        const candidateJson = JSON.parse(rawText);
        if (isValidOutputPackage(candidateJson)) {
          parsedOutput = candidateJson;
          console.log(`Full 4-block package validated successfully with model ${model}!`);
          break;
        } else {
          console.warn(`Model ${model} returned incomplete package (missing bloco3 or bloco4). Trying next model...`);
          lastError = `Model ${model} generated incomplete blocks.`;
        }
      } catch (err) {
        lastError = String(err);
        console.warn(`Exception with model ${model}:`, err);
      }
    }

    if (!parsedOutput) {
      throw new Error(`Groq API error: could not generate complete 4-block package. Last error: ${lastError}`);
    }

    // Post-process: ensure emoji footer is present in descricao
    try {
      const b3 = parsedOutput.bloco3_youtube as Record<string, string>;
      if (b3?.descricao && !b3.descricao.includes("\uD83D\uDD14")) {
        b3.descricao = b3.descricao.trimEnd() +
          "\n\n\uD83C\uDF19 Cinematic, emotional, and immersive sound." +
          "\n\n\uD83C\uDFA7 Vibrations between dream and groove." +
          "\n\n\uD83D\uDD14 Subscribe and turn on notifications to discover new tracks every week.";
      }
    } catch { /* ignore */ }

    const { error: insertError } = await supabase.from("outputs").insert({
      user_id: user.id,
      tema, modo, bpm, genero,
      moods: moods ?? [],
      instrumentacao: instrumentacao ?? [],
      tipo_vocal,
      style_tag_usuario: style_tag_usuario ?? null,
      output_json: parsedOutput,
    });

    if (insertError) console.error("Insert error:", JSON.stringify(insertError));

    return new Response(JSON.stringify({ success: true, data: parsedOutput }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", String(err));
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
