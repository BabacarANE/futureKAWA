import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CountryCard from '../components/ui/CountryCard'
import CountrySelector from '../components/CountrySelector'

type Country = {
  code: string
  name: string
  warehouses: number
  idealTemp: number
  idealHumidity: number
  lots: number
  alerts: number
}

const SAMPLE: Country[] = [
  { code: 'BR', name: 'Brésil', warehouses: 12, idealTemp: 22, idealHumidity: 60, lots: 128, alerts: 5 },
  { code: 'CO', name: 'Colombie', warehouses: 7, idealTemp: 20, idealHumidity: 58, lots: 72, alerts: 2 },
  { code: 'EC', name: 'Equateur', warehouses: 4, idealTemp: 21, idealHumidity: 62, lots: 41, alerts: 1 },
]

export default function CountriesPage() {
  const [countries] = useState<Country[]>(SAMPLE)
  const [query, setQuery] = useState('')

  const filtered = countries.filter(c => (
    c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase())
  ))

  const navigate = useNavigate()

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des pays</h1>
          <p className="text-sm text-gray-500">Gérer les paramètres et indicateurs par pays</p>
        </div>
        <div className="flex items-center gap-3">
          <CountrySelector selected={filtered[0]?.code ?? 'BR'} onChange={() => {}} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher pays..." className="px-3 py-2 rounded-xl border border-gray-200" />
          <button onClick={() => navigate('/countries/new')} className="bg-coffee-700 text-white px-4 py-2 rounded-xl">Nouveau pays</button>
        </div>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <CountryCard key={c.code} code={c.code} name={c.name} warehouses={c.warehouses} idealTemp={c.idealTemp} idealHumidity={c.idealHumidity} lots={c.lots} alerts={c.alerts}
            onView={() => navigate(`/countries/${c.code}`)} onEdit={() => navigate(`/countries/${c.code}/edit`)} onDashboard={() => navigate(`/?country=${c.code}`)} />
        ))}
      </section>
    </div>
  )
}
