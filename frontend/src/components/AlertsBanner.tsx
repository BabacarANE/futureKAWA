import { useState } from 'react'
import type { Alert } from '../types'

interface Props {
  alerts: Alert[]
}

const typeLabel: Record<string, string> = {
  out_of_range: '🌡️ Conditions hors seuil',
  expired_lot:  '⏰ Lot périmé',
}

export default function AlertsBanner({ alerts }: Props) {
  const [hidden, setHidden] = useState<Record<string, boolean>>({})

  if (!alerts.length) return null

  const dismiss = (id: number | string) => setHidden(h => ({ ...h, [String(id)]: true }))
  const markAll = () => setHidden(() => Object.fromEntries(alerts.map(a => [a.id, true])))

  return (
    <div className="space-y-2">
      {alerts.length > 1 && (
        <div className="flex justify-end">
          <button onClick={markAll}
            className="text-sm text-coffee-600 hover:underline">Marquer tout lu</button>
        </div>
      )}
      {alerts.map(alert => {
        if (hidden[alert.id]) return null
        return (
          <div
            key={alert.id}
            className="flex items-start gap-3 bg-amber-50 border border-amber-200
                       rounded-xl px-4 py-3"
          >
            <span className="text-amber-500 font-bold text-sm mt-0.5">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">
                {typeLabel[alert.type] ?? alert.type}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">{alert.message}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xs text-amber-400 whitespace-nowrap">
                {new Date(alert.triggered_at).toLocaleString('fr-FR')}
              </span>
              <button onClick={() => dismiss(alert.id)}
                className="text-amber-400 hover:text-amber-600 ml-2">×</button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
