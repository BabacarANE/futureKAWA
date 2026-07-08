import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './src/context/AuthContext'
import { ThemeProvider } from './src/context/ThemeContext'

import LoginPage from './src/pages/Auth/LoginPage'
import RegisterPage from './src/pages/Auth/RegisterPage'
import ForgotPasswordPage from './src/pages/Auth/ForgotPasswordPage'
import UnauthorizedPage from './src/pages/Auth/UnauthorizedPage'

import DashboardPage from './src/pages/DashboardPage'
import CountriesPage from './src/pages/CountriesPage'
import CountryViewPage from './src/pages/CountryViewPage'
import CountryEditPage from './src/pages/CountryEditPage'
import CountryCreatePage from './src/pages/CountryCreatePage'

import WarehousesPage from './src/pages/WarehousesPage'
import WarehouseViewPage from './src/pages/WarehouseViewPage'
import WarehouseEditPage from './src/pages/WarehouseEditPage'
import WarehouseHistoryPage from './src/pages/WarehouseHistoryPage'

import LotsPage from './src/pages/LotsPage'
import LotDetailPage from './src/pages/LotDetailPage'
import ExpeditionsPage from './src/pages/ExpeditionsPage'
import ClientsPage from './src/pages/ClientsPage'

import RealtimePage from './src/pages/RealtimePage'
import SupervisionPage from './src/pages/SupervisionPage'
import AnalyticsPage from './src/pages/AnalyticsPage'

import Notification from './src/pages/Notification'
import Profile from './src/pages/Profile'
import Settings from './src/pages/Settings'
import Administration from './src/pages/Administration'

import Layout from './src/components/Layout'
import NotFoundPage from './src/pages/NotFound'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-coffee-500" />
      </div>
    )
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <PrivateRoute>
      <Layout>{children}</Layout>
    </PrivateRoute>
  )
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages — pas de Layout */}
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/register"       element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized"   element={<UnauthorizedPage />} />

      {/* Pages protégées avec Layout */}
      <Route path="/" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />

      <Route path="/countries"    element={<ProtectedLayout><CountriesPage /></ProtectedLayout>} />
      <Route path="/countries/new" element={<ProtectedLayout><CountryCreatePage /></ProtectedLayout>} />
      <Route path="/countries/:code"       element={<ProtectedLayout><CountryViewPage /></ProtectedLayout>} />
      <Route path="/countries/:code/edit"  element={<ProtectedLayout><CountryEditPage /></ProtectedLayout>} />

      <Route path="/warehouses"            element={<ProtectedLayout><WarehousesPage /></ProtectedLayout>} />
      <Route path="/warehouses/:id"        element={<ProtectedLayout><WarehouseViewPage /></ProtectedLayout>} />
      <Route path="/warehouses/:id/edit"   element={<ProtectedLayout><WarehouseEditPage /></ProtectedLayout>} />
      <Route path="/warehouses/:id/history" element={<ProtectedLayout><WarehouseHistoryPage /></ProtectedLayout>} />

      <Route path="/lots"                element={<ProtectedLayout><LotsPage /></ProtectedLayout>} />
      <Route path="/lots/:country/:id"  element={<ProtectedLayout><LotDetailPage /></ProtectedLayout>} />
      <Route path="/expeditions"         element={<ProtectedLayout><ExpeditionsPage /></ProtectedLayout>} />
      <Route path="/clients"             element={<ProtectedLayout><ClientsPage /></ProtectedLayout>} />

      <Route path="/iot"        element={<ProtectedLayout><RealtimePage /></ProtectedLayout>} />
      <Route path="/alerts"     element={<ProtectedLayout><SupervisionPage /></ProtectedLayout>} />
      <Route path="/analytics"  element={<ProtectedLayout><AnalyticsPage /></ProtectedLayout>} />

      <Route path="/notifications" element={<ProtectedLayout><Notification /></ProtectedLayout>} />
      <Route path="/profile"       element={<ProtectedLayout><Profile /></ProtectedLayout>} />
      <Route path="/settings"      element={<ProtectedLayout><Settings /></ProtectedLayout>} />
      <Route path="/admin"         element={<ProtectedLayout><Administration /></ProtectedLayout>} />

      <Route path="/notfound" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      {/* ThemeProvider au niveau racine → dark mode global dans toute l'app */}
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}