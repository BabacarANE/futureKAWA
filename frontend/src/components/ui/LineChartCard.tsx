import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Inbox } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
)

interface SeriesPoint {
  label: string
  value: number
}

interface LineChartCardProps {
  title: string
  subtitle?: string
  data: SeriesPoint[]
  color?: string
  unit?: string
}

export default function LineChartCard({
  title,
  subtitle,
  data,
  color = '#7A4528',
  unit = '',
}: LineChartCardProps) {
  const hasData = data && data.length > 0

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: title,
        data: data.map(item => item.value),
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#2B1810',
        bodyColor: '#2B1810',
        borderColor: 'rgba(43,24,16,0.1)',
        borderWidth: 1,
        cornerRadius: 10,
        padding: 10,
        callbacks: {
          label: (context: any) => `${context.parsed.y}${unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: 'rgba(122,69,40,0.5)',
        },
      },
      y: {
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(43,24,16,0.05)',
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: 'rgba(122,69,40,0.5)',
        },
      },
    },
  }

  return (
    <div className="bg-white dark:bg-coffee-900 border border-coffee-900/8 dark:border-white/8 rounded-2xl p-4 shadow-card dark:shadow-card-dark">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-coffee-900 dark:text-coffee-50">
          {title}
        </h3>

        {subtitle && (
          <span className="text-xs text-coffee-700/45 dark:text-coffee-200/40">
            {subtitle}
          </span>
        )}
      </div>

      {hasData ? (
        <div className="h-48">
          <Line
            data={chartData}
            options={options}
          />
        </div>
      ) : (
        <EmptyChartState />
      )}
    </div>
  )
}

export function EmptyChartState({
  message = 'Aucune donnée disponible pour le moment',
}: {
  message?: string
}) {
  return (
    <div className="h-48 rounded-lg flex flex-col items-center justify-center gap-2 text-coffee-700/35 dark:text-coffee-200/30 bg-coffee-50/40 dark:bg-white/[0.02]">
      <Inbox size={24} />
      <span className="text-sm">{message}</span>
    </div>
  )
}