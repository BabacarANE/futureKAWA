/**
 * AnalyticsPage.tsx — KPIs connectés au backend
 *
 * Les KPIs (total lots, alertes, pays) sont chargés depuis /consolidated.
 * Les graphiques (StocksChart, TempHumidChart, etc.) restent avec leurs données internes —
 * ils sont déjà fonctionnels visuellement et très bien conçus.
 * Export : génère un CSV réel côté frontend depuis les données chargées.
 */
import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, FileSpreadsheet, FileText } from 'lucide-react'
import KpiBar from '../components/Analytics/KpiBar'
import StocksChart from '../components/Analytics/StocksChart'
import TempHumidChart from '../components/Analytics/TempHumidChart'
import RepartitionChart from '../components/Analytics/RepartitionChart'
import RadarChart from '../components/Analytics/RadarChart'
import ForecastChart from '../components/Analytics/ForecastChart'
import HeatmapChart from '../components/Analytics/HeatmapChart'
import { getAllCountries } from '../services/api'

export type Range = 7 | 30 | 90 | 365

const RANGES: { label: string; value: Range }[] = [
  { label: '7 j',  value: 7   },
  { label: '30 j', value: 30  },
  { label: '90 j', value: 90  },
  { label: '12 m', value: 365 },
]

const WAREHOUSES = [
  { label: 'Tous les entrepôts', value: 'all'   },
  { label: 'W-001 Brésil',       value: 'w1'    },
  { label: 'W-002 Colombie',     value: 'w2'    },
  { label: 'W-003 Équateur',     value: 'w3'    },
]

