import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import CountriesPage from './pages/CountriesPage'
import CountryViewPage from './pages/CountryViewPage'
import CountryEditPage from './pages/CountryEditPage'
import CountryCreatePage from './pages/CountryCreatePage'
import WarehousesPage from './pages/WarehousesPage'
import WarehouseViewPage from './pages/WarehouseViewPage'
import WarehouseEditPage from './pages/WarehouseEditPage'
import WarehouseHistoryPage from './pages/WarehouseHistoryPage'
import LotsPage from './pages/LotsPage'
import LotDetailPage from './pages/LotDetailPage'
import LotPage from './pages/LotPage'
import RealtimePage from './pages/RealtimePage'
import SupervisionPage from './pages/SupervisionPage'
import Layout from './components/Layout'
import AnalyticsPage from './pages/AnalyticsPage'
import Notification from './pages/Notification'
import Profile from './pages/Profile'
import NotFoundPage from './pages/NotFound'
import Administration from './pages/Administration'
import Settings from './pages/Settings'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-coffee-500" />
    </div>
  )
  return user ? <>{children}</> : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/countries" element={
        <PrivateRoute>
          <Layout>
            <CountriesPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/countries/new" element={
        <PrivateRoute>
          <Layout>
            <CountryCreatePage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/countries/:code" element={
        <PrivateRoute>
          <Layout>
            <CountryViewPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/countries/:code/edit" element={
        <PrivateRoute>
          <Layout>
            <CountryEditPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/warehouses" element={
        <PrivateRoute>
          <Layout>
            <WarehousesPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/warehouses/:id" element={
        <PrivateRoute>
          <Layout>
            <WarehouseViewPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/warehouses/:id/edit" element={
        <PrivateRoute>
          <Layout>
            <WarehouseEditPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/warehouses/:id/history" element={
        <PrivateRoute>
          <Layout>
            <WarehouseHistoryPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/lots" element={
        <PrivateRoute>
          <Layout>
            <LotsPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/lots/:lotId" element={
        <PrivateRoute>
          <Layout>
            <LotDetailPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/lots/:lotId" element={
        <PrivateRoute>
          <Layout>
            <LotPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/realtime" element={
        <PrivateRoute>
          <Layout>
            <RealtimePage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/iot" element={
        <PrivateRoute>
          <Layout>
            <RealtimePage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/supervision" element={
        <PrivateRoute>
          <Layout>
            <SupervisionPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/alerts" element={
        <PrivateRoute>
          <Layout>
            <SupervisionPage />
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/analytics" element={
        <PrivateRoute>
          <Layout>
            <AnalyticsPage/>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/notifications" element={
        <PrivateRoute>
          <Layout>
            <Notification/>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <Layout>
            <Settings/>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute>
          <Layout>
            <Profile/>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/notfound" element={
        <PrivateRoute>
          <Layout>
            <NotFoundPage/>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="/admin" element={
        <PrivateRoute>
          <Layout>
            <Administration/>
          </Layout>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
