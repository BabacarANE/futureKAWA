import type { ReactNode } from 'react'
import type { Severity, WarehouseStatus, LotStatus } from '../../types'

// ─── Page wrapper ─────────────────────────────────────────────────────────────
export function PageHeader({
  title, subtitle, action,
}: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
export function KpiCard({
  label, value, unit, delta, icon, color = 'emerald',
}: {
  label: string; value: string | number; unit?: string
  delta?: number; icon: string; color?: string
}) {
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700',
    rose:    'bg-rose-50 text-rose-700',
    amber:   'bg-amber-50 text-amber-700',
    sky:     'bg-sky-50 text-sky-700',
    stone:   'bg-stone-100 text-stone-600',
  }
  const cls = colorMap[color] ?? colorMap.emerald
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${cls}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className="text-2xl font-semibold text-gray-900">
          {value}{unit && <span className="text-base font-normal text-gray-500 ml-1">{unit}</span>}
        </div>
        {delta !== undefined && (
          <div className={`text-xs mt-1 ${delta >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}% vs hier
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Severity badge ───────────────────────────────────────────────────────────
export function SeverityBadge({ severity }: { severity: Severity }) {
  const map: Record<Severity, string> = {
    critical:  'bg-rose-50 text-rose-700 border border-rose-200',
    important: 'bg-amber-50 text-amber-700 border border-amber-200',
    info:      'bg-sky-50 text-sky-700 border border-sky-200',
  }
  const labels: Record<Severity, string> = {
    critical: 'Critique', important: 'Important', info: 'Info',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[severity]}`}>
      {labels[severity]}
    </span>
  )
}

// ─── Warehouse status badge ───────────────────────────────────────────────────
export function StatusBadge({ status }: { status: WarehouseStatus }) {
  const map: Record<WarehouseStatus, { cls: string; label: string }> = {
    online:   { cls: 'text-emerald-700', label: 'Online' },
    degraded: { cls: 'text-amber-600',   label: 'Dégradé' },
    offline:  { cls: 'text-gray-400',    label: 'Offline' },
  }
  const { cls, label } = map[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'online' ? 'bg-emerald-500' : status === 'degraded' ? 'bg-amber-400' : 'bg-gray-300'}`} />
      {label}
    </span>
  )
}

// ─── Lot status badge ─────────────────────────────────────────────────────────
export function LotStatusBadge({ status }: { status: LotStatus }) {
  const map: Record<LotStatus, string> = {
    en_stock:    'bg-emerald-50 text-emerald-700',
    en_transit:  'bg-sky-50 text-sky-700',
    expedie:     'bg-stone-100 text-stone-600',
    quarantaine: 'bg-rose-50 text-rose-700',
  }
  const labels: Record<LotStatus, string> = {
    en_stock: 'En stock', en_transit: 'En transit', expedie: 'Expédié', quarantaine: 'Quarantaine',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status]}`}>
      {labels[status]}
    </span>
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
export function ProgressBar({
  value, max, color = 'emerald', showLabel = false,
}: { value: number; max: number; color?: string; showLabel?: boolean }) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-500', rose: 'bg-rose-500', amber: 'bg-amber-400', sky: 'bg-sky-500',
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${colorMap[color] ?? colorMap.emerald}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs text-gray-500 w-10 text-right">{pct}%</span>}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, body }: { icon: string; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3 text-gray-300">{icon}</div>
      <div className="text-sm font-medium text-gray-500">{title}</div>
      {body && <div className="text-xs text-gray-400 mt-1 max-w-xs">{body}</div>}
    </div>
  )
}

// ─── Search + filter bar ──────────────────────────────────────────────────────
export function SearchBar({
  value, onChange, placeholder = 'Rechercher…',
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌕</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export function Button({
  children, onClick, variant = 'secondary', className = '', disabled = false,
}: {
  children: ReactNode; onClick?: () => void
  variant?: BtnVariant; className?: string; disabled?: boolean
}) {
  const map: Record<BtnVariant, string> = {
    primary:   'bg-stone-900 text-white hover:bg-stone-800',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    danger:    'bg-rose-600 text-white hover:bg-rose-700',
    ghost:     'text-gray-600 hover:bg-gray-100',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-40 ${map[variant]} ${className}`}
    >
      {children}
    </button>
  )
}

// ─── Toast (simple) ───────────────────────────────────────────────────────────
export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg">
      <span className="text-emerald-400">✓</span>
      {message}
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white">✕</button>
    </div>
  )
}
