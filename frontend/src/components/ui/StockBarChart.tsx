import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

type Props = {
  range: number
  warehouse: 'all' | 'w1' | 'w2' | 'w3'
}

const COLORS = {
  w1: '#1a2e1a',
  w2: '#7c3b1e',
  w3: '#B4A06B',
}

function buildDatasets(range: number, warehouse: Props['warehouse']) {
  const n = Math.min(range, 14)

  const labels = Array.from({ length: n }, (_, i) => `J-${n - i}`)

  const rand = (base: number, amp: number) =>
    Array.from({ length: n }, () =>
      Math.round(base + (Math.random() - 0.5) * amp)
    )

  const all = [
    {
      key: 'w1',
      label: 'W-001 Brésil',
      data: rand(120, 12),
      borderColor: COLORS.w1,
      backgroundColor: 'rgba(26,46,26,.07)',
    },
    {
      key: 'w2',
      label: 'W-002 Colombie',
      data: rand(82, 10),
      borderColor: COLORS.w2,
      backgroundColor: 'rgba(124,59,30,.07)',
    },
    {
      key: 'w3',
      label: 'W-003 Équateur',
      data: rand(40, 6),
      borderColor: COLORS.w3,
      backgroundColor: 'rgba(180,160,107,.07)',
    },
  ]

  const filtered =
    warehouse === 'all'
      ? all
      : all.filter((d) => d.key === warehouse)

  return {
    labels,
    datasets: filtered.map((d) => ({
      label: d.label,
      data: d.data,
      borderColor: d.borderColor,
      backgroundColor: d.backgroundColor,
      tension: 0.35,
      fill: false,
      pointRadius: 3,
      borderWidth: 1.8,
    })),
  }
}

const LEGEND = [
  { key: 'w1', color: COLORS.w1, label: 'W-001 Brésil' },
  { key: 'w2', color: COLORS.w2, label: 'W-002 Colombie' },
  { key: 'w3', color: COLORS.w3, label: 'W-003 Équateur' },
]

export default function StocksChart({ range, warehouse }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return

    chart.current?.destroy()

    const { labels, datasets } = buildDatasets(range, warehouse)

    chart.current = new Chart(ref.current, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { color: 'rgba(0,0,0,.04)' },
            ticks: { font: { size: 10 }, maxTicksLimit: 8 },
          },
          y: {
            grid: { color: 'rgba(0,0,0,.04)' },
            ticks: { font: { size: 10 } },
            min: 20,
          },
        },
      },
    })

    return () => chart.current?.destroy()
  }, [range, warehouse])

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-800">
            Évolution des stocks
          </p>
          <p className="text-xs text-gray-400">
            Lots en entrepôt · {range} derniers jours
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-3 flex-wrap">
        {(warehouse === 'all'
          ? LEGEND
          : LEGEND.filter((l) => l.key === warehouse)
        ).map((l) => (
          <span
            key={l.key}
            className="flex items-center gap-1.5 text-xs text-gray-500"
          >
            <span
              className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
              style={{ background: l.color }}
            />
            {l.label}
          </span>
        ))}
      </div>

      <div className="relative h-44">
        <canvas
          ref={ref}
          role="img"
          aria-label="Évolution des stocks par entrepôt"
        />
      </div>
    </div>
  )
}