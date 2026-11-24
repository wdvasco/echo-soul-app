import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import './UserSettingsModal.css'

const PROVIDER_LABELS = {
  email: 'E-mail e Senha',
  google: 'Google',
  facebook: 'Facebook',
}

function getInitials(name, email) {
  const source = (name || email || 'U').trim()
  const parts = source.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return source.slice(0, 2).toUpperCase()
}

export default function UserSettingsModal({
  session,
  profile,
  initialTab = 'profile',
  onClose,
  onProfileUpdated,
  onAccountDeleted,
  onToast,
}) {
  const isAdmin = profile?.role === 'admin'
  const [tab, setTab] = useState(initialTab === 'admin' && !isAdmin ? 'profile' : initialTab)

  // Perfil
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })

  // Segurança (Senha)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [savingPw, setSavingPw] = useState(false)
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' })

  // Exclusão de conta
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deletingSelf, setDeletingSelf] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Admin
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [busyUserId, setBusyUserId] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState('')

  const callAccountFn = useCallback(async (payload) => {
    const { data: { session: curSession } } = await supabase.auth.getSession()
    if (!curSession) throw new Error('Sessão expirada. Faça login novamente.')

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/account-management`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${curSession.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(payload),
      }
    )
    const json = await res.json()
    if (!res.ok || json.error) {
      throw new Error(json.error || 'Erro ao processar solicitação.')
    }
    return json
  }, [])

  const loadAdminUsers = useCallback(async () => {
    if (!isAdmin) return
    setLoadingUsers(true)
    setAdminError('')
    try {
      const json = await callAccountFn({ action: 'admin_list_users' })
      setUsers(json.users || [])
    } catch (err) {
      setAdminError(err.message)
    } finally {
      setLoadingUsers(false)
    }
  }, [isAdmin, callAccountFn])

  useEffect(() => {
    if (tab !== 'admin' || !isAdmin) return
    let active = true
    Promise.resolve().then(() => {
      if (active) loadAdminUsers()
    })
    return () => { active = false }
  }, [tab, isAdmin, loadAdminUsers])

  async function handleSaveProfile(e) {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg({ type: '', text: '' })
    try {
      const trimmedName = fullName.trim()
      const trimmedAvatar = avatarUrl.trim() || null

      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: trimmedName || profile?.email?.split('@')[0],
          avatar_url: trimmedAvatar,
        })
        .eq('id', session.user.id)
        .select()
        .single()

      if (error) throw error
      onProfileUpdated?.(data)
      setProfileMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      onToast?.('✓ Perfil atualizado')
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Erro ao atualizar perfil.' })
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPwMsg({ type: '', text: '' })

    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: 'A nova senha deve ter no mínimo 6 caracteres.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'As senhas não coincidem.' })
      return
    }

    setSavingPw(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword('')
      setConfirmPassword('')
      setPwMsg({ type: 'success', text: 'Senha alterada com sucesso!' })
      onToast?.('✓ Senha atualizada')
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Não foi possível alterar a senha.' })
    } finally {
      setSavingPw(false)
    }
  }

  async function handleDeleteSelf() {
    if (deleteConfirmText.trim().toUpperCase() !== 'EXCLUIR') return
    setDeletingSelf(true)
    setDeleteError('')
    try {
      await callAccountFn({ action: 'delete_self' })
      onAccountDeleted?.()
    } catch (err) {
      setDeleteError(err.message)
      setDeletingSelf(false)
    }
  }

  async function handleAdminUpdate(targetUserId, changes) {
    setBusyUserId(targetUserId)
    setAdminError('')
    try {
      const json = await callAccountFn({
        action: 'admin_update_user',
        targetUserId,
        ...changes,
      })
      setUsers(prev =>
        prev.map(u => (u.id === targetUserId ? { ...u, ...json.user } : u))
      )
      onToast?.('✓ Usuário atualizado')
    } catch (err) {
      setAdminError(err.message)
    } finally {
      setBusyUserId('')
    }
  }

  async function handleAdminDelete(targetUserId) {
    if (confirmDeleteId !== targetUserId) {
      setConfirmDeleteId(targetUserId)
      return
    }
    setBusyUserId(targetUserId)
    setAdminError('')
    try {
      await callAccountFn({ action: 'admin_delete_user', targetUserId })
      setUsers(prev => prev.filter(u => u.id !== targetUserId))
      setConfirmDeleteId('')
      onToast?.('✓ Usuário removido')
    } catch (err) {
      setAdminError(err.message)
    } finally {
      setBusyUserId('')
    }
  }

  const filteredUsers = users.filter(u => {
    const q = userSearch.trim().toLowerCase()
    if (!q) return true
    return (
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    )
  })

  const totalAdmins = users.filter(u => u.role === 'admin').length
  const totalActive = users.filter(u => u.status === 'active').length

  return (
    <div className="settings-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="settings-modal glass animate-fade-up">
        {/* Header */}
        <div className="settings-header">
          <div className="settings-title-wrap">
            <h2>Configurações da Conta</h2>
            <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-user'}`}>
              {isAdmin ? 'Administrador' : 'Usuário'}
            </span>
          </div>
          <button className="btn-icon settings-close" onClick={onClose} title="Fechar">✕</button>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button
            className={`settings-tab ${tab === 'profile' ? 'active' : ''}`}
            onClick={() => setTab('profile')}
          >
            👤 Perfil
          </button>
          <button
            className={`settings-tab ${tab === 'security' ? 'active' : ''}`}
            onClick={() => setTab('security')}
          >
            🔒 Segurança
          </button>
          {isAdmin && (
            <button
              className={`settings-tab ${tab === 'admin' ? 'active' : ''}`}
              onClick={() => setTab('admin')}
            >
              🛡 Administração
            </button>
          )}
        </div>

        {/* Body */}
        <div className="settings-body">
          {tab === 'profile' && (
            <div className="settings-section">
              <div className="profile-hero">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-fallback">
                    {getInitials(profile?.full_name, profile?.email)}
                  </div>
                )}
                <div className="profile-hero-info">
                  <div className="profile-hero-name">{profile?.full_name || 'Sem nome'}</div>
                  <div className="profile-hero-email">{profile?.email || session?.user?.email}</div>
                  <div className="profile-hero-meta">
                    <span>Provedor: {PROVIDER_LABELS[profile?.provider] || profile?.provider || 'E-mail'}</span>
                    {profile?.created_at && (
                      <span>• Desde {new Date(profile.created_at).toLocaleDateString('pt-BR')}</span>
                    )}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="settings-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="settings-fullname">Nome de exibição</label>
                  <input
                    id="settings-fullname"
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Seu nome"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="settings-avatar">URL da foto de perfil (opcional)</label>
                  <input
                    id="settings-avatar"
                    type="url"
                    className="form-input"
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">E-mail da conta</label>
                  <input
                    type="email"
                    className="form-input settings-readonly"
                    value={profile?.email || session?.user?.email || ''}
                    disabled
                  />
                </div>

                {profileMsg.text && (
                  <p className={profileMsg.type === 'error' ? 'auth-error' : 'auth-success'}>
                    {profileMsg.text}
                  </p>
                )}

                <div className="settings-actions">
                  <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                    {savingProfile ? <><div className="spinner" /> Salvando...</> : 'Salvar alterações'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {tab === 'security' && (
            <div className="settings-section">
              <div className="settings-card">
                <h3>Alterar Senha</h3>
                <p className="settings-card-desc">
                  {profile?.provider && profile.provider !== 'email'
                    ? `Você entrou com ${PROVIDER_LABELS[profile.provider] || profile.provider}. Você também pode definir uma senha para entrar por e-mail.`
                    : 'Escolha uma nova senha com pelo menos 6 caracteres.'}
                </p>

                <form onSubmit={handleChangePassword} className="settings-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="settings-new-pw">Nova senha</label>
                    <div className="auth-input-wrap">
                      <input
                        id="settings-new-pw"
                        type={showPw ? 'text' : 'password'}
                        className="form-input auth-input-pw"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => setShowPw(v => !v)}
                        tabIndex={-1}
                      >
                        {showPw ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="settings-confirm-pw">Confirmar nova senha</label>
                    <input
                      id="settings-confirm-pw"
                      type={showPw ? 'text' : 'password'}
                      className="form-input"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      minLength={6}
                      required
                    />
                  </div>

                  {pwMsg.text && (
                    <p className={pwMsg.type === 'error' ? 'auth-error' : 'auth-success'}>
                      {pwMsg.text}
                    </p>
                  )}

                  <div className="settings-actions">
                    <button type="submit" className="btn btn-primary" disabled={savingPw}>
                      {savingPw ? <><div className="spinner" /> Atualizando...</> : 'Atualizar senha'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="settings-card danger-zone">
                <h3>Zona de Perigo — Excluir Conta</h3>
                <p className="settings-card-desc">
                  Esta ação é permanente e irreversível. Todos os seus dados e histórico de músicas geradas serão apagados.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="delete-confirm-input">
                    Digite <strong>EXCLUIR</strong> para confirmar
                  </label>
                  <input
                    id="delete-confirm-input"
                    type="text"
                    className="form-input"
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder="EXCLUIR"
                  />
                </div>

                {deleteError && <p className="auth-error">{deleteError}</p>}

                <div className="settings-actions">
                  <button
                    type="button"
                    className="btn btn-danger"
                    disabled={deleteConfirmText.trim().toUpperCase() !== 'EXCLUIR' || deletingSelf}
                    onClick={handleDeleteSelf}
                  >
                    {deletingSelf ? <><div className="spinner" /> Excluindo...</> : 'Excluir minha conta'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'admin' && isAdmin && (
            <div className="settings-section">
              <div className="admin-stats">
                <div className="admin-stat-card">
                  <span className="admin-stat-value">{users.length}</span>
                  <span className="admin-stat-label">Usuários</span>
                </div>
                <div className="admin-stat-card">
                  <span className="admin-stat-value">{totalAdmins}</span>
                  <span className="admin-stat-label">Admins</span>
                </div>
                <div className="admin-stat-card">
                  <span className="admin-stat-value">{totalActive}</span>
                  <span className="admin-stat-label">Ativos</span>
                </div>
              </div>

              <div className="admin-toolbar">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Buscar por nome ou e-mail..."
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={loadAdminUsers}
                  disabled={loadingUsers}
                >
                  ↻ Atualizar
                </button>
              </div>

              {adminError && <p className="auth-error">{adminError}</p>}

              {loadingUsers ? (
                <div className="admin-loading">
                  <div className="spinner" /> Carregando usuários...
                </div>
              ) : (
                <div className="admin-user-list">
                  {filteredUsers.map(u => {
                    const isSelf = u.id === session.user.id
                    const isBusy = busyUserId === u.id
                    return (
                      <div key={u.id} className={`admin-user-row ${u.status === 'suspended' ? 'suspended' : ''}`}>
                        <div className="admin-user-main">
                          <div className="admin-user-avatar">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" />
                            ) : (
                              getInitials(u.full_name, u.email)
                            )}
                          </div>
                          <div className="admin-user-info">
                            <div className="admin-user-name">
                              {u.full_name || u.email.split('@')[0]}
                              {isSelf && <span className="self-tag">Você</span>}
                            </div>
                            <div className="admin-user-email">{u.email}</div>
                            <div className="admin-user-meta">
                              <span>{PROVIDER_LABELS[u.provider] || u.provider}</span>
                              <span>• {u.outputs_count} músicas</span>
                              <span>• {new Date(u.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="admin-user-controls">
                          <select
                            className="form-select admin-role-select"
                            value={u.role}
                            disabled={isSelf || isBusy}
                            onChange={e => handleAdminUpdate(u.id, { role: e.target.value })}
                            title={isSelf ? 'Você não pode alterar seu próprio nível' : 'Alterar nível de acesso'}
                          >
                            <option value="user">Usuário</option>
                            <option value="admin">Admin</option>
                          </select>

                          <button
                            type="button"
                            className={`btn btn-ghost admin-status-btn ${u.status === 'suspended' ? 'is-suspended' : ''}`}
                            disabled={isSelf || isBusy}
                            onClick={() =>
                              handleAdminUpdate(u.id, {
                                status: u.status === 'active' ? 'suspended' : 'active',
                              })
                            }
                            title={u.status === 'active' ? 'Suspender usuário' : 'Reativar usuário'}
                          >
                            {u.status === 'active' ? 'Ativo' : 'Suspenso'}
                          </button>

                          <button
                            type="button"
                            className={`btn admin-delete-btn ${confirmDeleteId === u.id ? 'confirming' : ''}`}
                            disabled={isSelf || isBusy}
                            onClick={() => handleAdminDelete(u.id)}
                            title={confirmDeleteId === u.id ? 'Clique novamente para confirmar exclusão' : 'Excluir usuário'}
                          >
                            {confirmDeleteId === u.id ? 'Confirmar?' : '🗑'}
                          </button>
                        </div>
                      </div>
                    )
                  })}

                  {filteredUsers.length === 0 && (
                    <p className="admin-empty">Nenhum usuário encontrado.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
