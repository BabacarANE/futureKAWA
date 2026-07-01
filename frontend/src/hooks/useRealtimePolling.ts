import { useState, useEffect, useCallback, useRef } from 'react'
import { getCountryMeasures, getCountryAlerts } from '../services/api'

const COUNTRIES = ['BR', 'EC', 'CO']
const POLL_INTERVAL = 30000

export interface SensorState {
  sensor_id: string
  country: string
  temperature: number
  humidity: number
  status: string
  warehouse_id: number
  ts: number
  connected: boolean
}

export interface MeasureItem {
  sensor_id: string
  country: string
  value: number
  temp: number
  humidity: number
  status: string
  ts: number
}

export function useRealtimePolling() {
  const [connected, setConnected] = useState(false)
  const [sensors, setSensors] = useState<Record<string, SensorState>>({})
  const [measures, setMeasures] = useState<MeasureItem[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [ping, setPing] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchAll = useCallback(async () => {
    const start = Date.now()
    try {
      const results = await Promise.allSettled(
        COUNTRIES.map(async (code) => {
          const ms = await getCountryMeasures(code, undefined)
          return { code, measures: ms }
        })
      )

      const newSensors: Record<string, SensorState> = {}
      const newMeasures: MeasureItem[] = []
      const newMessages: any[] = []

      results.forEach((result) => {
        if (result.status !== 'fulfilled') return
        const { code, measures: ms } = result.value
        if (!ms || ms.length === 0) return

        // Dernière mesure = état actuel du capteur
        const latest = ms[ms.length - 1]
        const sensorId = `esp8266-${code.toLowerCase()}`

        newSensors[sensorId] = {
          sensor_id: sensorId,
          country: code,
          temperature: latest.temperature,
          humidity: latest.humidity,
          status: latest.status,
          warehouse_id: latest.warehouse_id,
          ts: new Date(latest.timestamp).getTime(),
          connected: true,
        }

        // Toutes les mesures pour le graphique
        ms.slice(-20).forEach((m: any) => {
          newMeasures.push({
            sensor_id: sensorId,
            country: code,
            value: m.temperature,
            temp: m.temperature,
            humidity: m.humidity,
            status: m.status,
            ts: new Date(m.timestamp).getTime(),
          })

          // Log MQTT simulé
          newMessages.push({
            topic: `futurekawa/${code.toLowerCase()}/sensors`,
            payload: {
              temperature: m.temperature,
              humidity: m.humidity,
              warehouse_id: m.warehouse_id,
            },
            ts: new Date(m.timestamp).getTime(),
          })
        })
      })

      // Trier les mesures par timestamp
      newMeasures.sort((a, b) => b.ts - a.ts)
      newMessages.sort((a, b) => b.ts - a.ts)

      setSensors(newSensors)
      setMeasures(newMeasures.slice(0, 50))
      setMessages(newMessages.slice(0, 100))
      setConnected(true)
      setPing(Date.now() - start)

    } catch (e) {
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    intervalRef.current = setInterval(fetchAll, POLL_INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [fetchAll])

  return { connected, sensors, measures, messages, ping, loading }
}

export default useRealtimePolling
