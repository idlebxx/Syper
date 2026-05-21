import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let query = supabase.from('products').select('*')
    
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }
    
    query.then(({ data }) => {
      setProducts(data || [])
      setLoading(false)
    })
  }, [search])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">جميع المنتجات</h1>
      
      <div className="mb-6">
        <input
          type="text"
          placeholder="ابحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {loading ? (
        <div className="text-center py-20">جاري التحميل...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-500">لا توجد منتجات</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <Link key={product.id} to={`/products/${product.id}`} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
              <div className="p-5">
                <h3 className="font-bold text-xl mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-3">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-blue-600 font-bold text-lg">${product.price}</span>
                  <span className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm">شراء</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
