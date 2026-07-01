 

export default function SensorMap({ sensors }: { sensors: Record<string, any> }) {
  // Simple placeholder map: render sensors as dots in a fixed SVG
  const nodes = Object.values(sensors || {})
  return (
    <div className="w-full h-64 bg-slate-50 rounded-md flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
        <rect x="0" y="0" width="600" height="300" fill="#F8FAFC" />
        {nodes.map((s: any, i: number) => {
          const x = 50 + (i * 73) % 520
          const y = 40 + (i * 47) % 220
          const color = s.connected ? '#10B981' : '#F97316'
          return (
            <g key={s.sensor_id ?? i}>
              <circle cx={x} cy={y} r={10} fill={color} stroke="#0f172a" strokeOpacity="0.08" />
              <text x={x + 14} y={y + 4} fontSize="11" fill="#0f172a">{String(s.sensor_id ?? s.id ?? i)}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
