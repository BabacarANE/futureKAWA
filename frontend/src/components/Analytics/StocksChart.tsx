import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import type { AnalyticsData } from '../../types'
import { ANALYTICS_COUNTRIES } from '../../constants/analytics'

Chart.register(...registerables)

type Props = { data: AnalyticsData | null; loading: boolean; range: number; country: string }

function lastNDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

const EMPTY_MSG = 'Aucun lot enregistré sur cette période'

export default function StocksChart({ data, loading, range, country }: Props) {
  const ref   = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chart.current?.destroy()

    const lots   = data?.allLots ?? []
    const days   = lastNDays(Math.min(range, 60))
    const daySet = new Set(days)

    const countries = country === 'all'
      ? ANALYTICS_COUNTRIES
      : ANALYTICS_COUNTRIES.filter(c => c.code === country)

    const datasets = countries.map(c => {
      const filtered = lots.filter(l => l.country === c.code && daySet.has(l.storage_date?.slice(0, 10) ?? ''))
      const byDay: Record<string, number> = {}
      days.forEach(d => { byDay[d] = 0 })
      filtered.forEach(l => { const d = l.storage_date?.slice(0, 10); if (d && byDay[d] !== undefined) byDay[d]++ })
      return {
        label: c.label,
        data: days.map(d => byDay[d]),
        borderColor: c.color,
        backgroundColor: c.color + '15',
        fill: false,
        tension: 0.35,
        pointRadius: days.length > 30 ? 0 : 3,
        borderWidth: 1.8,
      }
    })

    const hasSomeData = datasets.some(ds => ds.data.some(v => v > 0))

    const labels = days.map(d => {
      const [, m, day] = d.split('-')
      return `${day}/${m}`
    })

    chart.current = new Chart(ref.current, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 10 }, maxTicksLimit: 10 } },
          y: {
            grid: { color: 'rgba(0,0,0,.04)' },
            ticks: { font: { size: 10 }, stepSize: 1 },
            min: 0,
            suggestedMax: hasSomeData ? undefined : 5,
          },
        },
      },
    })
    return () => chart.current?.destroy()
  }, [data, range, country])

  const countries = country === 'all'
    ? ANALYTICS_COUNTRIES
    : ANALYTICS_COUNTRIES.filter(c => c.code === country)

  const hasData = (data?.allLots ?? []).length > 0

  return (
    <div className="bg-white dark:bg-[#1c1a17] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-stone-100">Nouveaux lots par jour</p>
          <p className="text-xs text-gray-400 dark:text-stone-500">Lots stockés · {range} derniers jours</p>
        </div>
      </div>
      <div className="flex gap-3 mb-3 flex-wrap">
        {countries.map(c => (
          <span key={c.code} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-stone-400">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>
      <div className="relative h-44">
        {loading
          ? <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300 dark:text-stone-600">Chargement…</div>
          : !hasData
          ? <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400 dark:text-stone-500">{EMPTY_MSG}</div>
          : <canvas ref={ref} role="img" aria-label="Nouveaux lots par jour" />
        }
      </div>
    </div>
  )
}
