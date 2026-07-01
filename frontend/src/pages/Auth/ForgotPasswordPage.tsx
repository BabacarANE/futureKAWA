import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../hooks/useTheme'
import { AuthInput } from '../../components/Auth/AuthInput'
import AuthToast from '../../components/Auth/AuthToast'
import { LOGO_B64 } from '../../assets/logoBase64'

export default function ForgotPasswordPage() {
  const { toggle, isDark } = useTheme()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Adresse e-mail invalide'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200)) // simulate API
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 px-4">
      <button onClick={toggle} className="fixed top-5 right-5 z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-all shadow-sm" aria-label="Thème">
        {isDark ? '○' : '◑'}
      </button>

      <div className={`w-full max-w-md transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-700 via-stone-700 to-amber-900" />
          <div className="p-8">
            <div className="flex flex-col items-center mb-7">
              <img src={LOGO_B64} alt="FutureKawa" className="w-14 h-14 object-contain mb-4" />
              <h1 className="text-xl font-bold text-stone-900 dark:text-white">Mot de passe oublié</h1>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 text-center max-w-xs">
                Entrez votre e-mail et nous vous enverrons un lien de réinitialisation
              </p>
            </div>

            {error && <div className="mb-4"><AuthToast message={error} type="error" onClose={() => setError(null)} /></div>}

            {sent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xl mx-auto mb-4">✉</div>
                <p className="text-sm text-stone-700 dark:text-stone-300 font-medium">E-mail envoyé !</p>
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 mb-6">
                  Vérifiez votre boîte de réception pour <strong>{email}</strong>
                </p>
                <Link to="/login" className="text-sm font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 transition-colors">
                  ← Retour à la connexion
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <AuthInput id="reset-email" label="Adresse e-mail" type="email" value={email} onChange={e => setEmail(e.target.value)} leftIcon="@" placeholder="vous@futurekawa.com" autoComplete="email" required />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl text-sm font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-white active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 dark:focus:ring-offset-stone-900"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Envoi en cours…
                    </span>
                  ) : 'Envoyer le lien'}
                </button>
                <p className="text-center">
                  <Link to="/login" className="text-sm text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
                    ← Retour à la connexion
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}