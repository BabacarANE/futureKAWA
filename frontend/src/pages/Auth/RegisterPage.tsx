import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../hooks/useTheme'
import { AuthInput } from '../../components/Auth/AuthInput'
import AuthToast from '../../components/Auth/AuthToast'
import { LOGO_B64 } from '../../assets/logoBase64'
import type { UserRole } from '../../types/auth'
import { ROLE_LABELS } from '../../types/auth'

const REGISTRABLE_ROLES: UserRole[] = [
  'responsable_exploitation', 'responsable_entrepot', 'qualite', 'supply_chain', 'siege',
]

const PASSWORD_STRENGTH = (pwd: string) => {
  let score = 0
  if (pwd.length >= 8) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[0-9]/.test(pwd)) score++
  if (/[^A-Za-z0-9]/.test(pwd)) score++
  return score // 0-4
}
const STRENGTH_LABELS = ['', 'Faible', 'Moyen', 'Fort', 'Très fort']
const STRENGTH_COLORS = ['', 'bg-rose-400', 'bg-amber-400', 'bg-emerald-400', 'bg-emerald-500']

export default function RegisterPage() {
  const { register } = useAuth()
  const { toggle, isDark } = useTheme()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'siege' as UserRole, country: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [mounted, setMounted] = useState(false)
  const [success, setSuccess] = useState(false)

  const strength = PASSWORD_STRENGTH(form.password)

  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim())               e.name = 'Nom requis'
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalide'
    if (form.password.length < 8)        e.password = 'Minimum 8 caractères'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Mots de passe différents'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role, country: form.country || undefined })
      setSuccess(true)
    } catch (err: unknown) {
      setToast({ msg: err instanceof Error ? err.message : 'Erreur lors de l\'inscription', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 px-4">
        <div className={`w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-xl p-8 text-center transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl mx-auto mb-4">✓</div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-white mb-2">Compte créé !</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
            Votre demande a été enregistrée avec le statut <span className="font-medium text-amber-600">En attente</span>. Un administrateur validera votre accès prochainement.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-sm font-medium rounded-xl hover:bg-stone-700 dark:hover:bg-white transition-colors">
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 px-4 py-12">
      <button onClick={toggle} className="fixed top-5 right-5 z-50 w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-all shadow-sm" aria-label="Thème">
        {isDark ? '○' : '◑'}
      </button>

      <div className={`w-full max-w-md transition-all duration-700 ease-out ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-xl overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-amber-700 via-stone-700 to-amber-900" />

          <div className="p-8">
            {/* Header */}
            <div className="flex flex-col items-center mb-7">
              <img src={LOGO_B64} alt="FutureKawa" className="w-16 h-16 object-contain mb-4" />
              <h1 className="text-xl font-bold text-stone-900 dark:text-white">Créer un compte</h1>
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Votre accès sera validé par un administrateur</p>
            </div>

            {toast && <div className="mb-5"><AuthToast message={toast.msg} type={toast.type} onClose={() => setToast(null)} /></div>}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <AuthInput id="name" label="Nom complet" type="text" value={form.name} onChange={set('name')} error={errors.name} leftIcon="👤" placeholder="Marie Dupont" autoComplete="name" required />

              <AuthInput id="email" label="Adresse e-mail" type="email" value={form.email} onChange={set('email')} error={errors.email} leftIcon="@" placeholder="vous@futurekawa.com" autoComplete="email" required />

              <div>
                <AuthInput id="password" label="Mot de passe" type="password" value={form.password} onChange={set('password')} error={errors.password} leftIcon="🔒" placeholder="Minimum 8 caractères" autoComplete="new-password" required />
                {form.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= strength ? STRENGTH_COLORS[strength] : 'bg-stone-100 dark:bg-stone-800'}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-stone-400">{STRENGTH_LABELS[strength]}</p>
                  </div>
                )}
              </div>

              <AuthInput id="confirmPassword" label="Confirmer le mot de passe" type="password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} leftIcon="🔒" placeholder="••••••••" autoComplete="new-password" required />

              {/* Role */}
              <div className="space-y-1.5">
                <label htmlFor="role" className="block text-sm font-medium text-stone-700 dark:text-stone-300">Rôle demandé</label>
                <select
                  id="role"
                  value={form.role}
                  onChange={set('role') as React.ChangeEventHandler<HTMLSelectElement>}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-200 dark:focus:ring-stone-700 transition-all"
                >
                  {REGISTRABLE_ROLES.map(r => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>

              <AuthInput id="country" label="Pays (optionnel)" type="text" value={form.country} onChange={set('country')} leftIcon="◉" placeholder="Brésil, Colombie…" />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl text-sm font-semibold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-white active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2 dark:focus:ring-offset-stone-900 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Création du compte…
                  </span>
                ) : 'Créer mon compte'}
              </button>
            </form>

            <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
              Déjà un compte ?{' '}
              <Link to="/login" className="font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 transition-colors">
                Se connecter
              </Link>
            </p>
          </div>

          <div className="px-8 py-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50 flex justify-between items-center">
            <span className="text-[11px] text-stone-400 dark:text-stone-600">© 2026 FutureKawa</span>
            <span className="text-[11px] text-amber-600 dark:text-amber-500">Inscription sécurisée 🔒</span>
          </div>
        </div>
      </div>
    </div>
  )
}