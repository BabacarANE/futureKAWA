 
import { useParams, useNavigate } from 'react-router-dom'

export default function CountryViewPage() {
  const { code } = useParams()
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Pays — {code}</h1>
          <p className="text-sm text-gray-500">Détails et indicateurs pour {code}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-white border rounded-lg">Retour</button>
          <button onClick={() => navigate(`/countries/${code}/edit`)} className="px-3 py-2 bg-amber-50 border rounded-lg">Modifier</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-2">Drapeau & Localisation</h3>
          <div className="text-sm text-gray-500">Drapeau, coordonnées et informations générales du pays.</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-2">Graphiques</h3>
          <div className="text-sm text-gray-500">Température, humidité et tendances des capteurs.</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-2">Entrepôts & Alertes</h3>
          <div className="text-sm text-gray-500">Liste des entrepôts, nombre de lots et alertes associées.</div>
        </div>
      </div>
    </div>
  )
}
