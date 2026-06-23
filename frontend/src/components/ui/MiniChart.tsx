 

export default function MiniChart({ data = [], color = '#1F8A4D' }: { data?: number[]; color?: string }) {
  // Simple sparkline using svg
  const max = Math.max(...data, 1)
  const points = data.map((v, i) => `${(i/(data.length-1 || 1))*100},${100 - (v/max)*100}`).join(' ')
  return (
    <svg viewBox="0 0 100 40" className="w-full h-10">
      <polyline fill="none" stroke={color} strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
