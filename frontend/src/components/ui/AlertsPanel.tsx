 

export default function AlertsPanel({ alerts }: { alerts: Array<{ id: string; level: string; message: string }> }) {
  return (
    <div className="space-y-3">
      {alerts.slice(0,5).map(a => (
        <div key={a.id} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">🔔</div>
          <div>
            <div className="text-sm font-medium text-gray-800">{a.message}</div>
            <div className="text-xs text-gray-500">Niveau: {a.level}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
