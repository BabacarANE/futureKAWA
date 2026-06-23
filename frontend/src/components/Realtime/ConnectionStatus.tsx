export default function ConnectionStatus({ sensors }: { sensors: Record<string, any> }) {
  const items = Object.entries(sensors || {})
  return (
    <div>
      <div className="text-sm text-gray-500 mb-2">État des connexions</div>
      <div className="max-h-36 overflow-auto">
        <ul className="space-y-2 text-sm">
          {items.map(([id, s]: any) => (
            <li key={id} className="flex justify-between items-center bg-slate-50 p-2 rounded">
              <div>{id}</div>
              <div className={`${s.connected ? 'text-green-600' : 'text-red-500'}`}>{s.connected ? 'connected' : 'disconnected'}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
