import { useState, useEffect, useCallback } from 'react'
import CountrySelector from '../components/CountrySelector'
import LotsTable from '../components/LotsTable'
import AlertsBanner from '../components/AlertsBanner'
import NewLotModal from '../components/NewLotModal'
import { getCountryLots, getCountryAlerts } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Lot, Alert } from '../types'

export default function DashboardPage() {
  const { user } = useAuth()
  const [country, setCountry] = useState('BR')
  const [lots, setLots] = useState<Lot[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const canCreateLot = user?.role === 'responsable_exploitation' ||
                       user?.role === 'responsable_entrepot'

  const fetchData = useCallback(() => {
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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivi des stocks — triés par date FIFO
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CountrySelector selected={country} onChange={setCountry} />
          {canCreateLot && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-coffee-700 hover:bg-coffee-500
                         text-white text-sm font-medium px-4 py-2 rounded-xl
                         transition-colors shadow-sm"
            >
              <span className="text-lg">+</span>
              Nouveau lot
            </button>
          )}
        </div>
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
          <button
            onClick={fetchData}
            className="text-xs text-coffee-600 hover:text-coffee-800 font-medium"
          >
            ↻ Actualiser
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-500" />
          </div>
        ) : (
          <LotsTable lots={lots} countryCode={country} />
        )}
      </div>

      {showModal && (
        <NewLotModal
          countryCode={country}
          onClose={() => setShowModal(false)}
          onCreated={fetchData}
        />
      )}
    </div>
  )
}
