import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import type { AnalyticsData, AnalyticsMeasure, AnalyticsLot } from '../../types'
import { ANALYTICS_COUNTRIES } from '../../constants/analytics'

Chart.register(...registerables)

type Props = { data: AnalyticsData | null; loading: boolean; country: string }

// Plages de conformité café (stockage)
const TEMP_OK  = (t: number) => t >= 15 && t <= 26
const HUMID_OK = (h: number) => h >= 45 && h <= 75

function scores(
  lots:     AnalyticsLot[],
  measures: AnalyticsMeasure[],
  alerts:   number,
): number[] {
  const n = lots.length
  const m = measures.length

  const tempConf  = m ? measures.filter(x => TEMP_OK(x.temperature)).length  / m * 100 : 0
  const humidConf = m ? measures.filter(x => HUMID_OK(x.humidity)).length    / m * 100 : 0
  const lotsConf  = n ? lots.filter(l => l.status === 'compliant').length     / n * 100 : 0
  // Taux d'alertes : 0 alerte / lot → 100, 1 alerte / lot → 0
  const noAlert   = n ? Math.max(0, 100 - (alerts / n) * 100) : 100

  return [tempConf, humidConf, lotsConf, noAlert].map(v => parseFloat(v.toFixed(1)))
}

const LABELS = ['Temp. conforme', 'Humid. conforme', 'Lots conformes', 'Sans alertes']

export default function RadarChart({ data, loading, country }: Props) {
  const ref   = useRef<HTMLCanvasElement>(null)
  const chart = useRef<Chart | null>(null)

  useEffect(() => {
    if (!ref.current) return
    chart.current?.destroy()
    if (!data) return

    const countries = country === 'all'
      ? ANALYTICS_COUNTRIES
      : ANALYTICS_COUNTRIES.filter(c => c.code === country)

    const datasets = countries.map(c => ({
      label: c.label,
      data:  scores(
        data.allLots.filter(l => l.country === c.code),
        data.allMeasures.filter(m => m.country === c.code),
        data.alertsByCountry[c.code] ?? 0,
      ),
      borderColor:     c.color,
      backgroundColor: c.color + '20',
      pointRadius:     3,
      borderWidth:     1.5,
    }))

    chart.current = new Chart(ref.current, {
      type: 'radar',
      data: { labels: LABELS, datasets },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0, max: 100,
            ticks: { stepSize: 25, font: { size: 8 }, backdropColor: 'transparent' },
            pointLabels: { font: { size: 9 } },
          },
        },
      },
    })
    return () => chart.current?.destroy()
  }, [data, country])

  const countries = country === 'all'
    ? ANALYTICS_COUNTRIES
    : ANALYTICS_COUNTRIES.filter(c => c.code === country)

  return (
    <div className="bg-white dark:bg-[#1c1a17] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-800 dark:text-stone-100">Radar qualité</p>
        <p className="text-xs text-gray-400 dark:text-stone-500">Conformité calculée depuis les données réelles</p>
      </div>
      <div className="flex gap-3 mb-2 flex-wrap">
        {countries.map(c => (
          <span key={c.code} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-stone-400">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: c.color }} />
            {c.label}
          </span>
        ))}
      </div>
      <div className="relative h-44">
        {loading
          ? <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-300 dark:text-stone-600">Chargement…</div>
          : <canvas ref={ref} role="img" aria-label="Radar qualité multi-critères" />
        }
      </div>
    </div>
  )
}
