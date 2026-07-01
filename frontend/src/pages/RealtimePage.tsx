import { useMemo } from 'react'
import useRealtimePolling from '../hooks/useRealtimePolling'
import SensorMap from '../components/Realtime/SensorMap'
import MqttStatus from '../components/Realtime/MqttStatus'
import RealtimeChart from '../components/Realtime/RealtimeChart'
import RecentMeasures from '../components/Realtime/RecentMeasures'
import MqttMessages from '../components/Realtime/MqttMessages'
import ConnectionStatus from '../components/Realtime/ConnectionStatus'
import PingIndicator from '../components/Realtime/PingIndicator'
import LiveAnimation from '../components/Realtime/LiveAnimation'

export default function RealtimePage() {
  const { connected, sensors, measures, messages, ping, loading } =
    useRealtimePolling()

  const connectedCount = useMemo(
    () => Object.values(sensors).filter((s) => s?.connected).length,
    [sensors]
  )

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-coffee-500" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Supervision IoT
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Mesures temps réel — rafraîchissement toutes les 30s
          </p>
        </div>
        <div className="flex items-center gap-4">
          <MqttStatus connected={connected} />
          <PingIndicator ping={ping} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-sm text-gray-500">Capteurs actifs</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            {connectedCount}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Mesures reçues</p>
          <p className="text-3xl font-bold text-coffee-700 mt-1">
            {measures.length}
          </p>
        </div>
        <div className="card text-center">
          <p className="text-sm text-gray-500">Hors seuil</p>
          <p className="text-3xl font-bold text-red-600 mt-1">
            {measures.filter(m => m.status === 'out_of_range').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Colonne gauche */}
        <div className="col-span-7 space-y-6">
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">
              Carte des capteurs
            </h2>
            <SensorMap sensors={sensors} />
          </div>
          <div className="card">
            <h2 className="font-semibold text-gray-800 mb-4">
              Graphique température temps réel
            </h2>
            <RealtimeChart measures={measures} />
          </div>
        </div>

        {/* Colonne droite */}
        <div className="col-span-5 space-y-6">
          <div className="card flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Statut global</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {connectedCount} / 3
              </p>
              <p className="text-xs text-gray-400">capteurs connectés</p>
            </div>
            <LiveAnimation active={connected} />
          </div>

          <div className="card">
            <ConnectionStatus sensors={sensors} />
          </div>

          <div className="card">
            <h3 className="font-medium text-gray-800 mb-3">
              Dernières mesures
            </h3>
            <RecentMeasures measures={measures} />
          </div>

          <div className="card">
            <h3 className="font-medium text-gray-800 mb-3">
              Log des mesures
            </h3>
            <MqttMessages messages={messages} />
          </div>
        </div>
      </div>
    </div>
  )
}
