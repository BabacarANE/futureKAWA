import { useState, useEffect } from 'react'
import CountrySelector from '../components/CountrySelector'
import LotsTable from '../components/LotsTable'
import AlertsBanner from '../components/AlertsBanner'
import { getCountryLots, getCountryAlerts } from '../services/api'
import type { Lot, Alert } from '../types'

export default function DashboardPage() {
  const [country, setCountry] = useState('BR')
  const [lots, setLots] = useState<Lot[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getCountryLots(country),
      getCountryAlerts(country),
    ])
      .then(([l, a]) => {
        setLots(l)
        setAlerts(a)
      })
      .finally(() => setLoading(false))
  }, [country])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivi des stocks — triés par date FIFO
          </p>
        </div>
        <CountrySelector selected={country} onChange={setCountry} />
      </div>

      {alerts.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            ⚠️ Alertes actives ({alerts.length})
          </h2>
          <AlertsBanner alerts={alerts} />
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            Lots stockés
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({lots.length} lots)
            </span>
          </h2>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-500" />
          </div>
        ) : (
          <LotsTable lots={lots} countryCode={country} />
        )}
      </div>
    </div>
  )
}
