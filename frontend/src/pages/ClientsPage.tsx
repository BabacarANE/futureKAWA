import { useEffect, useState, useCallback, type FormEvent } from 'react'
import {
  Users, Plus, RefreshCw, Search, Pencil, Trash2,
  Building2, Mail, Phone, MapPin, X, Save,
} from 'lucide-react'
import { getAllClients, createClient, updateClient, deleteClient } from '../services/api'
import type { Client } from '../services/api'
import { useAuth } from '../context/AuthContext'

const COUNTRIES = [
  { code: 'BR', label: '🇧🇷 Brésil'   },
  { code: 'EC', label: '🇪🇨 Équateur' },
  { code: 'CO', label: '🇨🇴 Colombie' },
]

const inputCls = `w-full px-3 py-2.5 rounded-lg border border-stone-200 dark:border-white/10
  bg-white dark:bg-white/5 text-sm text-stone-800 dark:text-stone-100
  placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#4a2810]/30
  focus:border-[#4a2810] transition-colors`

const labelCls = 'block text-xs font-medium text-stone-600 dark:text-stone-400 mb-1.5'

interface ClientFormProps {
  initial?: Client | null
  countryCode: string
  onSave: (data: Omit<Client, 'id' | 'country_code'>) => Promise<void>
  onCancel: () => void
}

function ClientForm({ initial, countryCode, onSave, onCancel }: ClientFormProps) {
  const [name,    setName]    = useState(initial?.name    ?? '')
  const [company, setCompany] = useState(initial?.company ?? '')
  const [email,   setEmail]   = useState(initial?.email   ?? '')
  const [phone,   setPhone]   = useState(initial?.phone   ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [notes,   setNotes]   = useState(initial?.notes   ?? '')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Le nom est obligatoire'); return }
    setLoading(true); setError(null)
    try {
      await onSave({
        name:    name.trim(),
        company: company.trim() || null,
        email:   email.trim()   || null,
        phone:   phone.trim()   || null,
        address: address.trim() || null,
        notes:   notes.trim()   || null,
      })
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Nom <span className="text-red-500">*</span></label>
          <input className={inputCls} placeholder="Jean Dupont" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}><Building2 size={11} className="inline mr-1" />Entreprise</label>
          <input className={inputCls} placeholder="Café des Nations" value={company} onChange={e => setCompany(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}><Mail size={11} className="inline mr-1" />Email</label>
          <input type="email" className={inputCls} placeholder="contact@example.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}><Phone size={11} className="inline mr-1" />Téléphone</label>
          <input className={inputCls} placeholder="+33 6 12 34 56 78" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}><MapPin size={11} className="inline mr-1" />Adresse</label>
        <input className={inputCls} placeholder="12 rue de la Paix, Paris, France" value={address} onChange={e => setAddress(e.target.value)} />
      </div>
      <div>
        <label className={labelCls}>Notes</label>
        <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Informations complémentaires…"
          value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 px-1">{error}</p>
      )}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2.5 rounded-lg border border-stone-300 dark:border-white/15
                     text-sm text-stone-600 dark:text-stone-300
                     hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-[#4a2810] hover:bg-[#3d1f0f]
                     text-white text-sm font-medium disabled:opacity-60 transition-colors
                     flex items-center justify-center gap-1.5">
          {loading ? 'Enregistrement…' : <><Save size={13} /> {initial ? 'Mettre à jour' : 'Créer le client'}</>}
        </button>
      </div>
    </form>
  )
}

