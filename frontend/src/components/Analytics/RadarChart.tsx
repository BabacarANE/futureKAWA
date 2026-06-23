import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const DATASETS = [
  { label: 'W-001', data: [88, 82, 90, 95, 75, 85], borderColor: '#1a2e1a', backgroundColor: 'rgba(26,46,26,.15)' },
  { label: 'W-002', data: [70, 78, 74, 80, 60, 72], borderColor: '#7c3b1e', backgroundColor: 'rgba(124,59,30,.12)' },
  { label: 'W-003', data: [80, 65, 88, 72, 85, 68], borderColor: '#B4A06B', backgroundColor: 'rgba(180,160,107,.12)' },
]

export default function RadarChart({ warehouse }: { warehouse: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chart.current?.destroy()
    const datasets =
      warehouse === 'all'
        ? DATASETS
        : DATASETS.filter((d) => d.label === warehouse)

    chart.current = new Chart(ref.current, {
      type: 'radar',
      data: {
        labels: ['Température', 'Humidité', 'Qualité air', 'Stocks', 'Alertes', 'Maintenance'],
        datasets: datasets.map((d) => ({ ...d, pointRadius: 3, borderWidth: 1.5 })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { r: { min: 0, max: 100, ticks: { stepSize: 25, font: { size: 8 } }, pointLabels: { font: { size: 9 } } } },
      },
    })
    return () => chart.current?.destroy()
  }, [warehouse])

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-800">Radar qualité</p>
        <p className="text-xs text-gray-400">Indice multi-critères par entrepôt</p>
      </div>
      <div className="flex gap-3 mb-2 flex-wrap">
        {(warehouse === 'all' ? DATASETS : DATASETS.filter((d) => d.label === warehouse)).map((d) => (
          <span key={d.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.borderColor }} />
            {d.label}
          </span>
        ))}
      </div>
      <div className="relative h-44">
        <canvas ref={ref} role="img" aria-label="Radar qualité multi-critères" />
      </div>
    </div>
  )
}