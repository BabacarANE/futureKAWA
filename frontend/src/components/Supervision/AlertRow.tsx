type Alert = {
  id?: string | number
  ts?: string
  country?: string
  warehouse?: string
  lot?: string
  sensor?: string
  value?: number | string
  threshold?: number | string
  cause?: string
  severity?: 'critical' | 'important' | 'info'
  metric?: 'temp' | 'humidity' | string
}

const metricIcon = {
  temp: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3a2 2 0 1 0-4 0v11.76A4 4 0 1 0 14 14.76z" />
    </svg>
  ),
  humidity: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2s7 5.5 7 10a7 7 0 1 1-14 0c0-4.5 7-10 7-10z" />
    </svg>
  ),
}

const severityAccent: Record<string, string> = {
  critical: 'border-l-rose-500',
  important: 'border-l-amber-400',
  info: 'border-l-sky-400',
}

function relTime(ts?: string) {
  if (!ts) return '-'
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000)
  if (diff < 1) return "à l'instant"
  if (diff < 60) return `il y a ${diff} min`
  return `il y a ${Math.floor(diff / 60)}h`
}

export default function AlertRow({
  alert,
  onView,
  onResolve,
  onNotify,
}: {
  alert: Alert
  onView?: (a: Alert) => void
  onResolve?: (a: Alert) => void
  onNotify?: (a: Alert) => void
}) {
  const accent = severityAccent[alert.severity ?? 'info']
  const icon = metricIcon[alert.metric as keyof typeof metricIcon]

  const meta = [
    { key: 'country', label: alert.country },
    { key: 'warehouse', label: alert.warehouse },
    { key: 'lot', label: alert.lot },
    { key: 'sensor', label: alert.sensor },
  ].filter((m) => m.label)

  return (
    <article
      className={`bg-white rounded-xl border border-gray-100 border-l-[3px] ${accent} shadow-sm hover:shadow-md transition-shadow p-4`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-gray-800 font-medium text-[13px] leading-snug">
          {icon && <span className="text-gray-500 flex-shrink-0">{icon}</span>}
          {alert.cause ?? 'Condition hors seuil'}
        </div>
        <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
          {relTime(alert.ts)}
        </span>
      </div>

      {/* Meta pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {meta.map(({ key, label }) => (
          <span
            key={key}
            className="text-[11px] bg-gray-50 text-gray-500 rounded px-1.5 py-0.5"
          >
            {label}
          </span>
        ))}
      </div>

      {/* Values */}
      <div className="flex gap-4 text-[12px] text-gray-500 mb-3">
        <span>
          Valeur&nbsp;
          <strong className="text-gray-800 font-medium">{String(alert.value ?? '-')}</strong>
        </span>
        <span>
          Seuil&nbsp;
          <strong className="text-gray-800 font-medium">{String(alert.threshold ?? '-')}</strong>
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView?.(alert)}
          className="flex-1 px-3 py-1.5 text-[12px] rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition"
        >
          Voir
        </button>
        <button
          onClick={() => onResolve?.(alert)}
          className="flex-1 px-3 py-1.5 text-[12px] rounded-lg bg-[#1a2e1a] hover:bg-[#0f2010] text-white transition"
        >
          Résoudre
        </button>
        <button
          onClick={() => onNotify?.(alert)}
          className="flex-1 px-3 py-1.5 text-[12px] rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-100 transition"
        >
          Notifier
        </button>
      </div>
    </article>
  )
}