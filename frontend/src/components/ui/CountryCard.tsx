 

type Props = {
  code: string
  name: string
  warehouses: number
  idealTemp: number
  idealHumidity: number
  lots: number
  alerts: number
  onView?: () => void
  onEdit?: () => void
  onDashboard?: () => void
}

function flagEmoji(countryCode: string) {
  try {
    return countryCode
      .toUpperCase()
      .replace(/./g, (c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
  } catch {
    return '🏳️'
  }
}

export default function CountryCard({ code, name, warehouses, idealTemp, idealHumidity, lots, alerts, onView, onEdit, onDashboard }: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-gray-50">{flagEmoji(code)}</div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{name}</div>
            <div className="text-xs text-gray-500">{code}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Entrepôts</div>
          <div className="font-medium">{warehouses}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Temp idéale</div>
          <div className="font-medium">{idealTemp}°C</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Humidité idéale</div>
          <div className="font-medium">{idealHumidity}%</div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="text-xs text-gray-500">Lots</div>
          <div className="font-medium">{lots}</div>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-xs text-red-600">Alertes</div>
          <div className="font-medium text-red-600">{alerts}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button onClick={onView} className="flex-1 py-2 px-3 bg-white border border-gray-200 rounded-lg text-sm">Voir</button>
        <button onClick={onEdit} className="py-2 px-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">Modifier</button>
        <button onClick={onDashboard} className="py-2 px-3 bg-coffee-700 text-white rounded-lg text-sm">Tableau de bord</button>
      </div>
    </div>
  )
}
