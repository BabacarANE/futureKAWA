import { useState, useEffect, useRef, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { LOGO_B64 } from '../../assets/logoBase64'

// ─── Coffee beans ─────────────────────────────────────────────────────────────
const BEANS = [
  { top: '8%',  left: '10%', size: 34, delay: 0,   dur: 9,  rot: 18  },
  { top: '70%', left: '6%',  size: 46, delay: 1.2, dur: 11, rot: -24 },
  { top: '18%', left: '85%', size: 38, delay: 0.6, dur: 10, rot: 40  },
  { top: '62%', left: '90%', size: 30, delay: 2,   dur: 8,  rot: -10 },
  { top: '85%', left: '45%', size: 26, delay: 0.4, dur: 12, rot: 60  },
]

function Bean({ top, left, size, delay, dur, rot }: typeof BEANS[0]) {
  return (
    <div style={{ position:'absolute', top, left, opacity:.15,
      animation:`floatBean ${dur}s ease-in-out ${delay}s infinite`,
      transform:`rotate(${rot}deg)` }}>
      <svg viewBox="0 0 40 56" width={size} height={size*1.4}>
        <ellipse cx="20" cy="28" rx="19" ry="27" fill="#E8C9A3"/>
        <path d="M20 1C20 1 14 18 20 28C26 38 20 55 20 55" stroke="#7A4528" strokeWidth="2.5" fill="none"/>
      </svg>
    </div>
  )
}


export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from      = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/'
  const emailRef  = useRef<HTMLInputElement>(null)

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPwd,    setShowPwd]    = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [mounted,    setMounted]    = useState(false)

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }) }, [isAuthenticated])
  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])
  useEffect(() => { emailRef.current?.focus() }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Email et mot de passe requis'); return }
    setLoading(true); setError('')
    try {
      await login({ email, password, rememberMe })
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const axErr = err as { response?: { data?: { detail?: string } } }
      setError(axErr?.response?.data?.detail ?? 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  const inputBase: React.CSSProperties = {
    padding: '10px 12px', borderRadius: 10, fontSize: 13,
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.07)', color: '#fff',
    fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
    transition: 'border-color .15s, box-shadow .15s',
  }

  return (
    <div style={{
      minHeight:'100vh', position:'relative', overflow:'hidden',
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'radial-gradient(circle at 20% 20%, #3a2418 0%, #1c1209 45%, #110a05 100%)',
      padding: 20,
    }}>
      <style>{`
        @keyframes floatBean { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-22px)} }
        @keyframes cardIn { from{opacity:0;transform:translateY(16px) scale(.98)} to{opacity:1;transform:none} }
        .fk-input:focus{outline:none;border-color:#D9A15E!important;box-shadow:0 0 0 3px rgba(217,161,94,.25)}
        .fk-btn-main:hover{background:#8a5230!important}
        .fk-btn-soc:hover{background:rgba(255,255,255,.14)!important}
      `}</style>

      {/* Fond */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        {BEANS.map((b,i) => <Bean key={i} {...b} />)}
      </div>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.3) 100%)', pointerEvents:'none' }} />

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:400,
        opacity: mounted ? 1 : 0, transition:'opacity .5s' }}>

        {/* Logo */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', marginBottom:24 }}>
          <div style={{
            width:96, height:96, borderRadius:'50%',
            background:'#F5F0E8',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:14,
            boxShadow:'0 0 0 6px rgba(245,240,232,.15), 0 0 40px rgba(245,240,232,.2), 0 8px 32px rgba(0,0,0,.5)',
          }}>
            <img src={LOGO_B64} alt="FutureKawa"
              style={{ width:'100%', height:'100%', objectFit:'contain' }} draggable={false} />
          </div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', letterSpacing:'.12em',
            textTransform:'uppercase', marginTop:12 }}>Coffee Intelligence</div>
        </div>

        {/* Carte */}
        <form onSubmit={handleSubmit} noValidate style={{
          width:'100%', background:'rgba(255,255,255,.08)',
          border:'1px solid rgba(255,255,255,.18)', borderRadius:18,
          padding:'2rem', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
          boxShadow:'0 20px 60px rgba(0,0,0,.35)', animation:'cardIn .55s ease-out both',
        }}>
          <div style={{ marginBottom:20, textAlign:'center' }}>
            <div style={{ fontSize:18, fontWeight:500, color:'#fff' }}>Connexion</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.5)', marginTop:4 }}>Accédez à votre tableau de bord</div>
          </div>

          {/* Champs */}
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:16 }}>
            <div>
              <label style={{ fontSize:12, color:'rgba(255,255,255,.75)', display:'block', marginBottom:5 }}>Email</label>
              <input ref={emailRef} className="fk-input" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="vous@futurekawa.com"
                autoComplete="email" required style={inputBase} />
            </div>

            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:5 }}>
                <label style={{ fontSize:12, color:'rgba(255,255,255,.75)' }}>Mot de passe</label>
                <Link to="/forgot-password" style={{ fontSize:11.5, color:'#E3A765', textDecoration:'none' }}>
                  Mot de passe oublié ?
                </Link>
              </div>
              <div style={{ position:'relative' }}>
                <input className="fk-input" type={showPwd ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  autoComplete="current-password" required
                  style={{ ...inputBase, paddingRight:38 }} />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                    background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,.6)', display:'flex' }}>
                  {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                style={{ accentColor:'#D9A15E', width:14, height:14 }} />
              <span style={{ fontSize:12, color:'rgba(255,255,255,.65)' }}>Se souvenir de moi</span>
            </label>
          </div>

          {/* Erreur */}
          {error && (
            <div style={{ marginBottom:12, padding:'8px 10px', borderRadius:8, fontSize:12,
              color:'#FFB4B4', background:'rgba(163,45,45,.25)', border:'1px solid rgba(240,149,149,.3)' }}>
              {error}
            </div>
          )}

          {/* Bouton */}
          <button type="submit" disabled={loading} className="fk-btn-main"
            style={{ width:'100%', padding:'11px', borderRadius:10, border:'none',
              background:'#7A4528', color:'#fff', fontSize:13.5, fontWeight:500,
              cursor: loading ? 'default' : 'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              transition:'background .15s', marginBottom:16, opacity: loading ? .7 : 1 }}>
            {loading
              ? <><Loader2 size={15} style={{ animation:'spin 0.8s linear infinite' }}/> Connexion…</>
              : <>Se connecter <ArrowRight size={15}/></>
            }
          </button>

        </form>

        <div style={{ marginTop:18, textAlign:'center', fontSize:11, color:'rgba(255,255,255,.3)' }}>
          FutureKawa v1.0 · Connexion sécurisée JWT
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}