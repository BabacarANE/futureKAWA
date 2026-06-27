import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import CountryCard from '../components/ui/CountryCard'
import { getAllCountries } from '../services/api'
import type { ConsolidatedCountry } from '../types'

const FLAG: Record<string, string> = { BR: '🇧🇷', CO: '🇨🇴', EC: '🇪🇨' }
const NAME: Record<string, string> = { BR: 'Brésil', CO: 'Colombie', EC: 'Équateur' }
const IDEAL_TEMP: Record<string, number>     = { BR: 29, CO: 26, EC: 31 }
const IDEAL_HUM:  Record<string, number>     = { BR: 55, CO: 80, EC: 60 }

export default function CountriesPage() {
  const navigate = useNavigate()
  const [countries, setCountries] = useState<ConsolidatedCountry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [query,     setQuery]     = useState('')

  const fetchData = useCallback(() => {
    setLoading(true); setError(null)
    getAllCountries()
      .then(setCountries)
      .catch(() => setError('Impossible de charger les pays — vérifiez la connexion au backend'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = countries.filter(c =>
    (NAME[c.country_code] ?? c.country_code).toLowerCase().includes(query.toLowerCase()) ||
    c.country_code.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des pays</h1>
          <p className="text-sm text-gray-500">Gérer les paramètres et indicateurs par pays</p>
        </div>
        <div className="flex items-center gap-3">
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher pays…"
            className="px-3 py-2 rounded-xl border border-gray-200 text-sm" />
          <button onClick={() => navigate('/countries/new')}
            className="bg-coffee-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-coffee-600 transition-colors">
            + Nouveau pays
          </button>
          <button onClick={fetchData} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
            ↻ Actualiser
          </button>
        </div>
      </header>

      {/* État chargement */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Erreur */}
      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700 text-sm">
          ⚠ {error}
          <button onClick={fetchData} className="ml-3 underline text-rose-600">Réessayer</button>
        </div>
      )}

      {/* Données vides */}
      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🌍</div>
          <p className="text-sm">Aucun pays trouvé. Le backend est-il démarré ?</p>
        </div>
      )}

      {/* Cartes */}
      {!loading && !error && filtered.length > 0 && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <CountryCard
              key={c.country_code}
              code={c.country_code}
              name={NAME[c.country_code] ?? c.country_code}
              warehouses={Array.from(new Set((c.lots ?? []).map((l: any) => l.warehouse_id))).length}
              idealTemp={IDEAL_TEMP[c.country_code] ?? 25}
              idealHumidity={IDEAL_HUM[c.country_code] ?? 60}
              lots={(c.lots ?? []).length}
              alerts={(c.alerts ?? []).length}
              onView={()      => navigate(`/countries/${c.country_code}`)}
              onEdit={()      => navigate(`/countries/${c.country_code}/edit`)}
              onDashboard={()  => navigate(`/?country=${c.country_code}`)}
            />
          ))}
        </section>
      )}

      {/* KPI bas de page */}
      {!loading && countries.length > 0 && (
        <div className="grid grid-cols-3 gap-4 pt-2">
          {[
            { label: 'Total pays actifs',  value: countries.length },
            { label: 'Total lots',         value: countries.reduce((s,c) => s + (c.lots?.length ?? 0), 0) },
            { label: 'Total alertes',      value: countries.reduce((s,c) => s + (c.alerts?.length ?? 0), 0) },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{k.value}</div>
              <div className="text-xs text-gray-500 mt-1">{k.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}