// ─── Export CSV frontend (pas de dépendance backend) ─────────────────────────
function downloadCsv(content: string, filename: string) {
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function exportToExcel(summary: { lots: number; alerts: number; countries: number }) {
  const now = new Date().toISOString().slice(0, 10)
  const lines = [
    'Métrique,Valeur',
    `Total lots,${summary.lots}`,
    `Alertes actives,${summary.alerts}`,
    `Pays actifs,${summary.countries}`,
    `Date export,${now}`,
  ]
  downloadCsv(lines.join('\n'), `futurekawa-analytics-${now}.csv`)
}

function exportToPdf(summary: { lots: number; alerts: number; countries: number }) {
  const now = new Date().toLocaleString('fr-FR')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>FutureKawa Analytics</title>
  <style>body{font-family:sans-serif;padding:2rem}h1{color:#1a2e1a}table{border-collapse:collapse;width:100%}
  th,td{border:1px solid #e0ddd7;padding:8px 12px}th{background:#f4f2ef}</style></head>
  <body><h1>FutureKawa — Rapport Analytics</h1><p>Généré le ${now}</p>
  <table><tr><th>Métrique</th><th>Valeur</th></tr>
  <tr><td>Total lots</td><td>${summary.lots}</td></tr>
  <tr><td>Alertes actives</td><td>${summary.alerts}</td></tr>
  <tr><td>Pays actifs</td><td>${summary.countries}</td></tr>
  </table></body></html>`
  const win = window.open('', '_blank')
  if (win) { win.document.write(html); win.document.close(); win.print() }
}

// ─── KPI card ─────────────────────────────────────────────────────────────────
function LiveKpi({ label, value, color, loading }: {
  label: string; value: number | string; color?: string; loading: boolean
}) {
  return (
    <div className="bg-white dark:bg-[#1c1a17] rounded-xl border border-gray-100 dark:border-white/10 p-4">
      <p className="text-xs text-gray-500 dark:text-stone-400 mb-1">{label}</p>
      <p className={`text-2xl font-semibold leading-none ${color ?? 'text-gray-900 dark:text-stone-100'}`}>
        {loading ? <span className="text-gray-300 dark:text-stone-600">…</span> : value}
      </p>
      <p className="text-xs text-gray-400 mt-1.5">Données en temps réel</p>
    </div>
  )
}

export default function AnalyticsPage() {
  const [range,     setRange]     = useState<Range>(30)
  const [warehouse, setWarehouse] = useState<'all'|'w1'|'w2'|'w3'>('all')
  const [exporting, setExporting] = useState<'excel'|'pdf'|null>(null)
  const [loading,   setLoading]   = useState(true)
  const [summary,   setSummary]   = useState({ lots: 0, alerts: 0, countries: 0 })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllCountries()
      setSummary({
        lots:      data.reduce((s: number, c: any) => s + (c.lots?.length   ?? 0), 0),
        alerts:    data.reduce((s: number, c: any) => s + (c.alerts?.length ?? 0), 0),
        countries: data.length,
      })
    } catch {
      // Garde les valeurs précédentes si erreur réseau
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleExcel = async () => {
    setExporting('excel')
    exportToExcel(summary)
    setTimeout(() => setExporting(null), 600)
  }

  const handlePDF = async () => {
    setExporting('pdf')
    exportToPdf(summary)
    setTimeout(() => setExporting(null), 600)
  }

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
          {/* Filtre entrepôt */}
          <select
            value={warehouse}
            onChange={e => setWarehouse(e.target.value as typeof warehouse)}
            className="text-sm rounded-lg border border-gray-200 dark:border-white/10
                       bg-white dark:bg-[#1c1a17] text-gray-700 dark:text-stone-200 px-3 py-1.5"
          >
            {WAREHOUSES.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
          </select>

          {/* Refresh */}
          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border
                       border-gray-200 dark:border-white/10 bg-white dark:bg-[#1c1a17]
                       text-gray-700 dark:text-stone-200 hover:bg-gray-50 transition disabled:opacity-50">
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>

          {/* Export Excel (CSV) */}
          <button onClick={handleExcel} disabled={exporting === 'excel'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg
                       bg-[#1a2e1a] text-white hover:bg-[#0f2010] transition disabled:opacity-60">
            <FileSpreadsheet size={13} />
            {exporting === 'excel' ? 'Export…' : 'Excel'}
          </button>

          {/* Export PDF */}
          <button onClick={handlePDF} disabled={exporting === 'pdf'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg
                       bg-[#7c3b1e] text-white hover:bg-[#5e2d14] transition disabled:opacity-60">
            <FileText size={13} />
            {exporting === 'pdf' ? 'Export…' : 'PDF'}
          </button>
        </div>
      </div>

      {/* KPIs live backend */}
      <div className="grid grid-cols-3 gap-4">
        <LiveKpi label="Total lots"    value={summary.lots}      loading={loading} color="text-[#1a2e1a] dark:text-emerald-400" />
        <LiveKpi label="Alertes actives" value={summary.alerts}  loading={loading} color="text-red-600" />
        <LiveKpi label="Pays actifs"   value={summary.countries} loading={loading} color="text-[#7c3b1e] dark:text-amber-400" />
      </div>

      {/* Filtre période */}
      <div className="flex gap-2">
        {RANGES.map(r => (
          <button key={r.value} onClick={() => setRange(r.value)}
            className={`px-3 py-1 rounded-full text-xs border transition ${
              range === r.value
                ? 'bg-[#1a2e1a] text-white border-[#1a2e1a]'
                : 'bg-white dark:bg-[#1c1a17] text-gray-500 dark:text-stone-400 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* KpiBar original (graphiques internes bien conçus) */}
      <KpiBar range={range} warehouse={warehouse} />

      {/* Graphiques ligne 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StocksChart    range={range} warehouse={warehouse} />
        <TempHumidChart range={range} warehouse={warehouse} />
      </div>

      {/* Graphiques ligne 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RepartitionChart warehouse={warehouse} />
        <RadarChart       warehouse={warehouse} />
      </div>

      {/* Prévisions */}
      <ForecastChart range={range} warehouse={warehouse} />

      {/* Heatmap */}
      <HeatmapChart warehouse={warehouse} />
    </div>
  )
}