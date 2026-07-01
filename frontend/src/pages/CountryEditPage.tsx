 
import { useParams, useNavigate } from 'react-router-dom'

export default function CountryEditPage() {
  const { code } = useParams()
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Modifier {code}</h1>
          <p className="text-sm text-gray-500">Modifier les paramètres et seuils pour {code}</p>
        </div>
        <div>
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-white border rounded-lg">Annuler</button>
        </div>
      </div>

      <form className="space-y-4 bg-white p-4 rounded-2xl shadow-sm max-w-xl">
        <label className="block">
          <div className="text-xs text-gray-500">Température idéale</div>
          <input defaultValue={22} className="w-full mt-1 p-2 border rounded-lg" />
        </label>
        <label className="block">
          <div className="text-xs text-gray-500">Humidité idéale</div>
          <input defaultValue={60} className="w-full mt-1 p-2 border rounded-lg" />
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate(-1)} className="px-3 py-2 bg-white border rounded-lg">Annuler</button>
          <button type="submit" className="px-3 py-2 bg-coffee-700 text-white rounded-lg">Enregistrer</button>
        </div>
      </form>
    </div>
  )
}
