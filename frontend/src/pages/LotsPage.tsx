import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCountryLots } from '../services/api'
import type { Lot } from '../types'

function Row({ lot, onView }: { lot: Lot; onView: () => void }) {
  const statusColor = lot.status === 'expired' ? 'bg-red-50' : lot.status === 'alert' ? 'bg-amber-50' : 'bg-white'
  return (
    <tr className={`${statusColor} hover:bg-gray-50`}>
      <td className="px-4 py-3 text-sm font-mono">{lot.id}</td>
      <td className="px-4 py-3 text-sm">{String(lot.exploitation_id)}</td>
      <td className="px-4 py-3 text-sm">{String(lot.warehouse_id)}</td>
      <td className="px-4 py-3 text-sm">{new Date(lot.storage_date).toLocaleDateString()}</td>
      <td className="px-4 py-3 text-sm">{lot.storage_date ? Math.floor((Date.now() - new Date(lot.storage_date).getTime())/(1000*60*60*24)) + 'd' : '-'}</td>
      <td className="px-4 py-3 text-sm">{lot.status}</td>
      <td className="px-4 py-3 text-sm">-</td>
      <td className="px-4 py-3 text-sm">-</td>
      <td className="px-4 py-3 text-sm">{lot.quality_notes ?? '-'}</td>
      <td className="px-4 py-3 text-sm">
        <div className="flex gap-2">
          <button onClick={onView} className="px-2 py-1 text-sm bg-white border rounded">Voir</button>
        </div>
      </td>
    </tr>
  )
}

export default function LotsPage() {
  const [lots, setLots] = useState<Lot[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [country, _setCountry] = useState('')
  const [warehouse, _setWarehouse] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // load consolidated lots for default country BR
    getCountryLots('BR').then(setLots).catch(() => setLots([]))
  }, [])

  const filtered = lots.filter(l => {
    if (query && !l.id.toLowerCase().includes(query.toLowerCase())) return false
    if (status && l.status !== status) return false
    if (country && String(l.exploitation_id) !== country) return false
    if (warehouse && String(l.warehouse_id) !== warehouse) return false
    return true
  })

  return (
    <div className="p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lots</h1>
          <p className="text-sm text-gray-500">Recherche et tableau moderne des lots</p>
        </div>
        <div className="flex items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher par ID" className="px-3 py-2 border rounded-lg" />
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="">Tous statuts</option>
            <option value="ok">OK</option>
            <option value="warning">Alerte</option>
            <option value="critical">Critique</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-3 py-2 border rounded-lg" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-3 py-2 border rounded-lg" />
        </div>
      </header>

      <div className="bg-white rounded-[12px] shadow-sm overflow-auto">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-xs text-gray-500">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Pays</th>
              <th className="px-4 py-3">Entrepôt</th>
              <th className="px-4 py-3">Date stockage</th>
              <th className="px-4 py-3">Age</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Température</th>
              <th className="px-4 py-3">Humidité</th>
              <th className="px-4 py-3">Qualité</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(lot => (
              <Row key={lot.id} lot={lot} onView={() => navigate(`/lots/${encodeURIComponent(lot.id)}`)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
