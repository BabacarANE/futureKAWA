import { useMemo } from 'react'

type Props = { range: number; warehouse: string }

const PALETTE = {
  up: 'text-green-700',
  down: 'text-rose-600',
}

function useKpis(range: number, warehouse: string) {
  return useMemo(() => [
    {
      icon: '📦',
      label: 'Stocks total',
      value: '4 820',
      trend: '+6.2%',
      dir: 'up' as const,
      sub: 'vs mois dernier',
    },
    {
      icon: '🌡',
      label: 'Temp. moy.',
      value: '22.5°C',
      trend: '+0.3°C',
      dir: 'down' as const,
      sub: 'au-dessus du seuil',
    },
    {
      icon: '💧',
      label: 'Humidité moy.',
      value: '59.4%',
      trend: 'Normale',
      dir: 'up' as const,
      sub: 'dans la norme',
    },
    {
      icon: '⚠',
      label: 'Alertes actives',
      value: '7',
      trend: '+2',
      dir: 'down' as const,
      sub: 'depuis ce matin',
    },
  ], [range, warehouse])
}

export default function KpiBar({ range, warehouse }: Props) {
  const kpis = useKpis(range, warehouse)

  return (
    <div className="grid grid-cols-4 gap-3">
      {kpis.map((k) => (
        <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-500 mb-1">{k.label}</p>
          <p className="text-2xl font-semibold text-gray-900 leading-none">{k.value}</p>
          <p className={`text-xs mt-1.5 ${PALETTE[k.dir]}`}>
            {k.trend} · {k.sub}
          </p>
        </div>
      ))}
    </div>
  )
}