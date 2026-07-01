import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import type { AnalyticsData } from '../../types'

Chart.register(...registerables)

type Props = { data: AnalyticsData | null; loading: boolean; range: number; country: string }

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

export default function TempHumidChart({ data, loading, range, country }: Props) {
  const ref   = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chart.current?.destroy()

    const measures = (data?.allMeasures ?? []).filter(m =>
      country === 'all' || m.country === country
    )

    // Filtre par plage de dates
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - range)
    const inRange = measures.filter(m => new Date(m.timestamp) >= cutoff)

    // Agrégation par jour
    const byDay: Record<string, { temps: number[]; humids: number[] }> = {}
    inRange.forEach(m => {
      const day = m.timestamp.slice(0, 10)
      if (!byDay[day]) byDay[day] = { temps: [], humids: [] }
      byDay[day].temps.push(m.temperature)
      byDay[day].humids.push(m.humidity)
    })

    const days = Object.keys(byDay).sort()
    const labels = days.map(d => { const [, mo, dy] = d.split('-'); return `${dy}/${mo}` })
    const temps  = days.map(d => parseFloat(avg(byDay[d].temps).toFixed(1)))
    const humids = days.map(d => parseFloat(avg(byDay[d].humids).toFixed(1)))

    if (!days.length) { chart.current = null; return }

    chart.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Température (°C)',
            data: temps,
            borderColor: '#B53030',
            backgroundColor: 'rgba(181,48,48,.07)',
            fill: true, tension: 0.35, pointRadius: days.length > 20 ? 0 : 3,
            borderWidth: 1.8, yAxisID: 'y',
          },
          {
            label: 'Humidité (%)',
            data: humids,
            borderColor: '#185FA5',
            backgroundColor: 'rgba(24,95,165,.07)',
            fill: true, tension: 0.35, pointRadius: days.length > 20 ? 0 : 3,
            borderWidth: 1.8, yAxisID: 'y2', borderDash: [4, 3],
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x:  { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 10 }, maxTicksLimit: 10 } },
          y:  { position: 'left',  ticks: { font: { size: 10 }, callback: v => v + '°' }, grid: { color: 'rgba(0,0,0,.04)' } },
          y2: { position: 'right', ticks: { font: { size: 10 }, callback: v => v + '%' }, grid: { drawOnChartArea: false } },
        },
      },
    })
    return () => chart.current?.destroy()
  }, [data, range, country])

  const hasMeasures = (data?.allMeasures ?? []).length > 0

  return (
    <div className="bg-white dark:bg-[#1c1a17] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-800 dark:text-stone-100">Température & humidité</p>
        <p className="text-xs text-gray-400 dark:text-stone-500">
          Moyennes journalières · {country === 'all' ? 'Tous pays' : country}
        </p>
      </div>
      <div className="flex gap-3 mb-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-stone-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-rose-600" /> Température
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-stone-400">
          <span className="w-2.5 h-2.5 rounded-sm bg-sky-700" /> Humidité
        </span>
      </div>
      <div className="relative h-44">
        {loading
          ? <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300 dark:text-stone-600">Chargement…</div>
          : !hasMeasures
          ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-2xl">📡</span>
              <span className="text-xs text-gray-400 dark:text-stone-500">En attente de données IoT</span>
            </div>
          : <canvas ref={ref} role="img" aria-label="Température et humidité journalières" />
        }
      </div>
    </div>
  )
}
