import type { AnalyticsData } from '../../types'

type Props = { data: AnalyticsData | null; loading: boolean }

const ITEMS = [
  { key: 'total_lots',      icon: '📦', label: 'Stocks total',     unit: '',   color: 'text-[#4a2810] dark:text-emerald-400' },
  { key: 'avg_temperature', icon: '🌡', label: 'Temp. moyenne',    unit: '°C', color: 'text-orange-600 dark:text-orange-400' },
  { key: 'avg_humidity',    icon: '💧', label: 'Humidité moyenne', unit: '%',  color: 'text-sky-600 dark:text-sky-400'       },
  { key: 'total_alerts',    icon: '⚠', label: 'Alertes actives',  unit: '',   color: 'text-red-600 dark:text-red-400'       },
] as const

export default function KpiBar({ data, loading }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {ITEMS.map(item => {
        const raw   = data?.summary[item.key as keyof typeof data.summary]
        const value = typeof raw === 'number'
          ? (Number.isInteger(raw) ? raw : raw.toFixed(1))
          : '—'
        return (
          <div key={item.key}
            className="bg-white dark:bg-[#1c1a17] rounded-xl border border-gray-100 dark:border-white/10 p-4">
            <p className="text-xs text-gray-500 dark:text-stone-400 mb-1">{item.icon} {item.label}</p>
            <p className={`text-2xl font-semibold leading-none ${item.color}`}>
              {loading
                ? <span className="text-gray-200 dark:text-stone-700">…</span>
                : <>{value}{item.unit}</>}
            </p>
            <p className="text-xs text-gray-400 dark:text-stone-500 mt-1.5">Temps réel</p>
          </div>
        )
      })}
    </div>
  )
}
