 

export default function CriticalAlerts({ items }: { items: Array<{ id:string; message:string }> }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-50 text-red-600 rounded-lg">⚠️</div>
        <h3 className="text-sm font-semibold text-gray-800">Alertes critiques</h3>
      </div>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">Aucune alerte critique</div>
        ) : items.map(it => (
          <div key={it.id} className="flex items-center justify-between p-2 rounded-md bg-red-50 text-red-700">
            <div className="text-sm">{it.message}</div>
            <div className="text-xs font-medium">Critique</div>
          </div>
        ))}
      </div>
    </div>
  )
}
