export default function LiveAnimation({ active }: { active?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`h-10 w-10 rounded-full ${active ? 'bg-gradient-to-r from-green-400 to-emerald-600 animate-pulse' : 'bg-gray-200'}`} />
      <div className="text-sm">
        <div className="text-xs text-gray-500">Live</div>
        <div className="font-medium">{active ? 'EN DIRECT' : 'INACTIF'}</div>
      </div>
    </div>
  )
}
