import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { Measure } from '../types'

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
)

interface Props {
  measures: Measure[]
}

export default function ChartTempHumidity({ measures }: Props) {
  if (!measures.length) return (
    <div className="text-center py-12 text-gray-400">
      Aucune mesure disponible.
    </div>
  )

  const labels = measures.map(m =>
    new Date(m.timestamp).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit'
    })
  )

  const data = {
    labels,
    datasets: [
      {
        label: 'Température (°C)',
        data: measures.map(m => m.temperature),
        borderColor: '#8B4513',
        backgroundColor: 'rgba(139,69,19,0.08)',
        yAxisID: 'y',
        tension: 0.3,
        fill: true,
        pointRadius: 3,
      },
      {
        label: 'Humidité (%)',
        data: measures.map(m => m.humidity),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.08)',
        yAxisID: 'y1',
        tension: 0.3,
        fill: true,
        pointRadius: 3,
      },
    ],
  }

  const options = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'top' as const,
        onClick: (_e: any, legendItem: any, legend: any) => {
          const index = legendItem.datasetIndex
          const chart = legend.chart
          const meta = chart.getDatasetMeta(index)
          meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null
          chart.update()
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: { display: true, text: '°C' },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: { display: true, text: '%' },
        grid: { drawOnChartArea: false },
      },
    },
  }

  return <Line data={data} options={options} />
}
