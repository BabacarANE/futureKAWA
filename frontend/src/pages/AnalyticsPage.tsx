import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, FileSpreadsheet, FileText } from 'lucide-react'
import KpiBar        from '../components/Analytics/KpiBar'
import StocksChart   from '../components/Analytics/StocksChart'
import TempHumidChart from '../components/Analytics/TempHumidChart'
import RepartitionChart from '../components/Analytics/RepartitionChart'
import RadarChart    from '../components/Analytics/RadarChart'
import ForecastChart from '../components/Analytics/ForecastChart'
import HeatmapChart  from '../components/Analytics/HeatmapChart'
import {
  getGlobalStats,
  getCountryLots,
  getCountryMeasures,
  getCountryAlerts,
} from '../services/api'
import type { AnalyticsData, AnalyticsLot, AnalyticsMeasure } from '../types'
import { ANALYTICS_COUNTRIES } from '../constants/analytics'

export type Range = 7 | 30 | 90 | 365
export { ANALYTICS_COUNTRIES }

const RANGES: { label: string; value: Range }[] = [
  { label: '7 j',  value: 7   },
  { label: '30 j', value: 30  },
  { label: '90 j', value: 90  },
  { label: '12 m', value: 365 },
]

// ─── CSV export ───────────────────────────────────────────────────────────────
function downloadCsv(content: string, filename: string) {
  const blob = new Blob(['﻿' + content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function exportToExcel(data: AnalyticsData | null) {
  const d = data?.summary
  const now = new Date().toISOString().slice(0, 10)
  const lines = [
    'Métrique,Valeur',
    `Total lots,${d?.total_lots ?? 0}`,
    `Alertes actives,${d?.total_alerts ?? 0}`,
    `Température moyenne,${d?.avg_temperature ?? 0}°C`,
    `Humidité moyenne,${d?.avg_humidity ?? 0}%`,
    `Pays actifs,${d?.active_countries ?? 0}`,
    '',
    'Pays,Lots,Alertes',
    ...ANALYTICS_COUNTRIES.map(c =>
      `${c.label},${data?.lotsByCountry[c.code] ?? 0},${data?.alertsByCountry[c.code] ?? 0}`
    ),
    '',
    `Date export,${now}`,
  ]
  downloadCsv(lines.join('\n'), `futurekawa-analytics-${now}.csv`)
}

function exportToPdf(data: AnalyticsData | null) {
  const d = data?.summary
  const now = new Date().toLocaleString('fr-FR')
  const rows = ANALYTICS_COUNTRIES.map(c =>
    `<tr><td>${c.label}</td><td>${data?.lotsByCountry[c.code] ?? 0}</td><td>${data?.alertsByCountry[c.code] ?? 0}</td></tr>`
  ).join('')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>FutureKawa Analytics</title>
  <style>body{font-family:sans-serif;padding:2rem}h1{color:#4a2810}table{border-collapse:collapse;width:100%;margin-bottom:1rem}
  th,td{border:1px solid #e0ddd7;padding:8px 12px}th{background:#f4f2ef}</style></head>
  <body><h1>FutureKawa — Rapport Analytics</h1><p>Généré le ${now}</p>
  <h2>KPIs globaux</h2>
  <table><tr><th>Métrique</th><th>Valeur</th></tr>
  <tr><td>Total lots</td><td>${d?.total_lots ?? 0}</td></tr>
  <tr><td>Alertes actives</td><td>${d?.total_alerts ?? 0}</td></tr>
  <tr><td>Température moyenne</td><td>${d?.avg_temperature ?? 0}°C</td></tr>
  <tr><td>Humidité moyenne</td><td>${d?.avg_humidity ?? 0}%</td></tr>
  </table>
  <h2>Répartition par pays</h2>
  <table><tr><th>Pays</th><th>Lots</th><th>Alertes</th></tr>${rows}</table>
  </body></html>`
  const win = window.open('', '_blank')
  if (win) { win.document.write(html); win.document.close(); win.print() }
}

export default function AnalyticsPage() {
  const [range,     setRange]     = useState<Range>(30)
  const [country,   setCountry]   = useState<string>('all')
  const [data,      setData]      = useState<AnalyticsData | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [exporting, setExporting] = useState<'excel'|'pdf'|null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const codes = ANALYTICS_COUNTRIES.map(c => c.code)

      // Parallel: summary + (lots + measures + alerts) × 3 pays
      const [summary, ...rest] = await Promise.all([
        getGlobalStats().catch(() => ({
          total_lots: 0, total_alerts: 0,
          avg_temperature: 0, avg_humidity: 0, active_countries: 0,
        })),
        ...codes.flatMap(code => [
          getCountryLots(code).catch(() => []),
          getCountryMeasures(code).catch(() => []),
          getCountryAlerts(code).catch(() => []),
        ]),
      ])

      const allLots:     AnalyticsLot[]     = []
      const allMeasures: AnalyticsMeasure[] = []
      const lotsByCountry:   Record<string, number> = {}
      const alertsByCountry: Record<string, number> = {}

      codes.forEach((code, i) => {
        const lots     = (rest[i * 3]     as any[]) ?? []
        const measures = (rest[i * 3 + 1] as any[]) ?? []
        const alerts   = (rest[i * 3 + 2] as any[]) ?? []
        lots.forEach((l: any)     => allLots.push({ ...l, country: code }))
        measures.forEach((m: any) => allMeasures.push({ ...m, country: code }))
        lotsByCountry[code]   = lots.length
        alertsByCountry[code] = alerts.length
      })

      setData({ summary, lotsByCountry, alertsByCountry, allLots, allMeasures })
    } catch {
      // garde les données précédentes en cas d'erreur réseau
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  return (
    <div className="p-6 min-h-full bg-[#f4f2ef] dark:bg-[#0f0c0a] space-y-5 transition-colors">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-stone-100">Analytics</h1>
          <p className="text-xs text-gray-500 dark:text-stone-400 mt-0.5">
            Intelligence opérationnelle · Données en temps réel
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtre pays */}
          <select value={country} onChange={e => setCountry(e.target.value)}
            className="text-sm rounded-lg border border-gray-200 dark:border-white/10
                       bg-white dark:bg-[#1c1a17] text-gray-700 dark:text-stone-200 px-3 py-1.5">
            <option value="all">Tous les pays</option>
            {ANALYTICS_COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>

          {/* Refresh */}
          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border
                       border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1a17]
                       text-gray-700 dark:text-stone-200 hover:bg-gray-50 dark:hover:bg-white/5
                       transition disabled:opacity-50">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>

          {/* Export Excel */}
          <button onClick={() => { setExporting('excel'); exportToExcel(data); setTimeout(() => setExporting(null), 600) }}
            disabled={exporting === 'excel'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg
                       bg-[#4a2810] text-white hover:bg-[#3d1f0f] transition disabled:opacity-60">
            <FileSpreadsheet size={13} />
            {exporting === 'excel' ? 'Export…' : 'Excel'}
          </button>

          {/* Export PDF */}
          <button onClick={() => { setExporting('pdf'); exportToPdf(data); setTimeout(() => setExporting(null), 600) }}
            disabled={exporting === 'pdf'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg
                       bg-[#7c3b1e] text-white hover:bg-[#5e2d14] transition disabled:opacity-60">
            <FileText size={13} />
            {exporting === 'pdf' ? 'Export…' : 'PDF'}
          </button>
        </div>
      </div>

      {/* KpiBar */}
      <KpiBar data={data} loading={loading} />

      {/* Filtre période */}
      <div className="flex gap-2">
        {RANGES.map(r => (
          <button key={r.value} onClick={() => setRange(r.value)}
            className={`px-3 py-1 rounded-full text-xs border transition ${
              range === r.value
                ? 'bg-[#4a2810] text-white border-[#4a2810]'
                : 'bg-white dark:bg-[#1c1a17] text-gray-500 dark:text-stone-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Graphiques ligne 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StocksChart    data={data} loading={loading} range={range} country={country} />
        <TempHumidChart data={data} loading={loading} range={range} country={country} />
      </div>

      {/* Graphiques ligne 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RepartitionChart data={data} loading={loading} />
        <RadarChart       data={data} loading={loading} country={country} />
      </div>

      {/* Prévisions */}
      <ForecastChart data={data} loading={loading} range={range} country={country} />

      {/* Heatmap */}
      <HeatmapChart data={data} loading={loading} country={country} />
    </div>
  )
}
