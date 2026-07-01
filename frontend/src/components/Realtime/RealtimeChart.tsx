import { useMemo } from 'react'

function Sparkline({ values }: { values: number[] }) {
  const points = values.map((v, i) => `${(i / Math.max(1, values.length - 1)) * 100},${100 - v}`).join(' ')
  return (
    <svg className="w-full h-40" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline fill="none" stroke="#3B82F6" strokeWidth={1.5} points={points} />
    </svg>
  )
}

export default function RealtimeChart({ measures }: { measures: any[] }) {
  const values = useMemo(() => {
    // take last 40 numeric values from measures (temperature or value)
    const nums = measures.map((m) => Number(m.value ?? m.temp ?? 0)).filter((n) => !Number.isNaN(n)).slice(0, 40).reverse()
    if (nums.length === 0) return Array.from({ length: 20 }, () => 50)
    const max = Math.max(...nums)
    const min = Math.min(...nums)
    return nums.map((n) => (max === min ? 50 : ((n - min) / (max - min)) * 100))
  }, [measures])

  return (
    <div>
      <Sparkline values={values} />
      <div className="text-xs text-gray-500 mt-2">Dernières valeurs temps réel ({values.length})</div>
    </div>
  )
}
