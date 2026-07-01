import type { ReactNode } from 'react'

interface KpiCardProps {
  title: string
  value: ReactNode
  icon?: ReactNode
  trend?: { value: number; positive?: boolean }
}

export default function KpiCard({ title, value, icon, trend }: KpiCardProps) {
  return (
    <div
      className="bg-white dark:bg-coffee-900 border border-coffee-900/8 dark:border-white/8
                 rounded-2xl p-4 shadow-card dark:shadow-card-dark
                 hover:border-coffee-300/40 dark:hover:border-coffee-300/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium text-coffee-700/60 dark:text-coffee-200/50 leading-snug">
          {title}
        </span>
        {icon && (
          <span className="text-coffee-400 dark:text-coffee-300/70 shrink-0">{icon}</span>
        )}
      </div>
      <div className="mt-2 font-semibold text-coffee-900 dark:text-coffee-50">
        {value}
      </div>
      {trend && (
        <div className={`mt-1 text-xs font-medium ${trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  )
}
