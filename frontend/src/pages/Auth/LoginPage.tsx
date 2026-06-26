import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import AuthToast from '../../components/Auth/AuthToast'
import { LOGO_B64 } from '../../assets/logoBase64'

// ─── Validation ───────────────────────────────────────────────────────────────
function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Email invalide'
}
function validatePassword(v: string) {
  return v.length >= 6 ? '' : 'Mot de passe trop court'
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function MicrosoftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 21 21" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
    </svg>
  )
}

// ─── Coffee bean flottant ─────────────────────────────────────────────────────
function CoffeeBean({ top, left, size, delay, duration, rotate }: {
  top: string; left: string; size: number; delay: number; duration: number; rotate: number
}) {
  return (
    <div
      className="absolute opacity-[0.16]"
      style={{
        top, left, width: size, height: size * 1.4,
        animation: `floatBean ${duration}s ease-in-out ${delay}s infinite`,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      <svg viewBox="0 0 40 56" width={size} height={size * 1.4}>
        <ellipse cx="20" cy="28" rx="19" ry="27" fill="#E8C9A3" />
        <path d="M20 1C20 1 14 18 20 28C26 38 20 55 20 55" stroke="#7A4528" strokeWidth="2.5" fill="none" />
      </svg>
    </div>
  )
}

const BEANS = [
  { top: '8%',  left: '10%', size: 34, delay: 0,   duration: 9,  rotate: 18  },
  { top: '70%', left: '6%',  size: 46, delay: 1.2, duration: 11, rotate: -24 },
  { top: '18%', left: '85%', size: 38, delay: 0.6, duration: 10, rotate: 40  },
  { top: '62%', left: '90%', size: 30, delay: 2,   duration: 8,  rotate: -10 },
  { top: '85%', left: '45%', size: 26, delay: 0.4, duration: 12, rotate: 60  },
  { top: '35%', left: '50%', size: 22, delay: 1.6, duration: 9,  rotate: -30 },
  { top: '50%', left: '20%', size: 20, delay: 2.4, duration: 10, rotate: 12  },
  { top: '25%', left: '65%', size: 18, delay: 0.8, duration: 11, rotate: -45 },
]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, loginWithGoogle, isAuthenticated } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'
  const emailRef  = useRef<HTMLInputElement>(null)

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPwd,    setShowPwd]    = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors,     setErrors]     = useState<{ email?: string; password?: string }>({})
  const [loading,    setLoading]    = useState<'email' | 'google' | 'microsoft' | null>(null)
  const [toast,      setToast]      = useState<{ msg: string; type: 'error' | 'success' | 'info' | 'warning' } | null>(null)
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }) }, [isAuthenticated])
  useEffect(() => { const t = setTimeout(() => setMounted(true), 50); return () => clearTimeout(t) }, [])
  useEffect(() => { emailRef.current?.focus() }, [])

  const validateForm = () => {
    const e: typeof errors = {}
    const emailErr = validateEmail(email)
    const pwdErr   = validatePassword(password)
    if (emailErr) e.email = emailErr
    if (pwdErr)   e.password = pwdErr
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading('email')
    try {
      await login({ email, password, rememberMe })
      setToast({ msg: 'Connexion réussie. Redirection…', type: 'success' })
      setTimeout(() => navigate(from, { replace: true }), 800)
    } catch (err: unknown) {
      setToast({ msg: err instanceof Error ? err.message : 'Erreur de connexion', type: 'error' })
    } finally {
      setLoading(null)
    }
  }

  const handleGoogle = async () => {
    setLoading('google')
    try {
      await loginWithGoogle()
      setToast({ msg: 'Connexion Google réussie !', type: 'success' })
      setTimeout(() => navigate(from, { replace: true }), 800)
    } catch (err: unknown) {
      setToast({ msg: err instanceof Error ? err.message : 'Erreur Google OAuth', type: 'error' })
    } finally {
      setLoading(null)
    }
  }

  const handleMicrosoft = async () => {
    setLoading('microsoft')
    await new Promise(r => setTimeout(r, 1200))
    setToast({ msg: 'Microsoft OAuth — à brancher sur Azure AD', type: 'info' })
    setLoading(null)
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#3a2418_0%,#1c1209_45%,#110a05_100%)] p-5">
      <style>{`
        @keyframes floatBean {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-22px); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px) scale(.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes logoIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fk-input:focus {
          outline: none;
          border-color: #D9A15E !important;
          box-shadow: 0 0 0 3px rgba(217,161,94,0.25);
        }
        .fk-social:hover  { background: rgba(255,255,255,0.16) !important; }
        .fk-submit:hover  { background: #8a5230 !important; }
        .fk-checkbox:focus-within { outline: 2px solid rgba(217,161,94,0.5); border-radius: 4px; }
      `}</style>

      {/* Grains de café animés */}
      <div className="absolute inset-0 pointer-events-none">
        {BEANS.map((b, i) => <CoffeeBean key={i} {...b} />)}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/35" />

      <div
        className="relative z-10 flex flex-col items-center w-full max-w-[400px] transition-opacity duration-500"
        style={{ opacity: mounted ? 1 : 0 }}
      >
        {/* Logo */}
       {/* Logo */}
        <div className="flex flex-col items-center mb-6" style={{ animation: 'logoIn .6s ease-out' }}>
          <div className="w-28 h-28 rounded-full bg-[#FBF6EF] flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
            <img
              src={LOGO_B64}
              alt="FutureKawa"
              width={88}
              height={88}
              className="object-contain"
              draggable={false}
            />
          </div>
          <div className="text-[11px] text-white/50 tracking-[0.12em] uppercase mt-3">
            Coffee Intelligence
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="w-full mb-4">
            <AuthToast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
          </div>
        )}

        {/* Carte glassmorphism */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="w-full bg-white/[0.08] border border-white/[0.18] rounded-[18px] p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          style={{ animation: 'cardIn .55s ease-out .1s both' }}
        >
          <div className="mb-[22px] text-center">
            <div className="text-lg font-medium text-white">Connexion</div>
            <div className="text-xs text-white/55 mt-1">
              Accédez à votre tableau de bord
            </div>
          </div>

          <div className="flex flex-col gap-3.5 mb-[18px]">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-white/75">Adresse email</label>
              <input
                ref={emailRef}
                className="fk-input"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
                placeholder="vous@futurekawa.com"
                autoComplete="email"
                required
                style={{
                  padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 13,
                  fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
                  transition: 'border-color .15s, box-shadow .15s',
                }}
              />
              {errors.email && <span className="text-[11px] text-[#FFB4B4]">⚠ {errors.email}</span>}
            </div>

            {/* Mot de passe */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-baseline">
                <label className="text-xs text-white/75">Mot de passe</label>
                <Link to="/forgot-password" className="text-[11.5px] text-[#E3A765] no-underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  className="fk-input"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  required
                  style={{
                    padding: '10px 12px', paddingRight: 40, borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 13,
                    fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
                    transition: 'border-color .15s, box-shadow .15s',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-white/60 flex"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="text-[11px] text-[#FFB4B4]">⚠ {errors.password}</span>}
            </div>

            {/* Se souvenir de moi */}
            <label className="fk-checkbox flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 cursor-pointer accent-[#D9A15E]"
              />
              <span className="text-xs text-white/65">Se souvenir de moi</span>
            </label>
          </div>

          {/* Bouton principal */}
          <button
            type="submit"
            disabled={loading !== null}
            className="fk-submit w-full py-[11px] rounded-[10px] border-none bg-coffee-700 text-white text-[13.5px] font-medium
                       flex items-center justify-center gap-2 transition-colors mb-[18px] disabled:opacity-70"
            style={{ cursor: loading ? 'default' : 'pointer' }}
          >
            {loading === 'email' ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Connexion en cours…
              </>
            ) : (
              <>Se connecter <ArrowRight size={15} /></>
            )}
          </button>

          {/* Séparateur */}
          <div className="flex items-center gap-2.5 mb-[18px]">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-[11px] text-white/45">ou continuer avec</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          {/* Boutons sociaux */}
          <div className="flex gap-2.5 mb-5">
            <button
              type="button"
              className="fk-social flex-1 flex items-center justify-center gap-2 py-[9px] rounded-[10px] border border-white/20
                         bg-white/[0.07] text-white text-[12.5px] cursor-pointer transition-colors disabled:opacity-60"
              onClick={handleMicrosoft}
              disabled={loading !== null}
            >
              {loading === 'microsoft' ? <Loader2 size={14} className="animate-spin" /> : <MicrosoftIcon />}
              Microsoft
            </button>
            <button
              type="button"
              className="fk-social flex-1 flex items-center justify-center gap-2 py-[9px] rounded-[10px] border border-white/20
                         bg-white/[0.07] text-white text-[12.5px] cursor-pointer transition-colors disabled:opacity-60"
              onClick={handleGoogle}
              disabled={loading !== null}
            >
              {loading === 'google' ? <Loader2 size={14} className="animate-spin" /> : <GoogleIcon />}
              Google
            </button>
          </div>

          {/* Lien inscription */}
          <div className="text-center text-xs text-white/45">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-[#E3A765] no-underline font-medium">
              Créer un compte
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-5 text-[11.5px] text-white/35">
          FutureKawa v1.0 · Connexion sécurisée 🔒
        </div>
      </div>
    </div>
  )
}
