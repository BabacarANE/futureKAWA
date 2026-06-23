 
import { useParams, useNavigate } from 'react-router-dom'

export default function WarehouseViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Entrepôt {id}</h1>
          <p className="text-sm text-gray-500">Détails et mesures en temps réel</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-white border rounded-lg">Retour</button>
          <button onClick={() => navigate(`/warehouses/${id}/edit`)} className="px-3 py-2 bg-amber-50 border rounded-lg">Modifier</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-2">Photo & Informations</h3>
          <div className="text-sm text-gray-500">Photo, adresse et informations principales de l'entrepôt.</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-2">Capteurs</h3>
          <div className="text-sm text-gray-500">Graphiques de température et d'humidité en temps réel.</div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-2">Alertes</h3>
          <div className="text-sm text-gray-500">Liste des alertes récentes et actions recommandées.</div>
        </div>
      </div>
    </div>
  )
}
