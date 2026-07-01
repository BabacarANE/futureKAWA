import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface Props {
  children: React.ReactNode
  requiredPage?: string
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, requiredPage, adminOnly }: Props) {
  const { isAuthenticated, isLoading, isAdmin, hasPermission } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin" />
          <p className="text-sm text-stone-500">Chargement…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  if (requiredPage && !hasPermission(requiredPage)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}