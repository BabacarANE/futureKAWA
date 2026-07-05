import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { getLotsHistory, unshipLot } from '../services/api'
import CountrySelector from '../components/CountrySelector'
import type { Lot } from '../types'

export default function LotHistoryPage() {
  const { user } = useAuth()
  const [country, setCountry] = useState('BR')
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(false)
  const [unshippingId, setUnshippingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const canUnship = user?.role === 'siege'

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getLotsHistory(country)
      setLots(data)
    } finally {
      setLoading(false)
    }
  }, [country])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const handleUnship = async (lotId: string) => {
    if (!confirm(`Annuler l'expédition du lot ${lotId} ?`)) return
    setUnshippingId(lotId)
    setError('')
    try {
      await unshipLot(country, lotId)
      fetchHistory()
    } catch (e: any) {
      setError(e.response?.data?.detail ?? 'Erreur lors de l\'annulation')
    } finally {
      setUnshippingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Historique des expéditions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Lots expédiés — archivés
          </p>
        </div>
        <CountrySelector selected={country} onChange={setCountry} />
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            Lots expédiés
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({lots.length} lots)
            </span>
          </h2>
          <button
            onClick={fetchHistory}
            className="text-xs text-coffee-600 hover:text-coffee-800 font-medium"
          >
            ↻ Actualiser
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8
                            border-b-2 border-coffee-500" />
          </div>
        ) : lots.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Aucun lot expédié pour ce pays.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    ID Lot
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Date stockage
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Date expédition
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Durée stockage
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">
                    Notes qualité
                  </th>
                  {canUnship && (
                    <th className="text-left py-3 px-4 font-medium text-gray-500">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {lots.map((lot) => {
                  const storageDate = new Date(lot.storage_date)
                  const shippedDate = lot.shipped_at
                    ? new Date(lot.shipped_at)
                    : null
                  const days = shippedDate
                    ? Math.floor(
                        (shippedDate.getTime() - storageDate.getTime())
                        / (1000 * 60 * 60 * 24)
                      )
                    : null

                  return (
                    <tr
                      key={lot.id}
                      className="border-b border-gray-50 hover:bg-gray-50
                                 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-coffee-700">
                        {lot.id}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {storageDate.toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {shippedDate
                          ? shippedDate.toLocaleDateString('fr-FR')
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {days !== null ? `${days}j` : '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                        {lot.quality_notes ?? '—'}
                      </td>
                      {canUnship && (
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleUnship(lot.id)}
                            disabled={unshippingId === lot.id}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg
                                       bg-amber-100 text-amber-700 hover:bg-amber-200
                                       transition-colors disabled:opacity-50"
                          >
                            {unshippingId === lot.id ? '...' : '↩ Annuler'}
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
