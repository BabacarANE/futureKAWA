 

export default function ActivityTimeline({ items }: { items: Array<{ id:string; time:string; title:string; desc?:string }> }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-3">Activité récente</h3>
      <div className="space-y-3">
        {items.map(it => (
          <div key={it.id} className="flex items-start gap-3">
            <div className="w-2 h-2 mt-2 rounded-full bg-coffee-700" />
            <div>
              <div className="text-sm font-medium">{it.title}</div>
              <div className="text-xs text-gray-500">{it.time}</div>
              {it.desc && <div className="text-sm text-gray-600 mt-1">{it.desc}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
