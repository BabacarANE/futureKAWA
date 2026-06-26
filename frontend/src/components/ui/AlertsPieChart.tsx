import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { EmptyChartState } from './LineChartCard'

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
)

interface AlertsPieChartProps {
  data: {
    name: string
    value: number
    color: string
  }[]
}

export default function AlertsPieChart({ data }: AlertsPieChartProps) {
  const filtered = data.filter(item => item.value > 0)

  if (filtered.length === 0) {
    return <EmptyChartState message="Aucune alerte à afficher" />
  }

  const chartData = {
    labels: filtered.map(item => item.name),
    datasets: [
      {
        data: filtered.map(item => item.value),
        backgroundColor: filtered.map(item => item.color),
        borderWidth: 0,
        spacing: 2,
        hoverOffset: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle' as const,
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: '#fff',
        titleColor: '#2B1810',
        bodyColor: '#2B1810',
        borderColor: 'rgba(43,24,16,0.1)',
        borderWidth: 1,
        cornerRadius: 10,
        padding: 10,
        callbacks: {
          label: (context: any) =>
            `${context.label}: ${context.parsed}`,
        },
      },
    },
  }

  return (
    <div className="h-48">
      <Doughnut
        data={chartData}
        options={options}
      />
    </div>
  )
}