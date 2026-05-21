import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function PurchasePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [receiptUrl, setReceiptUrl] = useState('')
  const [uploading, setUploading] = useState(false)

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
    
    if (user) {
      setCustomerEmail(user.email || '')
      setCustomerName(user.user_metadata?.name || '')
    }
  }, [id, user])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!receiptUrl) {
      alert('الرجاء رفع إيصال الدفع')
      return
    }
    
    setSubmitting(true)
    
    const { error } = await supabase.from('orders').insert({
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      product_id: product.id,
      receipt_url: receiptUrl,
      status: 'pending'
    })
    
    if (error) {
      alert('حدث خطأ: ' + error.message)
    } else {
      alert('تم إرسال طلبك بنجاح! سنقوم بمراجعته قريباً')
      navigate('/products')
    }
    setSubmitting(false)
  }

  async function uploadReceipt(e) {
    const file = e.target.files[0]
    if (!file) return
    
    setUploading(true)
    
    const fileName = `receipt_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(fileName, file)
    
    if (error) {
      alert('فشل رفع الملف: ' + error.message)
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(fileName)
      setReceiptUrl(publicUrl)
      alert('تم رفع الإيصال بنجاح')
    }
    setUploading(false)
  }

  if (loading) return <div className="text-center py-20">جاري التحميل...</div>
  if (!product) return <div className="text-center py-20">المنتج غير موجود</div>

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to={`/products/${product.id}`} className="text-blue-600 hover:underline mb-4 inline-block">
        ← العودة إلى المنتج
      </Link>
      
      <h1 className="text-2xl font-bold mb-6">إتمام عملية الشراء</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="font-bold text-lg mb-2">{product.name}</h2>
        <p className="text-2xl font-bold text-blue-600">${product.price}</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">الاسم الكامل *</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">البريد الإلكتروني *</label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">رقم الجوال (اختياري)</label>
          <input
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">إيصال الدفع *</label>
          <input
            type="file"
            accept="image/*"
            onChange={uploadReceipt}
            className="w-full"
            disabled={uploading}
          />
          {uploading && <p className="text-sm text-gray-500 mt-1">جاري الرفع...</p>}
          {receiptUrl && <p className="text-sm text-green-600 mt-1">✓ تم رفع الإيصال</p>}
        </div>
        
        <button
          type="submit"
          disabled={submitting || uploading || !receiptUrl}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
        >
          {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
        </button>
      </form>
    </div>
  )
      }
