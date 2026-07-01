interface CountryIndicatorProps {
  code: string
  label: string
  color: string
  value?: number
}

export default function CountryIndicator({ code, label, color, value }: CountryIndicatorProps) {
  return (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-coffee-50 dark:hover:bg-coffee-800/50 transition-colors">
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="text-xs font-medium text-coffee-700/50 dark:text-coffee-200/40 uppercase tracking-wide w-7 shrink-0">
        {code}
      </span>
      <span className="text-sm text-coffee-900 dark:text-coffee-50 flex-1">{label}</span>
      {value !== undefined && (
        <span className="text-sm font-semibold text-coffee-900 dark:text-coffee-50">{value}</span>
      )}
    </div>
  )
}
