export default function PingIndicator({ ping }: { ping: number | null }) {
  const color = ping == null ? 'text-gray-500' : ping < 100 ? 'text-green-600' : ping < 300 ? 'text-amber-600' : 'text-red-600'
  return (
    <div className={`flex flex-col items-end text-sm ${color}`}>
      <div className="font-medium">Ping</div>
      <div>{ping == null ? '—' : `${ping} ms`}</div>
    </div>
  )
}
