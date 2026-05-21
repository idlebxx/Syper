import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetail from './pages/ProductDetail'
import PurchasePage from './pages/PurchasePage'
import AdminDashboard from './pages/AdminDashboard'
import LoginPage from './pages/LoginPage'

function PrivateRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="flex justify-center p-8">جاري التحميل...</div>
  if (!user) return <Navigate to="/login" />
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/" />
  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/purchase/:id" element={<PurchasePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/dashboard" element={
              <PrivateRoute adminOnly>
                <AdminDashboard />
              </PrivateRoute>
            } />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
