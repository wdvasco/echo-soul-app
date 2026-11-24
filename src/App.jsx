import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthPage from './components/AuthPage'
import ConfigPanel from './components/ConfigPanel'
import OutputPanel from './components/OutputPanel'
import HistoryPanel from './components/HistoryPanel'
import UserSettingsModal from './components/UserSettingsModal'
import './App.css'

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200)
    return () => clearTimeout(t)
  }, [onDone])
  return <div className="toast">{message}</div>
}

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [output, setOutput] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [settingsTab, setSettingsTab] = useState(null) // null | 'profile' | 'security' | 'admin'
  const [toasts, setToasts] = useState([])
  const [error, setError] = useState('')

  // Auth state
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setAuthChecked(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (!session) setProfile(null)
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const userId = session?.user?.id
    if (!userId) return
    let active = true
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error: profErr }) => {
        if (active && !profErr && data) {
          setProfile(data)
        }
      })
    return () => { active = false }
  }, [session?.user?.id])

  function addToast(msg) {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg }])
  }

  function removeToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  async function handleGenerate(params) {
    setLoading(true)
    setError('')
    setOutput(null)

    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) throw new Error('Sessão expirada. Faça login novamente.')

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-output`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentSession.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(params),
        }
      )

      const json = await res.json()
      if (!res.ok || !json.success) throw new Error(json.error || 'Erro na geração.')

      let finalData = json.data
      if (params.tipo_geracao === 'suno') {
        finalData = { prompt_suno: json.data.bloco1_audio }
      }

      setOutput(finalData)
      addToast('✓ Output gerado e salvo com sucesso!')
    } catch (err) {
      setError(err.message || 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    setOutput(null)
    setShowHistory(false)
    setSettingsTab(null)
    setProfile(null)
  }

  if (!authChecked) {
    return (
      <div className="app-loading">
        <div className="app-loading-inner">
          <div className="app-loading-logo gold-gradient">ECHO SOUL</div>
          <div className="spinner" style={{ borderColor: 'rgba(201,168,76,0.2)', borderTopColor: '#C9A84C' }} />
        </div>
      </div>
    )
  }

  if (!session || recoveryMode) {
    return (
      <AuthPage
        key={recoveryMode ? 'recovery' : 'auth'}
        recoveryMode={recoveryMode}
        onRecoveryDone={() => setRecoveryMode(false)}
        onAuth={() => {}}
      />
    )
  }

  if (profile?.status === 'suspended') {
    return (
      <div className="app-loading">
        <div className="glass suspended-card">
          <h2 className="gold-gradient">Conta Suspensa</h2>
          <p>
            Seu acesso ao Echo Soul foi temporariamente suspenso por um administrador.
          </p>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Sair da conta
          </button>
        </div>
      </div>
    )
  }

  const userEmail = session.user?.email ?? ''
  const displayName = profile?.full_name || userEmail.split('@')[0]
  const isAdmin = profile?.role === 'admin'

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header glass">
        <div className="header-left">
          <div className="header-logo">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="url(#gh)" strokeWidth="1.5"/>
              <path d="M10 16 C10 11, 16 8, 22 16 C16 24, 10 21, 10 16Z" fill="url(#gh)" opacity="0.8"/>
              <circle cx="16" cy="16" r="3" fill="url(#gh)"/>
              <defs>
                <linearGradient id="gh" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C9A84C"/><stop offset="1" stopColor="#E8C96A"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="header-brand gold-gradient">ECHO SOUL</span>
          </div>
        </div>

        <div className="header-right">
          <button
            id="search-header-btn"
            className="btn btn-ghost header-btn"
            onClick={() => setShowHistory(true)}
            title="Buscar e filtrar músicas criadas"
          >
            🔍 Buscar Músicas
          </button>
          <button
            id="history-btn"
            className="btn btn-ghost header-btn"
            onClick={() => setShowHistory(true)}
            title="Ver histórico de músicas"
          >
            🕐 Histórico
          </button>
          {isAdmin && (
            <button
              id="admin-panel-btn"
              className="btn btn-ghost header-btn header-admin-btn"
              onClick={() => setSettingsTab('admin')}
              title="Painel Administrativo"
            >
              🛡 Admin
            </button>
          )}
          <div className="header-user">
            <button
              id="user-settings-btn"
              className="header-user-trigger"
              onClick={() => setSettingsTab('profile')}
              title="Configurações da conta"
            >
              <span className="header-avatar">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" />
                ) : (
                  displayName.slice(0, 2).toUpperCase()
                )}
              </span>
              <span className="header-email">{displayName}</span>
              {isAdmin && <span className="header-role-pill">ADMIN</span>}
            </button>
            <button
              id="logout-btn"
              className="btn btn-ghost header-btn-sm"
              onClick={handleLogout}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="app-main">
        {/* Sidebar */}
        <aside className="app-sidebar glass">
          <div className="sidebar-inner">
            <ConfigPanel onGenerate={handleGenerate} loading={loading} />
          </div>
        </aside>

        {/* Output */}
        <section className="app-output">
          {error && (
            <div className="app-error">
              <span>⚠ {error}</span>
              <button onClick={() => setError('')} className="btn-icon">✕</button>
            </div>
          )}
          <OutputPanel output={output} loading={loading} />
        </section>
      </main>

      {/* History Panel */}
      {showHistory && (
        <HistoryPanel
          onSelect={setOutput}
          onClose={() => setShowHistory(false)}
        />
      )}

      {/* User Settings & Admin Modal */}
      {settingsTab && (
        <UserSettingsModal
          session={session}
          profile={profile}
          initialTab={settingsTab}
          onClose={() => setSettingsTab(null)}
          onProfileUpdated={(updated) => setProfile(updated)}
          onAccountDeleted={handleLogout}
          onToast={addToast}
        />
      )}

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <Toast key={t.id} message={t.msg} onDone={() => removeToast(t.id)} />
        ))}
      </div>
    </div>
  )
}
