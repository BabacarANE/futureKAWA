 

export default function CountryIndicator({ code, label, color }: { code: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <div className="text-sm">
        <div className="font-medium text-gray-800">{label}</div>
        <div className="text-xs text-gray-500">{code}</div>
      </div>
    </div>
  )
}
