import { useState, useEffect, type FormEvent } from 'react'
import { X, Truck, MapPin, Hash, Calendar, FileText, User, Plus, Building2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import { createExpedition, getAllClients, createClient } from '../services/api'
import type { Client } from '../services/api'
import type { Lot } from '../types'

interface Props {
  lots:        Lot[]
  countryCode: string
  onClose:     () => void
  onCreated:   () => void
}

const inputCls = `w-full px-3 py-2.5 rounded-lg border border-stone-200 dark:border-white/10
  bg-white dark:bg-white/5 text-sm text-stone-800 dark:text-stone-100
  placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30
  focus:border-blue-500 transition-colors`

const labelCls = 'block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5'

function generateTracking(countryCode: string): string {
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const rand = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `FK-${countryCode}-${date}-${rand}`
}

export default function ExpeditionModal({ lots, countryCode, onClose, onCreated }: Props) {
  const isMulti = lots.length > 1

  // Expedition fields
  const [clientId,         setClientId]         = useState<number | null>(null)
  const [destination,      setDestination]      = useState('')
  const [carrier,          setCarrier]          = useState('')
  const [trackingBase,     setTrackingBase]     = useState(() => generateTracking(countryCode))
  const [estimatedArrival, setEstimatedArrival] = useState('')
  const [notes,            setNotes]            = useState('')

  // Client management
  const [clients,          setClients]          = useState<Client[]>([])
  const [clientSearch,     setClientSearch]     = useState('')
  const [showNewClient,    setShowNewClient]    = useState(false)
  const [newClientName,    setNewClientName]    = useState('')
  const [newClientCompany, setNewClientCompany] = useState('')
  const [newClientEmail,   setNewClientEmail]   = useState('')
  const [creatingClient,   setCreatingClient]   = useState(false)

  // Submission state
  const [loading,   setLoading]   = useState(false)
  const [progress,  setProgress]  = useState<{ done: number; errors: string[] } | null>(null)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    getAllClients().then(setClients).catch(() => {})
  }, [])

  const filteredClients = clients.filter(c =>
    !clientSearch ||
    c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    (c.company ?? '').toLowerCase().includes(clientSearch.toLowerCase())
  )

  const selectedClient = clients.find(c => c.id === clientId)

  const handleCreateClient = async () => {
    if (!newClientName.trim()) return
    setCreatingClient(true)
    try {
      const created = await createClient(countryCode, {
        name:    newClientName.trim(),
        company: newClientCompany.trim() || null,
        email:   newClientEmail.trim() || null,
        phone:   null,
        address: null,
        notes:   null,
      })
      setClients(prev => [...prev, created])
      setClientId(created.id)
      setShowNewClient(false)
      setNewClientName(''); setNewClientCompany(''); setNewClientEmail('')
    } catch {
      // optional — silently fail
    } finally {
      setCreatingClient(false)
    }
  }

  const trackingFor = (index: number) =>
    isMulti ? `${trackingBase}-${index + 1}` : trackingBase

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!destination.trim()) { setError('La destination est obligatoire'); return }
    setLoading(true); setError(null); setProgress(null)

    if (!isMulti) {
      // Single lot — original flow
      try {
        await createExpedition(countryCode, {
          lot_id:            lots[0].id,
          client_id:         clientId,
          destination:       destination.trim(),
          carrier:           carrier.trim() || null,
          tracking_number:   trackingBase.trim() || null,
          estimated_arrival: estimatedArrival || null,
          notes:             notes.trim() || null,
        })
        onCreated()
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Erreur lors de la création')
        setLoading(false)
      }
      return
    }

    // Multi-lot — one expedition per lot
    const errors: string[] = []
    let done = 0
    for (let i = 0; i < lots.length; i++) {
      try {
        await createExpedition(countryCode, {
          lot_id:            lots[i].id,
          client_id:         clientId,
          destination:       destination.trim(),
          carrier:           carrier.trim() || null,
          tracking_number:   trackingFor(i),
          estimated_arrival: estimatedArrival || null,
          notes:             notes.trim() || null,
        })
        done++
      } catch (err: any) {
        errors.push(`${lots[i].id} : ${err?.response?.data?.detail ?? 'erreur'}`)
      }
      setProgress({ done: i + 1, errors: [...errors] })
    }

    setLoading(false)
    if (errors.length === 0) {
      onCreated()
    } else {
      setProgress({ done, errors })
    }
  }

  // After multi-lot with partial errors, allow closing
  const allDone = progress !== null && !loading

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
         onClick={onClose}>
      <div className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-2xl w-full max-w-lg
                      border border-stone-100 dark:border-white/10 max-h-[90vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1c1a17] z-10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center">
              <Truck size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                {isMulti ? `Expédier ${lots.length} lots` : 'Créer une expédition'}
              </h2>
              {!isMulti && (
                <p className="text-xs text-stone-400 mt-0.5">
                  Lot <span className="font-mono font-semibold text-stone-600 dark:text-stone-300">{lots[0].id}</span>
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg
                       text-stone-400 hover:text-stone-700 hover:bg-stone-100
                       dark:hover:text-stone-200 dark:hover:bg-white/8 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* ── Résultat multi-lot ─────────────────────────────────── */}
        {allDone ? (
          <div className="p-6 space-y-4">
            <div className={`flex items-start gap-3 p-4 rounded-xl ${
              progress.errors.length === 0
                ? 'bg-[#fdf6ee] dark:bg-[#4a2810]/20 border border-[#d4b896] dark:border-[#7a4528]/40'
                : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30'
            }`}>
              {progress.errors.length === 0
                ? <CheckCircle2 size={18} className="text-[#7a4528] shrink-0 mt-0.5" />
                : <AlertCircle  size={18} className="text-amber-600 shrink-0 mt-0.5" />}
              <div>
                <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {progress.done - progress.errors.length} / {lots.length} expéditions créées
                </p>
                {progress.errors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {progress.errors.map((e, i) => (
                      <li key={i} className="text-xs text-amber-700 dark:text-amber-400">• {e}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <button onClick={onCreated}
              className="w-full py-2.5 rounded-lg bg-[#4a2810] hover:bg-[#3d1f0f]
                         text-white text-sm font-medium transition-colors">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* ── Liste lots sélectionnés (multi) ─────────────────── */}
            {isMulti && (
              <div>
                <label className={labelCls}>Lots sélectionnés ({lots.length})</label>
                <div className="rounded-lg border border-stone-200 dark:border-white/10 divide-y divide-stone-100 dark:divide-white/5 max-h-32 overflow-y-auto">
                  {lots.map((l, i) => (
                    <div key={l.id} className="flex items-center justify-between px-3 py-2">
                      <span className="font-mono text-xs font-semibold text-stone-700 dark:text-stone-200">{l.id}</span>
                      <span className="text-xs text-stone-400 font-mono">{trackingFor(i)}</span>
                    </div>
                  ))}
                </div>
                {loading && progress && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-stone-100 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all"
                           style={{ width: `${(progress.done / lots.length) * 100}%` }} />
                    </div>
                    <span className="text-xs text-stone-400">{progress.done}/{lots.length}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Client ─────────────────────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1">
                  <User size={11} /> Client destinataire
                </label>
                {!showNewClient && (
                  <button type="button" onClick={() => setShowNewClient(true)}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors">
                    <Plus size={11} /> Nouveau client
                  </button>
                )}
              </div>

              {selectedClient && !showNewClient ? (
                <div className="flex items-center justify-between px-3 py-2.5 rounded-lg
                                bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30">
                  <div>
                    <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{selectedClient.name}</p>
                    {selectedClient.company && (
                      <p className="text-xs text-stone-500 dark:text-stone-400">{selectedClient.company}</p>
                    )}
                  </div>
                  <button type="button" onClick={() => { setClientId(null); setClientSearch('') }}
                    className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
                    Changer
                  </button>
                </div>
              ) : !showNewClient ? (
                <div className="space-y-1.5">
                  <input value={clientSearch} onChange={e => setClientSearch(e.target.value)}
                    placeholder="Rechercher un client…"
                    className={inputCls} />
                  {clientSearch && (
                    <div className="border border-stone-200 dark:border-white/10 rounded-lg overflow-hidden max-h-36 overflow-y-auto">
                      {filteredClients.length === 0 ? (
                        <p className="px-3 py-2 text-xs text-stone-400 italic">Aucun résultat</p>
                      ) : filteredClients.map(c => (
                        <button key={c.id} type="button"
                          onClick={() => { setClientId(c.id); setClientSearch('') }}
                          className="w-full text-left px-3 py-2 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors border-b border-stone-100 dark:border-white/5 last:border-0">
                          <p className="text-sm text-stone-800 dark:text-stone-100">{c.name}</p>
                          {c.company && <p className="text-xs text-stone-400">{c.company}</p>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-blue-200 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-950/10 p-3 space-y-2">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                    <Building2 size={11} /> Nouveau client
                  </p>
                  <input placeholder="Nom *" className={inputCls}
                    value={newClientName} onChange={e => setNewClientName(e.target.value)} />
                  <input placeholder="Entreprise" className={inputCls}
                    value={newClientCompany} onChange={e => setNewClientCompany(e.target.value)} />
                  <input type="email" placeholder="Email" className={inputCls}
                    value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowNewClient(false)}
                      className="flex-1 py-1.5 text-xs border border-stone-300 dark:border-white/15 rounded-lg
                                 text-stone-500 hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                      Annuler
                    </button>
                    <button type="button" onClick={handleCreateClient} disabled={creatingClient || !newClientName.trim()}
                      className="flex-1 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg
                                 disabled:opacity-50 transition-colors">
                      {creatingClient ? 'Création…' : 'Créer'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Destination ─────────────────────────────────────── */}
            <div>
              <label className={labelCls}><MapPin size={11} className="inline mr-1" />Destination <span className="text-red-500">*</span></label>
              <input className={inputCls} placeholder="Ex : Paris, France — Entrepôt Central"
                value={destination} onChange={e => setDestination(e.target.value)} required />
            </div>

            {/* ── Transporteur + N° suivi ──────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}><Truck size={11} className="inline mr-1" />Transporteur</label>
                <input className={inputCls} placeholder="DHL, FedEx, Bolloré…"
                  value={carrier} onChange={e => setCarrier(e.target.value)} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1">
                    <Hash size={11} />{isMulti ? 'Base de suivi' : 'N° de suivi'}
                  </label>
                  <button type="button" title="Régénérer"
                    onClick={() => setTrackingBase(generateTracking(countryCode))}
                    className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors">
                    <RefreshCw size={11} />
                  </button>
                </div>
                <input className={inputCls}
                  value={trackingBase} onChange={e => setTrackingBase(e.target.value)} />
                {isMulti && (
                  <p className="mt-1 text-[10px] text-stone-400">
                    Chaque lot reçoit : <span className="font-mono">{trackingBase}-1</span>, <span className="font-mono">{trackingBase}-2</span>…
                  </p>
                )}
              </div>
            </div>

            {/* ── Date estimée ─────────────────────────────────────── */}
            <div>
              <label className={labelCls}><Calendar size={11} className="inline mr-1" />Date d'arrivée estimée</label>
              <input type="date" className={inputCls}
                value={estimatedArrival} onChange={e => setEstimatedArrival(e.target.value)} />
            </div>

            {/* ── Notes ───────────────────────────────────────────── */}
            <div>
              <label className={labelCls}><FileText size={11} className="inline mr-1" />Notes</label>
              <textarea className={`${inputCls} resize-none`} rows={2}
                placeholder="Instructions spéciales, conditions de transport…"
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            {error && (
              <div className="px-3 py-2.5 rounded-lg bg-red-50 dark:bg-red-950/20
                              border border-red-200 dark:border-red-800/30 text-xs text-red-700 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-white/15
                           text-sm text-stone-600 dark:text-stone-300
                           hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700
                           text-white text-sm font-medium disabled:opacity-60 transition-colors
                           flex items-center justify-center gap-1.5">
                {loading
                  ? <><RefreshCw size={13} className="animate-spin" /> En cours…</>
                  : <><Truck size={13} /> {isMulti ? `Expédier ${lots.length} lots` : 'Expédier le lot'}</>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