export default function ClientsPage() {
  const { user } = useAuth()
  const isSiege  = user?.role === 'siege' || user?.role === 'admin'
  const lockedCountry = isSiege ? null : (user?.country_code ?? 'BR')

  const [clients,      setClients]      = useState<Client[]>([])
  const [loading,      setLoading]      = useState(true)
  const [query,        setQuery]        = useState('')
  const [showCreate,   setShowCreate]   = useState(false)
  const [editTarget,   setEditTarget]   = useState<Client | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)
  const [deleting,     setDeleting]     = useState(false)
  const [formCountry,  setFormCountry]  = useState(lockedCountry ?? 'BR')

  const fetchData = useCallback(() => {
    setLoading(true)
    getAllClients()
      .then(setClients)
      .catch(() => setClients([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = clients.filter(c => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.company ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
    )
  })

  const handleCreate = async (data: Omit<Client, 'id' | 'country_code'>) => {
    await createClient(formCountry, data)
    setShowCreate(false)
    fetchData()
  }

  const handleUpdate = async (data: Omit<Client, 'id' | 'country_code'>) => {
    if (!editTarget) return
    await updateClient(editTarget.country_code ?? formCountry, editTarget.id, data)
    setEditTarget(null)
    fetchData()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteClient(deleteTarget.country_code ?? formCountry, deleteTarget.id)
      setDeleteTarget(null)
      fetchData()
    } catch (err: any) {
      alert(err?.response?.data?.detail ?? 'Erreur suppression')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <header className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Users size={22} className="text-stone-600" />
            Clients
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Gestion des clients destinataires</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-stone-200
                       dark:border-white/10 bg-white dark:bg-[#1c1a17] text-stone-500
                       hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl
                       bg-[#4a2810] hover:bg-[#3d1f0f] text-white text-sm font-medium transition-colors">
            <Plus size={15} /> Nouveau client
          </button>
        </div>
      </header>

      {/* Recherche */}
      <div className="relative max-w-sm">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Nom, entreprise, email…"
          className="pl-8 pr-3 py-2 border border-stone-200 dark:border-white/10 rounded-lg text-sm w-full
                     bg-white dark:bg-[#1c1a17] text-stone-800 dark:text-stone-200
                     focus:outline-none focus:ring-2 focus:ring-stone-300 dark:focus:ring-white/20" />
      </div>

      {/* Grille clients */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#1c1a17] rounded-xl border border-stone-100 dark:border-white/10 p-5">
              <div className="h-5 bg-stone-100 dark:bg-white/5 rounded animate-pulse mb-2 w-2/3" />
              <div className="h-3 bg-stone-100 dark:bg-white/5 rounded animate-pulse w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400 dark:text-stone-500">
          <Users size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">{clients.length === 0 ? 'Aucun client enregistré.' : 'Aucun résultat pour cette recherche.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id}
                 className="bg-white dark:bg-[#1c1a17] rounded-xl border border-stone-100 dark:border-white/10
                            p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow">
              {/* Avatar + nom */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-stone-100 dark:bg-white/8 flex items-center justify-center shrink-0">
                    <span className="text-base font-bold text-stone-500 dark:text-stone-400">
                      {c.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{c.name}</p>
                    {c.company && (
                      <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                        <Building2 size={10} /> {c.company}
                      </p>
                    )}
                  </div>
                </div>
                {c.country_code && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 dark:bg-white/8
                                   text-stone-500 dark:text-stone-400 shrink-0">
                    {c.country_code === 'BR' ? '🇧🇷' : c.country_code === 'EC' ? '🇪🇨' : '🇨🇴'}
                  </span>
                )}
              </div>

              {/* Infos */}
              <div className="space-y-1.5">
                {c.email && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                    <Mail size={10} className="shrink-0" />
                    <a href={`mailto:${c.email}`} className="hover:text-blue-600 truncate">{c.email}</a>
                  </p>
                )}
                {c.phone && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                    <Phone size={10} className="shrink-0" /> {c.phone}
                  </p>
                )}
                {c.address && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                    <MapPin size={10} className="shrink-0" />
                    <span className="truncate">{c.address}</span>
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1 border-t border-stone-100 dark:border-white/8 mt-auto">
                <button onClick={() => setEditTarget(c)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs
                             border border-stone-200 dark:border-white/10 text-stone-600 dark:text-stone-300
                             hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                  <Pencil size={11} /> Modifier
                </button>
                <button onClick={() => setDeleteTarget(c)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs
                             border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400
                             hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                  <Trash2 size={11} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-stone-400 dark:text-stone-500 text-right">
          {filtered.length} client{filtered.length > 1 ? 's' : ''}
          {filtered.length !== clients.length ? ` / ${clients.length} au total` : ''}
        </p>
      )}

      {/* Modal création */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-2xl w-full max-w-lg
                          border border-stone-100 dark:border-white/10"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-white/10">
              <div>
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Nouveau client</h2>
                {isSiege && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-stone-400">Pays :</span>
                    <select value={formCountry} onChange={e => setFormCountry(e.target.value)}
                      className="text-xs border border-stone-200 dark:border-white/10 rounded-lg px-2 py-1
                                 bg-white dark:bg-white/5 text-stone-700 dark:text-stone-300">
                      {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <button onClick={() => setShowCreate(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-400
                           hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <ClientForm countryCode={formCountry} onSave={handleCreate} onCancel={() => setShowCreate(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Modal édition */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditTarget(null)}>
          <div className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-2xl w-full max-w-lg
                          border border-stone-100 dark:border-white/10"
               onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 dark:border-white/10">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Modifier le client</h2>
              <button onClick={() => setEditTarget(null)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-stone-400
                           hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="p-6">
              <ClientForm initial={editTarget} countryCode={editTarget.country_code ?? 'BR'} onSave={handleUpdate} onCancel={() => setEditTarget(null)} />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
             onClick={() => setDeleteTarget(null)}>
          <div className="bg-white dark:bg-[#1c1a17] rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4
                          border border-stone-100 dark:border-white/10"
               onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-2">Supprimer le client ?</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-5">
              <strong className="text-stone-700 dark:text-stone-300">{deleteTarget.name}</strong> sera supprimé.
              Les expéditions associées ne seront pas supprimées.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-stone-300 dark:border-white/15 text-stone-600 dark:text-stone-300
                           font-medium py-2.5 rounded-lg hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                Annuler
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium
                           py-2.5 rounded-lg disabled:opacity-50 transition-colors">
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
