import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-coffee-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-2xl">☕</span>
            <span className="font-bold text-lg tracking-tight">FutureKawa</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-sm text-coffee-200">
              {user?.name} —
              <span className="ml-1 text-coffee-100 font-medium">{user?.role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm bg-coffee-700 hover:bg-coffee-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
