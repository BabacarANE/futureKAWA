export type ExportParams = { range: number; warehouse: string }

export async function exportExcel({ range, warehouse }: ExportParams): Promise<void> {
  const res = await fetch(`/api/analytics/export/excel?range=${range}&warehouse=${warehouse}`)
  if (!res.ok) throw new Error('Export Excel échoué')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `futurekawa-analytics-${new Date().toISOString().slice(0, 10)}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportPDF({ range, warehouse }: ExportParams): Promise<void> {
  const res = await fetch(`/api/analytics/export/pdf?range=${range}&warehouse=${warehouse}`)
  if (!res.ok) throw new Error('Export PDF échoué')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  URL.revokeObjectURL(url)
}