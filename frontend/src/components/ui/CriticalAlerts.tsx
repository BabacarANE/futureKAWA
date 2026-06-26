import { AlertTriangle, ShieldCheck } from 'lucide-react'

interface CriticalAlertItem {
  id: string
  message: string
}

interface CriticalAlertsProps {
  items: CriticalAlertItem[]
}

export default function CriticalAlerts({ items }: CriticalAlertsProps) {
  return (
    <div className="bg-white dark:bg-coffee-900 border border-coffee-900/8 dark:border-white/8 rounded-2xl p-4 shadow-card dark:shadow-card-dark">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-coffee-900 dark:text-coffee-50">Alertes critiques</h3>
        {items.length > 0 && (
          <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center text-center py-6 gap-2">
          <ShieldCheck size={28} className="text-green-500/70" />
          <p className="text-sm text-coffee-700/50 dark:text-coffee-200/40">
            Aucune alerte critique. Tout va bien.
          </p>
        </div>
      ) : (
        <ul className="space-y-2 max-h-56 overflow-y-auto">
          {items.map(item => (
            <li
              key={item.id}
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-red-50/60 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30"
            >
              <AlertTriangle size={15} className="text-red-500 mt-0.5 shrink-0" />
              <span className="text-sm text-coffee-900 dark:text-coffee-50 leading-snug">{item.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
