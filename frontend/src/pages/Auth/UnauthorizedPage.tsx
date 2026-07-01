import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function UnauthorizedPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl font-black text-stone-200 dark:text-stone-800 mb-4">403</div>
        <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">Accès non autorisé</h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 mb-8">
          Votre rôle <strong>({user?.role ?? 'inconnu'})</strong> ne permet pas d'accéder à cette page.
          Contactez un administrateur si nécessaire.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate(-1)} className="px-4 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
            ← Retour
          </button>
          <Link to="/" className="px-4 py-2 text-sm rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-700 dark:hover:bg-white transition-colors font-medium">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}