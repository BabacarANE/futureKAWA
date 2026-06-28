import { Pencil, Trash2, Eye } from 'lucide-react'

type Props = {
  id: string
  name: string
  photo?: string
  country: string
  capacity: number
  lots: number
  temp: number
  humidity: number
  iotStatus: 'online' | 'offline' | 'degraded'
  alerts: number
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onHistory?: () => void
}

function StatusBadge({ status }: { status: 'online' | 'offline' | 'degraded' }) {
  const mapping: Record<string, { bg: string; text: string; label: string }> = {
    online:   { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Online'   },
    degraded: { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Dégradé'  },
    offline:  { bg: 'bg-gray-100',  text: 'text-gray-600',   label: 'Offline'  },
  }
  const m = mapping[status]
  return (
    <div className={`${m.bg} ${m.text} text-xs font-semibold px-3 py-1 rounded-full shrink-0`}>
      {m.label}
    </div>
  )
}

export default function WarehouseCard({
  id, name, photo, country, capacity, lots,
  temp, humidity, iotStatus, alerts,
  onView, onEdit, onDelete, onHistory,
}: Props) {
  return (
    <div className="bg-white dark:bg-[#1c1a17] rounded-2xl p-5 shadow-sm hover:shadow-md
                    transition-all duration-200 flex flex-col
                    border border-stone-100 dark:border-white/5">

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-lg bg-stone-50 dark:bg-white/5
                          flex items-center justify-center shrink-0 overflow-hidden">
            {photo
              ? <img src={photo} alt={name} className="w-full h-full object-cover" />
              : (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-stone-400">
                  <path d="M3 9l9-5 9 5v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )
            }
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">{name}</div>
            <div className="text-xs text-stone-400 mt-0.5">ID {id} · {country}</div>
          </div>
        </div>

        {/* Badge + icônes d'action */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge status={iotStatus} />
          <div className="flex items-center gap-0.5">
            <button onClick={onView} title="Voir"
              className="h-7 w-7 flex items-center justify-center rounded-lg
                         text-stone-400 hover:text-stone-700 dark:hover:text-stone-200
                         hover:bg-stone-100 dark:hover:bg-white/8 transition-colors">
              <Eye size={13} />
            </button>
            <button onClick={onEdit} title="Modifier"
              className="h-7 w-7 flex items-center justify-center rounded-lg
                         text-stone-400 hover:text-amber-600
                         hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
              <Pencil size={13} />
            </button>
            <button onClick={onDelete} title="Supprimer"
              className="h-7 w-7 flex items-center justify-center rounded-lg
                         text-stone-400 hover:text-red-600
                         hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats 2×2 */}
      <div className="grid grid-cols-2 gap-2.5 flex-1">
        <div className="bg-stone-50 dark:bg-white/4 rounded-xl p-3">
          <div className="text-xs text-stone-500 dark:text-stone-400">📦 Lots</div>
          <div className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">{lots}</div>
        </div>
        <div className="bg-stone-50 dark:bg-white/4 rounded-xl p-3">
          <div className="text-xs text-stone-500 dark:text-stone-400">🏭 Exploitation</div>
          <div className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">#{capacity}</div>
        </div>
        <div className="bg-stone-50 dark:bg-white/4 rounded-xl p-3">
          <div className="text-xs text-stone-500 dark:text-stone-400">🌡 Température</div>
          <div className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">{temp > 0 ? `${temp}°C` : '—'}</div>
        </div>
        <div className="bg-stone-50 dark:bg-white/4 rounded-xl p-3">
          <div className="text-xs text-stone-500 dark:text-stone-400">💧 Humidité</div>
          <div className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">{humidity > 0 ? `${humidity}%` : '—'}</div>
        </div>
      </div>

      {/* Bas : alertes + historique */}
      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${alerts > 0 ? 'bg-red-50 text-red-500' : 'bg-stone-50 dark:bg-white/5 text-stone-400'}`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className={`text-sm font-medium ${alerts > 0 ? 'text-red-600' : 'text-stone-500 dark:text-stone-400'}`}>
            {alerts} alerte{alerts !== 1 ? 's' : ''}
          </span>
        </div>
        <button onClick={onHistory}
          className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200
                     underline underline-offset-2 transition-colors">
          Historique
        </button>
      </div>
    </div>
  )
}
