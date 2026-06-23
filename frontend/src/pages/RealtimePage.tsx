import { useMemo } from 'react'
import useRealtime from '../hooks/useRealtime'
import SensorMap from '../components/Realtime/SensorMap'
import MqttStatus from '../components/Realtime/MqttStatus'
import RealtimeChart from '../components/Realtime/RealtimeChart'
import RecentMeasures from '../components/Realtime/RecentMeasures'
import MqttMessages from '../components/Realtime/MqttMessages'
import ConnectionStatus from '../components/Realtime/ConnectionStatus'
import PingIndicator from '../components/Realtime/PingIndicator'
import LiveAnimation from '../components/Realtime/LiveAnimation'

export default function RealtimePage() {
  const { connected, sensors, measures, messages, ping } = useRealtime()

  const connectedCount = useMemo(() => Object.values(sensors).filter((s: any) => s?.connected).length, [sensors])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Temps réel</h1>
        <div className="flex items-center gap-4">
          <MqttStatus connected={connected} />
          <PingIndicator ping={ping} />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7 space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-2">Carte des capteurs</h2>
            <SensorMap sensors={sensors} />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium mb-2">Graphique temps réel</h2>
            <RealtimeChart measures={measures} />
          </div>
        </div>

        <div className="col-span-5 space-y-6">
          <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Capteurs connectés</div>
              <div className="text-2xl font-bold">{connectedCount}</div>
            </div>
            <LiveAnimation active={connected} />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <ConnectionStatus sensors={sensors} />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">Dernières mesures</h3>
            <RecentMeasures measures={measures} />
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-2">Derniers messages MQTT</h3>
            <MqttMessages messages={messages} />
          </div>
        </div>
      </div>
    </div>
  )
}
