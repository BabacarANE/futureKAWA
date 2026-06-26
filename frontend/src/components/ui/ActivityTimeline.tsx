import { Clock } from 'lucide-react'

interface ActivityItem {
  id: string
  time: string
  title: string
  desc: string
}

interface ActivityTimelineProps {
  items: ActivityItem[]
}

export default function ActivityTimeline({ items }: ActivityTimelineProps) {
  return (
    <div className="bg-white dark:bg-coffee-900 border border-coffee-900/8 dark:border-white/8 rounded-2xl p-4 shadow-card dark:shadow-card-dark">
      <h3 className="text-sm font-semibold text-coffee-900 dark:text-coffee-50 mb-3">Activité récente</h3>

      {items.length === 0 ? (
        <div className="flex flex-col items-center text-center py-6 gap-2">
          <Clock size={26} className="text-coffee-300" />
          <p className="text-sm text-coffee-700/50 dark:text-coffee-200/40">
            Aucune activité récente
          </p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item, idx) => (
            <li key={item.id} className="flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-coffee-700 dark:bg-coffee-300 mt-1.5" />
                {idx < items.length - 1 && (
                  <span className="w-px flex-1 bg-coffee-900/10 dark:bg-white/10 mt-1" />
                )}
              </div>
              <div className="pb-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-coffee-900 dark:text-coffee-50 truncate">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-coffee-700/40 dark:text-coffee-200/35 shrink-0">
                    {item.time}
                  </span>
                </div>
                <p className="text-xs text-coffee-700/55 dark:text-coffee-200/45 mt-0.5">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
