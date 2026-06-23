import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

type Props = { range: number; warehouse: string }

export default function TempHumidChart({ range, warehouse }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chart.current?.destroy()
    const n = Math.min(range, 14)
    const labels = Array.from({ length: n }, (_, i) => `J-${n - i}`)
    const rand = (base: number, amp: number) =>
      Array.from({ length: n }, () => parseFloat((base + (Math.random() - 0.5) * amp).toFixed(1)))

    chart.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Température (°C)',
            data: rand(22.5, 4),
            borderColor: '#B53030',
            backgroundColor: 'rgba(181,48,48,.07)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            borderWidth: 1.8,
            yAxisID: 'y',
          },
          {
            label: 'Humidité (%)',
            data: rand(59, 8),
            borderColor: '#185FA5',
            backgroundColor: 'rgba(24,95,165,.07)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            borderWidth: 1.8,
            yAxisID: 'y2',
            borderDash: [4, 3],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 10 }, maxTicksLimit: 8 } },
          y: { position: 'left', ticks: { font: { size: 10 }, callback: (v) => v + '°' }, grid: { color: 'rgba(0,0,0,.04)' } },
          y2: { position: 'right', ticks: { font: { size: 10 }, callback: (v) => v + '%' }, grid: { drawOnChartArea: false } },
        },
      },
    })
    return () => chart.current?.destroy()
  }, [range, warehouse])

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-800">Température & humidité</p>
        <p className="text-xs text-gray-400">Moyennes journalières · {warehouse === 'all' ? 'Tous entrepôts' : warehouse}</p>
      </div>
      <div className="flex gap-3 mb-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-rose-600" />Température</span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-sky-700" />Humidité</span>
      </div>
      <div className="relative h-44">
        <canvas ref={ref} role="img" aria-label="Température et humidité journalières" />
      </div>
    </div>
  )
}