import { useState, FormEvent, useRef } from 'react'
import { createLot, createLotsBatch } from '../services/api'

interface Props {
  countryCode: string
  onClose: () => void
  onCreated: () => void
}

const EXPLOITATIONS: Record<string, { id: number; name: string }[]> = {
  BR: [{ id: 1, name: 'Exploitation Amazonie' }],
  EC: [{ id: 2, name: 'Exploitation Andes' }],
  CO: [{ id: 3, name: 'Exploitation Cauca' }],
}

const WAREHOUSES: Record<string, { id: number; name: string }[]> = {
  BR: [{ id: 1, name: 'Entrepot Principal BR' }],
  EC: [{ id: 2, name: 'Entrepot Principal EC' }],
  CO: [{ id: 3, name: 'Entrepot Principal CO' }],
}

type Tab = 'manual' | 'csv'

export default function NewLotModal({ countryCode, onClose, onCreated }: Props) {
  const [tab, setTab] = useState<Tab>('manual')

  // ── Manuel ──
  const [id, setId] = useState('')
  const [exploitationId, setExploitationId] = useState(
    EXPLOITATIONS[countryCode][0].id
  )
  const [warehouseId, setWarehouseId] = useState(
    WAREHOUSES[countryCode][0].id
  )
  const [qualityNotes, setQualityNotes] = useState('')

  // ── CSV ──
  const fileRef = useRef<HTMLInputElement>(null)
  const [csvResult, setCsvResult] = useState<{
    created: number
    errors: string[]
  } | null>(null)
  const [csvPreview, setCsvPreview] = useState<any[]>([])

  // ── Commun ──
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Template CSV ──
  const downloadTemplate = () => {
    const header = 'id,exploitation_id,warehouse_id,quality_notes'
    const example = `${countryCode}-2026-001,${EXPLOITATIONS[countryCode][0].id},${WAREHOUSES[countryCode][0].id},Arabica premium`
    const blob = new Blob(['\ufeff' + `${header}\n${example}\n`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `template_lots_${countryCode}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── Parse CSV ──
  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const obj: any = {}
      headers.forEach((h, i) => { obj[h] = values[i] ?? '' })
      return {
        id: obj.id,
        exploitation_id: Number(obj.exploitation_id),
        warehouse_id: Number(obj.warehouse_id),
        quality_notes: obj.quality_notes || undefined,
      }
    }).filter(l => l.id)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const parsed = parseCSV(text)
      setCsvPreview(parsed)
      setCsvResult(null)
      setError('')
    }
    reader.readAsText(file, 'UTF-8')
  }

  // ── Submit Manuel ──
  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createLot(countryCode, {
        id,
        exploitation_id: exploitationId,
        warehouse_id: warehouseId,
        quality_notes: qualityNotes || undefined,
      })
      onCreated()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail ?? 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  // ── Submit CSV ──
  const handleCsvSubmit = async () => {
    if (!csvPreview.length) return
    setLoading(true)
    setError('')
    try {
      const result = await createLotsBatch(countryCode, csvPreview)
      setCsvResult(result)
      if (result.created > 0) onCreated()
    } catch {
      setError('Erreur lors de l\'import CSV')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Nouveau lot</h2>
          <button onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-100">
          <button
            onClick={() => setTab('manual')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              tab === 'manual'
                ? 'border-coffee-700 text-coffee-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            ✏️ Saisie manuelle
          </button>
          <button
            onClick={() => setTab('csv')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              tab === 'csv'
                ? 'border-coffee-700 text-coffee-700'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            📄 Import CSV
          </button>
        </div>

        {/* ── Tab Manuel ── */}
        {tab === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID du lot <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value.toUpperCase())}
                placeholder={`${countryCode}-2026-001`}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2
                           text-sm font-mono focus:outline-none
                           focus:ring-2 focus:ring-coffee-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exploitation <span className="text-red-500">*</span>
              </label>
              <select
                value={exploitationId}
                onChange={e => setExploitationId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2
                           text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                {EXPLOITATIONS[countryCode].map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entrepôt <span className="text-red-500">*</span>
              </label>
              <select
                value={warehouseId}
                onChange={e => setWarehouseId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2
                           text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                {WAREHOUSES[countryCode].map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes qualité
              </label>
              <textarea
                value={qualityNotes}
                onChange={e => setQualityNotes(e.target.value)}
                placeholder="Arabica premium, récolte manuelle..."
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2
                           text-sm focus:outline-none focus:ring-2
                           focus:ring-coffee-500 resize-none"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-600 font-medium
                           py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={loading || !id}
                className="flex-1 bg-coffee-700 hover:bg-coffee-500 text-white
                           font-medium py-2.5 rounded-lg transition-colors
                           disabled:opacity-50">
                {loading ? 'Création...' : 'Créer le lot'}
              </button>
            </div>
          </form>
        )}

        {/* ── Tab CSV ── */}
        {tab === 'csv' && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Template CSV</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Télécharge et remplis le modèle
                </p>
              </div>
              <button onClick={downloadTemplate}
                className="text-sm text-coffee-600 hover:text-coffee-800
                           font-medium border border-coffee-200 px-3 py-1.5
                           rounded-lg hover:bg-coffee-50 transition-colors">
                ⬇ Template
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fichier CSV <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2
                           file:px-4 file:rounded-lg file:border-0
                           file:text-sm file:font-medium
                           file:bg-coffee-50 file:text-coffee-700
                           hover:file:bg-coffee-100"
              />
            </div>

            {csvPreview.length > 0 && !csvResult && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">
                  Aperçu — {csvPreview.length} lot(s) détecté(s)
                </p>
                <div className="max-h-40 overflow-y-auto border border-gray-100
                                rounded-lg divide-y divide-gray-50">
                  {csvPreview.map((lot, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                      <span className="font-mono text-xs text-coffee-700 font-medium">
                        {lot.id}
                      </span>
                      <span className="text-xs text-gray-400">
                        {lot.quality_notes || '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {csvResult && (
              <div className={`rounded-xl p-4 ${
                csvResult.errors.length === 0
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <p className="text-sm font-medium text-gray-800">
                  ✅ {csvResult.created} lot(s) créé(s)
                  {csvResult.errors.length > 0 && (
                    <span className="text-amber-600">
                      {' '}— {csvResult.errors.length} erreur(s)
                    </span>
                  )}
                </p>
                {csvResult.errors.map((e, i) => (
                  <p key={i} className="text-xs text-red-600 mt-1">{e}</p>
                ))}
              </div>
            )}

            {error && (
              <p className="text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-600 font-medium
                           py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                {csvResult ? 'Fermer' : 'Annuler'}
              </button>
              {!csvResult && (
                <button
                  onClick={handleCsvSubmit}
                  disabled={loading || csvPreview.length === 0}
                  className="flex-1 bg-coffee-700 hover:bg-coffee-500 text-white
                             font-medium py-2.5 rounded-lg transition-colors
                             disabled:opacity-50"
                >
                  {loading ? 'Import...' : `Importer ${csvPreview.length} lot(s)`}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
