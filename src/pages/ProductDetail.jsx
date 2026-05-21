import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        setProduct(data)
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>
  if (!product) return <div className="text-center py-20">المنتج غير موجود</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/products" className="text-blue-600 hover:underline mb-4 inline-block">
        ← العودة إلى المنتجات
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden md:flex">
        <div className="md:w-1/2 bg-gray-100 p-8 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-32 h-32 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        
        <div className="md:w-1/2 p-8">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <div className="text-3xl font-bold text-blue-600 mb-6">
            ${product.price}
          </div>
          <Link 
            to={`/purchase/${product.id}`}
            className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            شراء الآن
          </Link>
        </div>
      </div>
    </div>
  )
}
