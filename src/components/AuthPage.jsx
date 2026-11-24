import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import './AuthPage.css'

function translateAuthError(message = '') {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-mail ou senha incorretos.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.'
  if (m.includes('user already registered')) return 'Este e-mail já possui uma conta cadastrada.'
  if (m.includes('password should be at least')) return 'A senha deve ter no mínimo 6 caracteres.'
  if (m.includes('rate limit') || m.includes('too many requests')) return 'Muitas tentativas. Aguarde alguns instantes e tente novamente.'
  if (m.includes('provider is not enabled') || m.includes('unsupported provider')) {
    return 'Este provedor social ainda não foi ativado no Supabase (Authentication > Providers).'
  }
  return message || 'Ocorreu um erro. Tente novamente.'
}

export default function AuthPage({ onAuth, recoveryMode = false, onRecoveryDone }) {
  const [mode, setMode] = useState(recoveryMode ? 'recovery' : 'login') // 'login' | 'register' | 'forgot' | 'recovery'
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const canvasRef = useRef(null)

  // Animated background particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }))

    let raf
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(201, 168, 76, ${p.alpha})`
        ctx.fill()
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    const onResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
    setSuccess('')
    setPassword('')
    setConfirmPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuth?.()
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.')
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim() || email.split('@')[0],
            },
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error
        if (data?.session) {
          onAuth?.()
        } else {
          setSuccess('Conta criada! Verifique seu e-mail para confirmar o cadastro.')
        }
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        })
        if (error) throw error
        setSuccess('Enviamos um link de recuperação para o seu e-mail.')
      } else if (mode === 'recovery') {
        if (password.length < 6) {
          throw new Error('A nova senha deve ter no mínimo 6 caracteres.')
        }
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.')
        }
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        setSuccess('Senha redefinida com sucesso! Entrando...')
        setTimeout(() => {
          onRecoveryDone?.()
        }, 1200)
      }
    } catch (err) {
      setError(translateAuthError(err.message))
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider) {
    setError('')
    setSuccess('')
    setOauthLoading(provider)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) throw error
    } catch (err) {
      setError(translateAuthError(err.message))
      setOauthLoading('')
    }
  }

  return (
    <div className="auth-page">
      <canvas ref={canvasRef} className="auth-canvas" />

      <div className="auth-card glass animate-fade-up">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="url(#g)" strokeWidth="1.5"/>
              <path d="M10 16 C10 11, 16 8, 22 16 C16 24, 10 21, 10 16Z" fill="url(#g)" opacity="0.8"/>
              <circle cx="16" cy="16" r="3" fill="url(#g)"/>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C9A84C"/>
                  <stop offset="1" stopColor="#E8C96A"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="auth-title gold-gradient">ECHO SOUL</h1>
            <p className="auth-subtitle">Prompt Generator</p>
          </div>
        </div>

        {/* Mode switcher (login / register) */}
        {(mode === 'login' || mode === 'register') && (
          <div className="auth-mode-switch">
            <button
              type="button"
              className={`auth-mode-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Criar conta
            </button>
          </div>
        )}

        {mode === 'forgot' && (
          <div className="auth-header-context">
            <h2>Recuperar senha</h2>
            <p>Informe seu e-mail para receber um link de redefinição.</p>
          </div>
        )}

        {mode === 'recovery' && (
          <div className="auth-header-context">
            <h2>Definir nova senha</h2>
            <p>Escolha uma nova senha segura para sua conta.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-fullname">Nome completo</label>
              <input
                id="auth-fullname"
                type="text"
                className="form-input"
                placeholder="Como devemos te chamar?"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}

          {mode !== 'recovery' && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-email">E-mail</label>
              <input
                id="auth-email"
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          )}

          {mode !== 'forgot' && (
            <div className="form-group">
              <div className="auth-label-row">
                <label className="form-label" htmlFor="auth-password">
                  {mode === 'recovery' ? 'Nova senha' : 'Senha'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => switchMode('forgot')}
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="auth-input-wrap">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input auth-input-pw"
                  placeholder={mode === 'login' ? '••••••••' : 'Mínimo 6 caracteres'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(v => !v)}
                  title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          )}

          {(mode === 'register' || mode === 'recovery') && (
            <div className="form-group">
              <label className="form-label" htmlFor="auth-confirm-password">Confirmar senha</label>
              <input
                id="auth-confirm-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Repita a senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button
            id="auth-submit-btn"
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading || !!oauthLoading}
          >
            {loading ? (
              <><div className="spinner" /> Aguarde...</>
            ) : mode === 'login' ? (
              'Entrar'
            ) : mode === 'register' ? (
              'Criar minha conta'
            ) : mode === 'forgot' ? (
              'Enviar link de recuperação'
            ) : (
              'Salvar nova senha'
            )}
          </button>

          {mode === 'forgot' && (
            <button
              type="button"
              className="btn btn-ghost auth-back-btn"
              onClick={() => switchMode('login')}
            >
              Voltar para o login
            </button>
          )}
        </form>

        {(mode === 'login' || mode === 'register') && (
          <>
            <div className="auth-divider">
              <span>ou continue com</span>
            </div>

            <div className="auth-social-single">
              <button
                type="button"
                className="auth-social-btn"
                onClick={() => handleOAuth('google')}
                disabled={loading || !!oauthLoading}
              >
                {oauthLoading === 'google' ? (
                  <div className="spinner" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c6.9 0 9.6-4.8 9.6-7.3 0-.5-.1-.9-.1-1.3H12z"/>
                  </svg>
                )}
                Continuar com Google
              </button>
            </div>
          </>
        )}

        <p className="auth-tagline">Late-night sessions. Sophisticated sounds.</p>
      </div>
    </div>
  )
}
