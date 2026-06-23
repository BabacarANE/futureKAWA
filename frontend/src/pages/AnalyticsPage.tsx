import { useState } from 'react'
import KpiBar from '../components/Analytics/KpiBar'
import StocksChart from '../components/Analytics/StocksChart'
import TempHumidChart from '../components/Analytics/TempHumidChart'
import RepartitionChart from '../components/Analytics/RepartitionChart'
import RadarChart from '../components/Analytics/RadarChart'
import ForecastChart from '../components/Analytics/ForecastChart'
import HeatmapChart from '../components/Analytics/HeatmapChart'
import { exportExcel, exportPDF } from '../lib/analyticsExport'

export type Range = 7 | 30 | 90 | 365

const RANGES: { label: string; value: Range }[] = [
  { label: '7 j', value: 7 },
  { label: '30 j', value: 30 },
  { label: '90 j', value: 90 },
  { label: '12 m', value: 365 },
]

const WAREHOUSES = [
  { label: 'Tous les entrepôts', value: 'all' },
  { label: 'W-001 Brésil', value: 'W-001' },
  { label: 'W-002 Colombie', value: 'W-002' },
  { label: 'W-003 Équateur', value: 'W-003' },
]

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>(7)
  const [warehouse, setWarehouse] = useState('all')
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null)

  const handleExcel = async () => {
    setExporting('excel')
    await exportExcel({ range, warehouse })
    setExporting(null)
  }

  const handlePDF = async () => {
    setExporting('pdf')
    await exportPDF({ range, warehouse })
    setExporting(null)
  }

  return (
    <div className="p-6 min-h-screen bg-[#f4f2ef] space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">Intelligence opérationnelle · Mise à jour en temps réel</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value)}
            className="text-sm rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-gray-700"
          >
            {WAREHOUSES.map((w) => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
          <button
            onClick={handleExcel}
            disabled={exporting === 'excel'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-[#1a2e1a] text-white hover:bg-[#0f2010] transition disabled:opacity-60"
          >
            <ExcelIcon /> {exporting === 'excel' ? 'Export...' : 'Excel'}
          </button>
          <button
            onClick={handlePDF}
            disabled={exporting === 'pdf'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-[#7c3b1e] text-white hover:bg-[#5e2d14] transition disabled:opacity-60"
          >
            <PDFIcon /> {exporting === 'pdf' ? 'Export...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* Period filter */}
      <div className="flex gap-2">
        {RANGES.map((r) => (
          <button
            key={r.value}
            onClick={() => setRange(r.value)}
            className={`px-3 py-1 rounded-full text-xs border transition ${
              range === r.value
                ? 'bg-[#1a2e1a] text-white border-[#1a2e1a]'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <KpiBar range={range} warehouse={warehouse} />

      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-4">
        <StocksChart range={range} warehouse={warehouse} />
        <TempHumidChart range={range} warehouse={warehouse} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-4">
        <RepartitionChart warehouse={warehouse} />
        <RadarChart warehouse={warehouse} />
      </div>

      {/* Forecast */}
      <ForecastChart range={range} warehouse={warehouse} />

      {/* Heatmap */}
      <HeatmapChart warehouse={warehouse} />
    </div>
  )
}

function ExcelIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  )
}

function PDFIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  )
}