 
import { useParams, useNavigate } from 'react-router-dom'

export default function WarehouseHistoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Historique — Entrepôt {id}</h1>
          <p className="text-sm text-gray-500">Journal des événements et actions</p>
        </div>
        <div>
          <button onClick={() => navigate(-1)} className="px-3 py-2 bg-white border rounded-lg">Retour</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="text-sm text-gray-500">Historique (placeholder) — affichage des logs, alertes et opérations</div>
      </div>
    </div>
  )
}
