 

type Props = {
  id: string
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
  onHistory?: () => void
}

function StatusBadge({ status }: { status: 'online' | 'offline' | 'degraded' }) {
  const mapping: Record<string, { bg: string; text: string; label: string }> = {
    online: { bg: 'bg-green-50', text: 'text-green-700', label: 'Online' },
    degraded: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Dégradé' },
    offline: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Offline' },
  }
  const m = mapping[status]
  return <div className={`${m.bg} ${m.text} text-xs font-semibold px-3 py-1 rounded-full`}>{m.label}</div>
}

export default function WarehouseCard({ id, photo, country, capacity, lots, temp, humidity, iotStatus, alerts, onView, onEdit, onHistory }: Props) {
  return (
    <div className="bg-white rounded-[16px] p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transform transition-all duration-200 flex flex-col" style={{ minHeight: 320 }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
            {photo ? <img src={photo} alt={`warehouse-${id}`} className="w-full h-full object-cover" /> : <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400"><path d="M3 7v13h18V7L12 2 3 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">Entrepôt {id}</div>
            <div className="text-xs text-gray-500 truncate">{country}</div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <StatusBadge status={iotStatus} />
        </div>
      </div>

      {/* Main info 2x2 grid */}
      <div className="grid grid-cols-2 gap-4 mt-4 flex-1">
        {/** Mini card */}
        <div className="bg-gray-50 rounded-lg p-3 flex flex-col justify-center items-start">
          <div className="text-xs text-gray-500">📦 Lots</div>
          <div className="text-lg font-semibold text-gray-900">{lots}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 flex flex-col justify-center items-start">
          <div className="text-xs text-gray-500">📏 Capacité</div>
          <div className="text-lg font-semibold text-gray-900">{capacity}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 flex flex-col justify-center items-start">
          <div className="text-xs text-gray-500">🌡 Température</div>
          <div className="text-lg font-semibold text-gray-900">{temp}°C</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 flex flex-col justify-center items-start">
          <div className="text-xs text-gray-500">💧 Humidité</div>
          <div className="text-lg font-semibold text-gray-900">{humidity}%</div>
        </div>
      </div>

      {/* Alerts line */}
      <div className="w-full border-t mt-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md ${alerts > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div className="text-sm">
              <div className={`text-sm font-medium ${alerts > 0 ? 'text-red-600' : 'text-gray-600'}`}>{alerts} alertes</div>
              <div className="text-xs text-gray-500">Dernière mise à jour récente</div>
            </div>
          </div>
          <div className="text-xs text-gray-400">Niveau: {alerts > 5 ? 'Critique' : alerts > 0 ? 'Alerte' : 'OK'}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4">
        <div className="flex gap-3">
          <button onClick={onView} className="flex-1 h-10 rounded-md border border-gray-200 bg-white text-sm font-semibold">Voir</button>
          <button onClick={onEdit} className="flex-1 h-10 rounded-md border border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold">Modifier</button>
          <button onClick={onHistory} className="flex-1 h-10 rounded-md bg-coffee-700 text-white text-sm font-semibold">Historique</button>
        </div>
      </div>
    </div>
  )
}
