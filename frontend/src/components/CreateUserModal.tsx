import { useState, type FormEvent } from 'react'
import { X, UserPlus, Eye, EyeOff } from 'lucide-react'
import { createUser } from '../services/api'

const ROLES = [
  { value: 'siege',                   label: 'Siège (accès global)'     },
  { value: 'admin',                   label: 'Admin'                     },
  { value: 'responsable_exploitation',label: 'Responsable exploitation'  },
  { value: 'responsable_entrepot',    label: 'Responsable entrepôt'      },
  { value: 'qualite',                 label: 'Qualité'                   },
  { value: 'supply_chain',            label: 'Supply chain'              },
]

const COUNTRY_CODES = [
  { value: 'BR', label: '🇧🇷 Brésil'   },
  { value: 'EC', label: '🇪🇨 Équateur' },
  { value: 'CO', label: '🇨🇴 Colombie' },
]

const SIEGE_ROLES = ['siege', 'admin']

interface Props {
  onClose: () => void
  onCreated: () => void
}

export default function CreateUserModal({ onClose, onCreated }: Props) {
  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirmPwd,  setConfirmPwd]  = useState('')
  const [role,        setRole]        = useState('responsable_exploitation')
  const [countryCode, setCountryCode] = useState<string>('BR')
  const [showPwd,     setShowPwd]     = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  const isSiegeRole = SIEGE_ROLES.includes(role)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !email.trim() || !password) {
      setError('Tous les champs sont requis')
      return
    }
    if (password !== confirmPwd) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 6) {
      setError('Mot de passe trop court (min 6 caractères)')
      return
    }
    setLoading(true)
    try {
      await createUser({
        name:         name.trim(),
        email:        email.trim().toLowerCase(),
        password,
        role,
        country_code: isSiegeRole ? null : countryCode,
      })
      onCreated()
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full px-3 py-2.5 rounded-lg border border-stone-200 dark:border-white/10
    bg-white dark:bg-white/5 text-sm text-stone-800 dark:text-stone-100
    placeholder:text-stone-400 dark:placeholder:text-stone-500
    focus:outline-none focus:ring-2 focus:ring-[#7a4528]/40 focus:border-[#7a4528]
    transition-colors`

  const labelCls = 'block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5'

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
         onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
           className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-2xl border border-stone-100 dark:border-white/10
                      w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-white/8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#7a4528]/10 flex items-center justify-center">
              <UserPlus size={15} className="text-[#7a4528]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Créer un utilisateur</h2>
              <p className="text-[11px] text-stone-400">Nouvel accès à la plateforme</p>
            </div>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-400
                       hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div>
            <label className={labelCls}>Nom complet</label>
            <input className={inputCls} placeholder="Jean Dupont" value={name}
              onChange={e => setName(e.target.value)} required />
          </div>

          <div>
            <label className={labelCls}>Email</label>
            <input className={inputCls} type="email" placeholder="jean@futurekawa.com" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Mot de passe</label>
              <div className="relative">
                <input className={inputCls} type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••" value={password}
                  onChange={e => setPassword(e.target.value)} required style={{ paddingRight: 36 }} />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPwd ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelCls}>Confirmer</label>
              <input className={inputCls} type={showPwd ? 'text' : 'password'}
                placeholder="••••••••" value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className={labelCls}>Rôle</label>
            <select className={inputCls} value={role} onChange={e => setRole(e.target.value)}>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {!isSiegeRole && (
            <div>
              <label className={labelCls}>Pays rattaché</label>
              <select className={inputCls} value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                {COUNTRY_CODES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-stone-400 mt-1">
                L'utilisateur n'aura accès qu'aux données de ce pays.
              </p>
            </div>
          )}

          {isSiegeRole && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20
                            border border-amber-200 dark:border-amber-800/30 text-xs text-amber-700 dark:text-amber-400">
              <span className="mt-0.5">⚠</span>
              Ce rôle donne accès à tous les pays et à l'administration.
            </div>
          )}

          {error && (
            <div className="px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30
                            text-xs text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-white/15
                         text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-[#7a4528] hover:bg-[#6a3a20]
                         text-white text-sm font-medium disabled:opacity-60 transition-colors
                         flex items-center justify-center gap-1.5">
              {loading ? 'Création…' : <><UserPlus size={13} /> Créer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
