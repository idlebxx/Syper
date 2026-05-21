import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-blue-600">
          CyberStore
        </Link>
        
        <div className="flex gap-6 items-center">
          <Link to="/products" className="text-gray-700 hover:text-blue-600">
            المنتجات
          </Link>
          
          {user ? (
            <div className="flex gap-3 items-center">
              {profile?.role === 'admin' && (
                <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600">
                  لوحة التحكم
                </Link>
              )}
              <span className="text-sm text-gray-500">{user.email}</span>
              <button 
                onClick={signOut}
                className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
              >
                خروج
              </button>
            </div>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              دخول
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
