import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const DATA = [
  { label: 'Brésil', value: 52, color: '#1a2e1a', lots: 2507 },
  { label: 'Colombie', value: 31, color: '#7c3b1e', lots: 1494 },
  { label: 'Équateur', value: 17, color: '#B4A06B', lots: 819 },
]

export default function RepartitionChart({ warehouse }: { warehouse: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chart.current?.destroy()
    chart.current = new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: DATA.map((d) => d.label),
        datasets: [{ data: DATA.map((d) => d.value), backgroundColor: DATA.map((d) => d.color), borderWidth: 0 }],
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '68%', plugins: { legend: { display: false } } },
    })
    return () => chart.current?.destroy()
  }, [warehouse])

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-800">Répartition des lots</p>
        <p className="text-xs text-gray-400">Par pays d'origine</p>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative w-32 h-32 flex-shrink-0">
          <canvas ref={ref} role="img" aria-label="Répartition lots par pays" />
        </div>
        <div className="flex flex-col gap-2.5 flex-1">
          {DATA.map((d) => (
            <div key={d.label} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
              <span className="text-xs text-gray-600 flex-1">{d.label}</span>
              <span className="text-xs font-medium text-gray-900">{d.value}%</span>
              <span className="text-xs text-gray-400">{d.lots.toLocaleString('fr')}</span>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-1">Total : 4 820 lots</p>
        </div>
      </div>
    </div>
  )
}