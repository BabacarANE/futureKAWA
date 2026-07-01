export default function RecentMeasures({ measures }: { measures: any[] }) {
  return (
    <div className="max-h-48 overflow-auto">
      <table className="w-full text-sm table-auto">
        <thead>
          <tr className="text-left text-xs text-gray-500">
            <th className="py-1">Capteur</th>
            <th className="py-1">Valeur</th>
            <th className="py-1">Heure</th>
          </tr>
        </thead>
        <tbody>
          {measures.slice(0, 50).map((m: any, i: number) => (
            <tr key={i} className="border-t">
              <td className="py-1">{m.sensor_id ?? m.id ?? '-'}</td>
              <td className="py-1">{m.value ?? m.temp ?? m.humidity ?? '-'}</td>
              <td className="py-1 text-xs text-gray-500">{m.ts ? new Date(m.ts).toLocaleTimeString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
