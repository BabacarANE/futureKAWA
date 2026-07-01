import { useEffect, useRef, useState } from 'react'

type RealtimeMessage = {
  type: string
  payload: any
}

export function useRealtime(url?: string) {
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [sensors, setSensors] = useState<Record<string, any>>({})
  const [measures, setMeasures] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [ping, setPing] = useState<number | null>(null)

  useEffect(() => {
    const endpoint = url ?? (import.meta.env.VITE_REALTIME_WS as string) ?? 'ws://localhost:4000/realtime'
    const ws = new WebSocket(endpoint)
    wsRef.current = ws

    let lastPong = Date.now()

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)

    ws.onmessage = (ev) => {
      try {
        const data: RealtimeMessage = JSON.parse(ev.data)
        if (data.type === 'sensor_measure') {
          setMeasures((m) => [data.payload, ...m].slice(0, 50))
          setSensors((s) => ({ ...s, [data.payload.sensor_id]: data.payload }))
        } else if (data.type === 'mqtt_msg') {
          setMessages((ms) => [data.payload, ...ms].slice(0, 100))
        } else if (data.type === 'pong') {
          const now = Date.now()
          setPing(now - (data.payload.ts ?? lastPong))
          lastPong = now
        } else if (data.type === 'conn_status') {
          // Update sensors map connection state
          setSensors((s) => ({ ...s, [data.payload.id]: { ...(s[data.payload.id] ?? {}), connected: data.payload.connected } }))
        }
      } catch (e) {
        // ignore non-json messages
      }
    }

    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping', payload: { ts: Date.now() } }))
      }
    }, 5000)

    return () => {
      clearInterval(pingInterval)
      ws.close()
    }
  }, [url])

  return { connected, sensors, measures, messages, ping }
}

export default useRealtime
