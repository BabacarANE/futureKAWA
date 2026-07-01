import { useEffect, useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { createUser, deleteUser, getCountries, getRoles, getUsers, updateUser } from '../services/api'
import type { Country, User } from '../types'

export default function AdminUserPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [roles, setRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getUsers()
      setUsers(data)
    } catch {
      setError('Impossible de récupérer les utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRoles()
      .then(setRoles)
      .catch(() => setError('Impossible de récupérer les rôles'))
    getCountries()
      .then(setCountries)
      .catch(() => setError('Impossible de récupérer les codes pays'))
    fetchUsers()
  }, [])

  const resetForm = () => {
    setEditingUserId(null)
    setName('')
    setEmail('')
    setPassword('')
    setRole('')
    setCountryCode('')
    setMessage('')
    setError('')
  }

  const handleEdit = (userToEdit: User) => {
    setEditingUserId(userToEdit.id)
    setName(userToEdit.name)
    setEmail(userToEdit.email)
    setPassword('')
    setRole(userToEdit.role)
    setCountryCode(userToEdit.country_code || '')
    setMessage('')
    setError('')
  }

  const handleDelete = async (userId: number, countryCode?: string | null) => {
    if (!window.confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) {
      return
    }
    setLoading(true)
    setMessage('')
    setError('')

    try {
      await deleteUser(userId, countryCode)
      setMessage('Utilisateur supprimé avec succès')
      fetchUsers()
      if (editingUserId === userId) {
        resetForm()
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Échec de la suppression de l’utilisateur')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (editingUserId) {
        await updateUser(editingUserId, {
          name,
          email,
          role,
          country_code: countryCode || null,
          ...(password ? { password } : {}),
        })
        setMessage('Utilisateur mis à jour avec succès')
      } else {
        await createUser({
          name,
          email,
          password,
          role,
          country_code: countryCode || null,
        })
        setMessage('Utilisateur créé avec succès')
      }
      resetForm()
      fetchUsers()
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Échec de la sauvegarde de l’utilisateur')
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== 'siege') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Accès réservé aux administrateurs</h1>
        <p className="text-gray-600">Vous n’avez pas le rôle requis pour accéder à cette page.</p>
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-coffee-700 text-white hover:bg-coffee-500"
        >
          Retour au tableau de bord
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Créez, modifiez ou supprimez des comptes utilisateur.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Utilisateurs existants</h2>
            <button
              onClick={resetForm}
              className="text-sm text-coffee-700 hover:text-coffee-900"
            >
              Nouveau utilisateur
            </button>
          </div>
          <div className="p-6">
            {loading && users.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-500" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-sm text-gray-500">Aucun utilisateur trouvé.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-gray-700">
                  <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Nom</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Rôle</th>
                      <th className="px-4 py-3">Pays</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.email}</td>
                        <td className="px-4 py-3 capitalize">{item.role.replace('_', ' ')}</td>
                        <td className="px-4 py-3">{item.country_code || 'Siège'}</td>
                        <td className="px-4 py-3 space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-sm text-coffee-700 hover:text-coffee-900"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.country_code)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card max-w-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                placeholder={editingUserId ? 'Laisser vide pour conserver' : ''}
                {...(!editingUserId ? { required: true } : {})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
                required
              >
                <option value="">Sélectionner un rôle</option>
                {roles.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code pays</label>
              <select
                value={countryCode}
                onChange={e => setCountryCode(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-500"
              >
                <option value="">Siège (aucun code)</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.code} — {country.name}
                  </option>
                ))}
              </select>
            </div>

            {message && (
              <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-xl bg-coffee-700 px-5 py-3 text-sm font-semibold text-white hover:bg-coffee-500 disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : editingUserId ? 'Mettre à jour' : 'Créer l’utilisateur'}
              </button>
              {editingUserId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
