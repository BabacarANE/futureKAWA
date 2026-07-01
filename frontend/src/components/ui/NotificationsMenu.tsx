import { useState, useRef, useEffect } from 'react'
import { Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react'
import type { Alert } from '../../types'

interface NotificationsMenuProps {
  alerts: Alert[]
}

function iconForLevel(level?: string) {
  switch (level) {
    case 'critical':
      return <AlertTriangle size={15} className="text-red-500" />
    case 'success':
      return <CheckCircle2 size={15} className="text-green-500" />
    default:
      return <Info size={15} className="text-coffee-400" />
  }
}

export default function NotificationsMenu({ alerts }: NotificationsMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])

  const count = alerts.length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Notifications"
        className="relative p-2 rounded-lg border border-coffee-900/10 dark:border-white/10
                   bg-white dark:bg-coffee-900/40 hover:bg-coffee-50 dark:hover:bg-coffee-900/70
                   transition-colors text-coffee-900 dark:text-coffee-50"
      >
        <Bell size={16} />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white
                            text-[10px] font-semibold flex items-center justify-center leading-none">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-coffee-900/10
                     dark:border-white/10 bg-white dark:bg-coffee-900 shadow-card dark:shadow-card-dark z-50"
        >
          <div className="px-3.5 py-2.5 border-b border-coffee-900/10 dark:border-white/10 flex items-center justify-between sticky top-0 bg-white dark:bg-coffee-900">
            <span className="text-sm font-semibold text-coffee-900 dark:text-coffee-50">Notifications</span>
            <span className="text-xs text-coffee-700/50 dark:text-coffee-200/40">{count} active{count !== 1 ? 's' : ''}</span>
          </div>

          {alerts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-coffee-700/50 dark:text-coffee-200/40">
              Aucune notification pour le moment
            </div>
          ) : (
            <ul>
              {alerts.map(a => (
                <li
                  key={a.id}
                  className="px-3.5 py-2.5 border-b last:border-b-0 border-coffee-900/5 dark:border-white/5
                             hover:bg-coffee-50 dark:hover:bg-coffee-800/60 transition-colors flex gap-2.5"
                >
                  <div className="mt-0.5 shrink-0">{iconForLevel((a as any).level)}</div>
                  <div className="min-w-0">
                    <p className="text-sm text-coffee-900 dark:text-coffee-50 leading-snug">
                      {(a as any).message ?? 'Alerte'}
                    </p>
                    {(a as any).warehouse_id && (
                      <p className="text-xs text-coffee-700/50 dark:text-coffee-200/40 mt-0.5">
                        Entrepôt {(a as any).warehouse_id}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
