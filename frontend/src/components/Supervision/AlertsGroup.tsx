import AlertRow from './AlertRow'

const severityConfig = {
  critical: { dot: 'bg-rose-500', badge: 'bg-rose-50 text-rose-700' },
  important: { dot: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700' },
  info: { dot: 'bg-sky-500', badge: 'bg-sky-50 text-sky-700' },
} as const

export default function AlertsGroup({
  title,
  severity = 'info',
  alerts,
  onView,
  onResolve,
  onNotify,
}: {
  title: string
  severity?: 'critical' | 'important' | 'info'
  alerts: any[]
  onView?: (a: any) => void
  onResolve?: (a: any) => void
  onNotify?: (a: any) => void
}) {
  const { dot, badge } = severityConfig[severity]

  return (
    <section className="flex flex-col gap-3">
      {/* Column header */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${dot}`} />
          <h3 className="text-sm font-medium text-gray-800">{title}</h3>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge}`}>
          {alerts.length}
        </span>
      </div>

      {/* Alert list */}
      {alerts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-5 text-xs text-gray-400 text-center">
          Aucune alerte
        </div>
      ) : (
        alerts.map((a) => (
          <AlertRow
            key={a.id ?? a._id ?? Math.random()}
            alert={a}
            onView={onView}
            onResolve={onResolve}
            onNotify={onNotify}
          />
        ))
      )}
    </section>
  )
}