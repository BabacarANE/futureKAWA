import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import type { AnalyticsData } from '../../types'

Chart.register(...registerables)

type Props = { data: AnalyticsData | null; loading: boolean; range: number; country: string }

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() - d.getDay())       // lundi de la semaine
  return d.toISOString().slice(0, 10)
}

function linReg(xs: number[], ys: number[]) {
  const n   = xs.length
  const sx  = xs.reduce((a, b) => a + b, 0)
  const sy  = ys.reduce((a, b) => a + b, 0)
  const sxy = xs.reduce((acc, x, i) => acc + x * ys[i], 0)
  const sx2 = xs.reduce((acc, x) => acc + x * x, 0)
  const denom = n * sx2 - sx * sx
  if (denom === 0) return { slope: 0, intercept: sy / n }
  const slope     = (n * sxy - sx * sy) / denom
  const intercept = (sy - slope * sx) / n
  return { slope, intercept }
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  return Math.sqrt(values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length)
}

export default function ForecastChart({ data, loading, range, country }: Props) {
  const ref   = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chart.current?.destroy()
    if (!data) return

    const lots = data.allLots.filter(l =>
      (country === 'all' || l.country === country) && l.storage_date
    )

    // Regrouper par semaine, compter cumulatif
    const byWeek: Record<string, number> = {}
    lots.forEach(l => {
      const wk = getWeekKey(l.storage_date)
      byWeek[wk] = (byWeek[wk] ?? 0) + 1
    })

    const weeks = Object.keys(byWeek).sort()
    if (weeks.length < 2) { chart.current = null; return }

    // Cumulatif
    const cumul: number[] = []
    let total = 0
    weeks.forEach(wk => { total += byWeek[wk]; cumul.push(total) })

    const xs = weeks.map((_, i) => i)
    const { slope, intercept } = linReg(xs, cumul)

    // Résidus → écart-type
    const residuals = cumul.map((y, i) => y - (intercept + slope * i))
    const σ = stddev(residuals)

    // Projection : 12 semaines
    const FC_N = 12
    const fc   = Array.from({ length: FC_N }, (_, i) => {
      const x = weeks.length + i
      return Math.max(0, Math.round(intercept + slope * x))
    })
    const hi = fc.map((v, i) => Math.round(v + σ * Math.sqrt(i + 1) * 1.5))
    const lo = fc.map((v, i) => Math.max(0, Math.round(v - σ * Math.sqrt(i + 1) * 1.5)))

    const histLabels = weeks.map(w => { const [, m, d] = w.split('-'); return `S${d}/${m}` })
    const fcLabels   = Array.from({ length: FC_N }, (_, i) => `+${i + 1}S`)
    const labels     = [...histLabels, ...fcLabels]

    const pad = (arr: (number|null)[], before: number): (number|null)[] =>
      [...Array(before).fill(null), ...arr]

    chart.current = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Réel',
            data: [...cumul, ...Array(FC_N).fill(null)],
            borderColor: '#4a2810', borderWidth: 2,
            pointRadius: 3, tension: 0.3, spanGaps: false,
          },
          {
            label: 'Prévision',
            data: [...Array(weeks.length - 1).fill(null), cumul[cumul.length - 1], ...fc],
            borderColor: '#BA7517', borderWidth: 1.5,
            borderDash: [5, 4], pointRadius: 0, tension: 0.3, spanGaps: false,
          },
          {
            label: 'IC haut',
            data: pad(hi, weeks.length),
            borderColor: 'transparent', backgroundColor: 'rgba(181,212,244,.3)',
            fill: '+1' as any, pointRadius: 0, tension: 0.3,
          },
          {
            label: 'IC bas',
            data: pad(lo, weeks.length),
            borderColor: 'transparent', backgroundColor: 'rgba(181,212,244,.3)',
            fill: false, pointRadius: 0, tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 10 }, maxTicksLimit: 14 } },
          y: { grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 10 } }, min: 0 },
        },
      },
    })
    return () => chart.current?.destroy()
  }, [data, range, country])

  const hasEnough = (data?.allLots ?? []).length >= 2
  const hasLots   = (data?.allLots ?? []).length > 0

  return (
    <div className="bg-white dark:bg-[#1c1a17] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-800 dark:text-stone-100">Prévisions d'activité</p>
        <p className="text-xs text-gray-400 dark:text-stone-500">
          Historique réel + projection linéaire avec intervalles de confiance
        </p>
      </div>
      <div className="flex gap-4 mb-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-stone-400">
          <span className="w-4 h-0.5 bg-[#4a2810] inline-block" /> Réel
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-stone-400">
          <span className="w-4 border-t border-dashed border-[#BA7517] inline-block" /> Prévision
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-stone-400">
          <span className="w-4 h-2 bg-sky-200 rounded-sm inline-block" /> Intervalle de confiance
        </span>
      </div>
      <div className="relative h-48">
        {loading
          ? <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300 dark:text-stone-600">Chargement…</div>
          : !hasLots
          ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-2xl">📦</span>
              <span className="text-xs text-gray-400 dark:text-stone-500">Aucun lot pour établir une prévision</span>
            </div>
          : !hasEnough
          ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
              <span className="text-xs text-gray-400 dark:text-stone-500">Données insuffisantes pour la projection</span>
              <span className="text-xs text-gray-300 dark:text-stone-600">(minimum 2 lots nécessaires)</span>
            </div>
          : <canvas ref={ref} role="img" aria-label="Prévisions stocks avec intervalles de confiance" />
        }
      </div>
    </div>
  )
}
