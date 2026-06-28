import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import type { AnalyticsData } from '../../types'
import { ANALYTICS_COUNTRIES } from '../../constants/analytics'

Chart.register(...registerables)

type Props = { data: AnalyticsData | null; loading: boolean }

export default function RepartitionChart({ data, loading }: Props) {
  const ref   = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  const rows = ANALYTICS_COUNTRIES.map(c => ({
    ...c,
    lots: data?.lotsByCountry[c.code] ?? 0,
  }))
  const total = rows.reduce((s, r) => s + r.lots, 0)

  useEffect(() => {
    if (!ref.current) return
    chart.current?.destroy()

    chart.current = new Chart(ref.current, {
      type: 'doughnut',
      data: {
        labels: rows.map(r => r.label),
        datasets: [{
          data: total > 0 ? rows.map(r => r.lots) : [1, 1, 1],
          backgroundColor: rows.map(r => total > 0 ? r.color : '#e5e7eb'),
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: { legend: { display: false }, tooltip: { enabled: total > 0 } },
      },
    })
    return () => chart.current?.destroy()
  }, [data])

  return (
    <div className="bg-white dark:bg-[#1c1a17] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-800 dark:text-stone-100">Répartition des lots</p>
        <p className="text-xs text-gray-400 dark:text-stone-500">Par pays d'origine</p>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative w-32 h-32 flex-shrink-0">
          <canvas ref={ref} role="img" aria-label="Répartition lots par pays" />
          {!loading && total === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400 dark:text-stone-500 text-center">
              Aucun lot
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2.5 flex-1">
          {rows.map(r => {
            const pct = total > 0 ? Math.round((r.lots / total) * 100) : 0
            return (
              <div key={r.code} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: r.color }} />
                <span className="text-xs text-gray-600 dark:text-stone-400 flex-1">{r.label}</span>
                <span className="text-xs font-medium text-gray-900 dark:text-stone-200">
                  {loading ? '…' : `${pct}%`}
                </span>
                <span className="text-xs text-gray-400 dark:text-stone-500 w-10 text-right">
                  {loading ? '' : r.lots.toLocaleString('fr')}
                </span>
              </div>
            )
          })}
          <p className="text-xs text-gray-400 dark:text-stone-500 mt-1">
            Total : {loading ? '…' : total.toLocaleString('fr')} lots
          </p>
        </div>
      </div>
    </div>
  )
}
