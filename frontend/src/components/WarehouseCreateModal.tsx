import { useEffect, useRef, useState } from 'react'
import api from '../services/api'
import { createExploitation } from '../services/api'

type Exploitation = {
  id: number
  name: string
  country_code: string
  city: string | null
}

type Props = {
  onClose: () => void
  onCreated: () => void
}

const COUNTRIES = [
  { code: 'BR', label: '🇧🇷 Brésil' },
  { code: 'EC', label: '🇪🇨 Équateur' },
  { code: 'CO', label: '🇨🇴 Colombie' },
]

export default function WarehouseCreateModal({ onClose, onCreated }: Props) {
  const nameRef = useRef<HTMLInputElement | null>(null)

  const [country,        setCountry]        = useState('BR')
  const [name,           setName]           = useState('')
  const [location,       setLocation]       = useState('')
  const [exploitationId, setExploitationId] = useState<number | ''>('')
  const [exploitations,  setExploitations]  = useState<Exploitation[]>([])
  const [loadingExplo,   setLoadingExplo]   = useState(false)
  const [loading,        setLoading]        = useState(false)
  const [error,          setError]          = useState('')

  // Sous-formulaire : créer une nouvelle exploitation
  const [showNewExplo,   setShowNewExplo]   = useState(false)
  const [newExploName,   setNewExploName]   = useState('')
  const [newExploCity,   setNewExploCity]   = useState('')
  const [savingExplo,    setSavingExplo]    = useState(false)
  const [exploError,     setExploError]     = useState('')

  const loadExploitations = (countryCode: string) => {
    setExploitationId('')
    setLoadingExplo(true)
    api.get<Exploitation[]>(`/exploitations/${countryCode}`)
      .then(res => {
        // Ne garder que les exploitations du pays sélectionné
        const filtered = res.data.filter(e => e.country_code === countryCode)
        setExploitations(filtered)
      })
      .catch(() => {
        const FALLBACK: Record<string, Exploitation[]> = {
          BR: [{ id: 1, name: 'Exploitation Amazonie', country_code: 'BR', city: 'Manaus'  }],
          EC: [{ id: 2, name: 'Exploitation Andes',    country_code: 'EC', city: 'Quito'   }],
          CO: [{ id: 3, name: 'Exploitation Cauca',    country_code: 'CO', city: 'Popayan' }],
        }
        setExploitations(FALLBACK[countryCode] ?? [])
      })
      .finally(() => setLoadingExplo(false))
  }

  useEffect(() => { loadExploitations(country) }, [country])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    setTimeout(() => nameRef.current?.focus(), 50)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleCreateExploitation = async () => {
    if (!newExploName.trim()) { setExploError('Le nom est obligatoire'); return }
    setExploError(''); setSavingExplo(true)
    try {
      const created = await createExploitation(country, {
        name: newExploName.trim(),
        city: newExploCity.trim() || null,
      })
      setShowNewExplo(false)
      setNewExploName('')
      setNewExploCity('')
      // Recharger la liste et pré-sélectionner la nouvelle exploitation
      loadExploitations(country)
      setExploitationId(created.id)
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setExploError(typeof detail === 'string' ? detail : 'Erreur lors de la création')
    } finally {
      setSavingExplo(false)
    }
  }

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!name.trim())    { setError('Le nom est obligatoire');         return }
    if (!exploitationId) { setError('Sélectionnez une exploitation');  return }
    setError(''); setLoading(true)
    try {
      await api.post(`/warehouses/${country}`, {
        name:            name.trim(),
        location:        location.trim() || null,
        exploitation_id: Number(exploitationId),
      })
      onCreated()
      onClose()
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      if (typeof detail === 'string')   setError(detail)
      else if (Array.isArray(detail))   setError(detail.map((d: any) => d.msg).join(', '))
      else                              setError('Erreur — vérifiez que le backend est démarré')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = `w-full border border-stone-300 dark:border-white/15 rounded-lg px-3 py-2 text-sm
                    bg-white dark:bg-white/5 text-stone-900 dark:text-stone-100
                    focus:outline-none focus:ring-2 focus:ring-stone-400`

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
         onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Nouvel entrepôt"
           onClick={e => e.stopPropagation()}
           className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4
                      border border-stone-100 dark:border-white/10 max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Nouvel entrepôt</h2>
          <button onClick={onClose}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Pays */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Pays <span className="text-red-500">*</span>
            </label>
            <select value={country} onChange={e => setCountry(e.target.value)} className={inputCls}>
              {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Nom de l'entrepôt <span className="text-red-500">*</span>
            </label>
            <input ref={nameRef} value={name} onChange={e => setName(e.target.value)}
              placeholder="Ex: Entrepôt Nord BR" required className={inputCls} />
          </div>

          {/* Localisation */}
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Localisation (optionnelle)
            </label>
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Ex: Zone A — Hangar 3" className={inputCls} />
          </div>

          {/* Exploitation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">
                Exploitation <span className="text-red-500">*</span>
              </label>
              <button type="button" onClick={() => { setShowNewExplo(v => !v); setExploError('') }}
                className="text-xs text-[#7a4528] dark:text-amber-400 hover:underline">
                {showNewExplo ? '— Annuler' : '+ Nouvelle exploitation'}
              </button>
            </div>

            {/* Sous-formulaire nouvelle exploitation */}
            {showNewExplo && (
              <div className="mb-2 p-3 rounded-xl border border-stone-200 dark:border-white/10
                              bg-stone-50 dark:bg-white/4 space-y-2">
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  Créer une exploitation ({country})
                </p>
                <input value={newExploName} onChange={e => setNewExploName(e.target.value)}
                  placeholder="Nom de l'exploitation *"
                  className={inputCls} />
                <input value={newExploCity} onChange={e => setNewExploCity(e.target.value)}
                  placeholder="Ville (optionnelle)"
                  className={inputCls} />
                {exploError && (
                  <p className="text-xs text-red-600 dark:text-red-400">{exploError}</p>
                )}
                <button type="button" onClick={handleCreateExploitation} disabled={savingExplo}
                  className="w-full bg-stone-700 dark:bg-white/10 hover:bg-stone-800 dark:hover:bg-white/15
                             text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50 transition-colors">
                  {savingExplo ? 'Création…' : 'Créer et sélectionner'}
                </button>
              </div>
            )}

            {loadingExplo ? (
              <div className="text-sm text-stone-400 py-2">Chargement des exploitations…</div>
            ) : (
              <select value={exploitationId}
                onChange={e => setExploitationId(e.target.value === '' ? '' : Number(e.target.value))}
                required className={inputCls}>
                <option value="">— Sélectionner une exploitation —</option>
                {exploitations.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}{ex.city ? ` (${ex.city})` : ''}
                  </option>
                ))}
              </select>
            )}

            {!loadingExplo && exploitations.length === 0 && !showNewExplo && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Aucune exploitation pour ce pays. Cliquez sur « + Nouvelle exploitation » pour en créer une.
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800
                            text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-stone-300 dark:border-white/15
                         text-stone-600 dark:text-stone-300 font-medium py-2.5 rounded-lg
                         hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
              Annuler
            </button>
            <button type="submit" disabled={loading || !name || !exploitationId}
              className="flex-1 bg-[#7a4528] hover:bg-[#6a3a20] text-white font-medium
                         py-2.5 rounded-lg disabled:opacity-50 transition-colors">
              {loading ? 'Création…' : "Créer l'entrepôt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
