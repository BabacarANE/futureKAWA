const HOURS = ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h']
const WAREHOUSES_LABELS = ['W-001', 'W-002', 'W-003']

const BASE_DATA: Record<string, number[]> = {
  'W-001': [19.2, 19.0, 19.5, 21.8, 24.1, 25.2, 23.8, 21.5],
  'W-002': [20.1, 19.8, 20.0, 22.5, 25.4, 26.8, 24.9, 22.3],
  'W-003': [18.5, 18.2, 18.8, 20.5, 22.7, 23.5, 22.0, 20.1],
}

function tempStyle(v: number): { bg: string; text: string } {
  if (v < 20) return { bg: '#E6F1FB', text: '#0C447C' }
  if (v < 22) return { bg: '#85B7EB', text: '#042C53' }
  if (v < 24) return { bg: '#EF9F27', text: '#412402' }
  if (v < 26) return { bg: '#D85A30', text: '#fff' }
  return { bg: '#B53030', text: '#fff' }
}

export default function HeatmapChart({ warehouse }: { warehouse: string }) {
  const rows = warehouse === 'all' ? WAREHOUSES_LABELS : [warehouse]

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-800">Heatmap température</p>
        <p className="text-xs text-gray-400">°C moyen · par entrepôt × heure</p>
      </div>

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `80px repeat(${HOURS.length}, 1fr)` }}
        role="table"
        aria-label="Heatmap températures par heure"
      >
        {/* Header */}
        <div />
        {HOURS.map((h) => (
          <div key={h} className="text-center text-[10px] text-gray-400 pb-1">{h}</div>
        ))}

        {/* Rows */}
        {rows.map((wh) => {
          const data = BASE_DATA[wh] ?? BASE_DATA['W-001']
          return (
            <>
              <div key={`lbl-${wh}`} className="text-[11px] text-gray-500 flex items-center pr-2">{wh}</div>
              {data.map((v, i) => {
                const { bg, text } = tempStyle(v)
                return (
                  <div
                    key={i}
                    className="h-7 rounded flex items-center justify-center text-[10px] font-medium"
                    style={{ background: bg, color: text }}
                    title={`${wh} à ${HOURS[i]} : ${v}°C`}
                  >
                    {v.toFixed(1)}
                  </div>
                )
              })}
            </>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-gray-400">Froid</span>
        {['#E6F1FB', '#85B7EB', '#EF9F27', '#D85A30', '#B53030'].map((c) => (
          <div key={c} className="w-5 h-2.5 rounded-sm" style={{ background: c }} />
        ))}
        <span className="text-[10px] text-gray-400">Chaud</span>
      </div>
    </div>
  )
}