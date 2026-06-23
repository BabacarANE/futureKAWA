import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import WarehouseCreateModal from '../components/WarehouseCreateModal'
import WarehouseCard from '../components/ui/WarehouseCard'

type Warehouse = {
  id: string
  photo?: string
  country: string
  capacity: number
  lots: number
  temp: number
  humidity: number
  iotStatus: 'online' | 'offline' | 'degraded'
  alerts: number
}

const SAMPLE: Warehouse[] = [
  { id: 'W-001', country: 'Brésil', capacity: 2000, lots: 120, temp: 22.5, humidity: 58, iotStatus: 'online', alerts: 2 },
  { id: 'W-002', country: 'Colombie', capacity: 1200, lots: 80, temp: 23.1, humidity: 60, iotStatus: 'degraded', alerts: 4 },
  { id: 'W-003', country: 'Equateur', capacity: 900, lots: 40, temp: 21.9, humidity: 61, iotStatus: 'offline', alerts: 1 },
]

export default function WarehousesPage() {
  const [warehouses] = useState<Warehouse[]>(SAMPLE)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)

  const filtered = warehouses.filter(w => w.id.toLowerCase().includes(query.toLowerCase()) || w.country.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Entrepôts</h1>
          <p className="text-sm text-gray-500">Gérer les entrepôts et suivre leur état</p>
        </div>
        <div className="flex items-center gap-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher entrepôts..." className="px-3 py-2 rounded-xl border border-gray-200" />
          <button onClick={() => setShowCreate(true)} className="bg-coffee-700 text-white px-4 py-2 rounded-xl">Nouveau entrepôt</button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(w => (
          <WarehouseCard key={w.id} id={w.id} photo={w.photo} country={w.country} capacity={w.capacity} lots={w.lots} temp={w.temp} humidity={w.humidity} iotStatus={w.iotStatus} alerts={w.alerts}
            onView={() => navigate(`/warehouses/${w.id}`)} onEdit={() => navigate(`/warehouses/${w.id}/edit`)} onHistory={() => navigate(`/warehouses/${w.id}/history`)} />
        ))}
      </section>
      {showCreate && (
        <WarehouseCreateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); /* optionally refresh list */ }} />
      )}
    </div>
  )
}
