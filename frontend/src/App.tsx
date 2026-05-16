import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from '@/components/Common/ErrorBoundary'
import Layout from '@/components/Layout/Layout'
import AdminLayout from '@/components/Admin/AdminLayout'
import HomePage from '@/pages/Home/HomePage'
import CollectionPage from '@/pages/Collection/CollectionPage'
import DashboardPage from '@/pages/admin/Dashboard/DashboardPage'
import SeriesPage from '@/pages/admin/Series/SeriesPage'
import ItemsPage from '@/pages/admin/Items/ItemsPage'
import StatsPage from '@/pages/admin/Stats/StatsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
        {/* 用户端 */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<CollectionPage />} />
        </Route>
        {/* 后台管理 */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/admin/series" element={<SeriesPage />} />
          <Route path="/admin/items" element={<ItemsPage />} />
          <Route path="/admin/stats" element={<StatsPage />} />
        </Route>
      </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  )
}
