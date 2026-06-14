import type { Alert } from '../types'

interface Props {
  alerts: Alert[]
}

const typeLabel: Record<string, string> = {
  out_of_range: '🌡️ Conditions hors seuil',
  expired_lot:  '⏰ Lot périmé',
}

export default function AlertsBanner({ alerts }: Props) {
  if (!alerts.length) return null

  return (
    <div className="space-y-2">
      {alerts.map(alert => (
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
          <span className="text-xs text-amber-400 whitespace-nowrap">
            {new Date(alert.triggered_at).toLocaleString('fr-FR')}
          </span>
        </div>
      ))}
    </div>
  )
}
