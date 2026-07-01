import type { AnalyticsData } from '../../types'
import { ANALYTICS_COUNTRIES } from '../../constants/analytics'

type Props = { data: AnalyticsData | null; loading: boolean; country: string }

const HOUR_SLOTS = [0, 3, 6, 9, 12, 15, 18, 21]
const SLOT_LABELS = ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h']

function tempStyle(v: number | null): { bg: string; text: string } {
  if (v === null) return { bg: '#f3f4f6', text: '#9ca3af' }
  if (v < 18)    return { bg: '#E6F1FB', text: '#0C447C' }
  if (v < 22)    return { bg: '#85B7EB', text: '#042C53' }
  if (v < 25)    return { bg: '#EF9F27', text: '#412402' }
  if (v < 28)    return { bg: '#D85A30', text: '#fff'    }
  return               { bg: '#B53030', text: '#fff'    }
}

const COUNTRY_MAP: Record<string, string> = Object.fromEntries(
  ANALYTICS_COUNTRIES.map(c => [c.code, c.label])
)

export default function HeatmapChart({ data, loading, country }: Props) {
  if (loading) return (
    <div className="bg-white dark:bg-[#1c1a17] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <p className="text-sm font-medium text-gray-800 dark:text-stone-100 mb-3">Heatmap température</p>
      <div className="h-28 flex items-center justify-center text-xs text-gray-300 dark:text-stone-600">
        Chargement…
      </div>
    </div>
  )

  const measures = (data?.allMeasures ?? []).filter(m =>
    country === 'all' || m.country === country
  )

  if (!measures.length) return (
    <div className="bg-white dark:bg-[#1c1a17] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <p className="text-sm font-medium text-gray-800 dark:text-stone-100 mb-1">Heatmap température</p>
      <p className="text-xs text-gray-400 dark:text-stone-500 mb-4">°C moyen · par entrepôt × créneau horaire</p>
      <div className="h-20 flex flex-col items-center justify-center gap-1">
        <span className="text-2xl">🌡</span>
        <span className="text-xs text-gray-400 dark:text-stone-500">En attente de données IoT</span>
      </div>
    </div>
  )

  // Grouper par (warehouseId, slot)
  type Cell = { sum: number; count: number }
  const grid: Record<string, Record<number, Cell>> = {}
  const whCountry: Record<string, string> = {}

  measures.forEach(m => {
    const h    = new Date(m.timestamp).getHours()
    const slot = Math.floor(h / 3) * 3
    const key  = String(m.warehouse_id)
    if (!grid[key]) grid[key] = {}
    if (!grid[key][slot]) grid[key][slot] = { sum: 0, count: 0 }
    grid[key][slot].sum   += m.temperature
    grid[key][slot].count += 1
    whCountry[key] = m.country
  })

  // Trier par entrepôt, prendre les 8 premiers max
  const warehouseIds = Object.keys(grid)
    .sort((a, b) => {
      const totalA = Object.values(grid[a]).reduce((s, c) => s + c.count, 0)
      const totalB = Object.values(grid[b]).reduce((s, c) => s + c.count, 0)
      return totalB - totalA
    })
    .slice(0, 8)

  return (
    <div className="bg-white dark:bg-[#1c1a17] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-800 dark:text-stone-100">Heatmap température</p>
        <p className="text-xs text-gray-400 dark:text-stone-500">°C moyen · par entrepôt × créneau horaire</p>
      </div>

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `110px repeat(${HOUR_SLOTS.length}, 1fr)` }}
        role="table"
        aria-label="Heatmap températures par heure"
      >
        {/* En-tête */}
        <div />
        {SLOT_LABELS.map(h => (
          <div key={h} className="text-center text-[10px] text-gray-400 dark:text-stone-500 pb-1">{h}</div>
        ))}

        {/* Lignes */}
        {warehouseIds.map(whId => {
          const cCode = whCountry[whId] ?? ''
          const cLabel = COUNTRY_MAP[cCode] ?? cCode
          return (
            <div key={whId} className="contents">
              <div className="text-[11px] text-gray-500 dark:text-stone-400 flex items-center pr-2 leading-tight">
                <span>Ent. #{whId}<br /><span className="text-[9px] text-gray-300 dark:text-stone-600">{cLabel}</span></span>
              </div>
              {HOUR_SLOTS.map(slot => {
                const cell = grid[whId]?.[slot]
                const val  = cell ? parseFloat((cell.sum / cell.count).toFixed(1)) : null
                const { bg, text } = tempStyle(val)
                return (
                  <div
                    key={slot}
                    className="h-8 rounded flex items-center justify-center text-[10px] font-medium transition-opacity"
                    style={{ background: bg, color: text }}
                    title={val !== null ? `Entrepôt #${whId} à ${SLOT_LABELS[HOUR_SLOTS.indexOf(slot)]} : ${val}°C` : 'Pas de données'}
                  >
                    {val !== null ? val.toFixed(1) : '—'}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-gray-400 dark:text-stone-500">Froid</span>
        {['#E6F1FB', '#85B7EB', '#EF9F27', '#D85A30', '#B53030'].map(c => (
          <div key={c} className="w-5 h-2.5 rounded-sm" style={{ background: c }} />
        ))}
        <span className="text-[10px] text-gray-400 dark:text-stone-500">Chaud</span>
      </div>
    </div>
  )
}
