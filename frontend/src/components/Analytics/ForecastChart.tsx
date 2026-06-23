import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

export default function ForecastChart({ range, warehouse }: { range: number; warehouse: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chart.current?.destroy()
    const hist = [4200, 4320, 4410, 4500, 4580, 4650, 4710, 4760, 4800, 4820]
    const fc = Array.from({ length: 20 }, (_, i) => Math.round(4820 + i * 25 + Math.random() * 15))
    const hi = fc.map((v, i) => Math.round(v + 60 + i * 8))
    const lo = fc.map((v, i) => Math.round(v - 60 - i * 8))
    const histLabels = Array.from({ length: 10 }, (_, i) => `S${i + 1}`)
    const fcLabels = Array.from({ length: 20 }, (_, i) => `J+${i + 1}`)
    const labels = [...histLabels, ...fcLabels]
    const pad = (arr: (number | null)[], before: number, after: number): (number | null)[] =>
      [...Array(before).fill(null), ...arr, ...Array(after).fill(null)]

    chart.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Réel', data: [...hist, ...Array(20).fill(null)], borderColor: '#1a2e1a', borderWidth: 2, pointRadius: 2, tension: 0.3, spanGaps: false },
          { label: 'Prévision', data: [...Array(9).fill(null), hist[9], ...fc], borderColor: '#BA7517', borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, tension: 0.3, spanGaps: false },
          { label: 'IC haut', data: pad(hi, 10, 0), borderColor: 'transparent', backgroundColor: 'rgba(181,212,244,.3)', fill: '+1' as any, pointRadius: 0, tension: 0.3 },
          { label: 'IC bas', data: pad(lo, 10, 0), borderColor: 'transparent', backgroundColor: 'rgba(181,212,244,.3)', fill: false, pointRadius: 0, tension: 0.3 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 10 }, maxTicksLimit: 12 } },
          y: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 10 } } },
        },
      },
    })
    return () => chart.current?.destroy()
  }, [range, warehouse])

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-800">Prévisions 30 jours</p>
        <p className="text-xs text-gray-400">Stocks projetés avec intervalles de confiance</p>
      </div>
      <div className="flex gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-4 h-0.5 bg-[#1a2e1a] inline-block" /> Réel
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-4 border-t border-dashed border-[#BA7517] inline-block" /> Prévision
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-4 h-2 bg-sky-200 rounded-sm inline-block" /> Intervalle de confiance
        </span>
      </div>
      <div className="relative h-48">
        <canvas ref={ref} role="img" aria-label="Prévisions stocks 30 jours avec intervalles de confiance" />
      </div>
    </div>
  )
}