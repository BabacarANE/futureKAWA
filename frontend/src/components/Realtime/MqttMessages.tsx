export default function MqttMessages({ messages }: { messages: any[] }) {
  return (
    <div className="max-h-40 overflow-auto text-sm">
      <ul className="space-y-2">
        {messages.slice(0, 50).map((m: any, i: number) => (
          <li key={i} className="rounded p-2 bg-slate-50">
            <div className="text-xs text-gray-500">{m.topic ?? m.t}</div>
            <div className="text-sm">{typeof m.payload === 'string' ? m.payload : JSON.stringify(m.payload)}</div>
            <div className="text-xs text-gray-400">{m.ts ? new Date(m.ts).toLocaleTimeString() : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
