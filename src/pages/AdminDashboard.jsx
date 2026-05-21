import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('products')
  const [loading, setLoading] = useState(true)
  
  // State لنافذة إضافة/تعديل المنتج
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    file_url: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadProducts()
    loadOrders()
  }, [])

  async function loadProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  async function loadOrders() {
    const { data } = await supabase.from('orders').select('*, product:products(*)').order('created_at', { ascending: false })
    setOrders(data || [])
  }

  async function updateOrderStatus(orderId, status) {
    await supabase.from('orders').update({ status }).eq('id', orderId)
    loadOrders()
  }

  // فتح نافذة إضافة منتج جديد
  function openAddModal() {
    setEditingProduct(null)
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      file_url: ''
    })
    setShowProductModal(true)
  }

  // فتح نافذة تعديل منتج
  function openEditModal(product) {
    setEditingProduct(product)
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      image_url: product.image_url || '',
      file_url: product.file_url || ''
    })
    setShowProductModal(true)
  }

  // حفظ المنتج (إضافة أو تعديل)
  async function saveProduct() {
    if (!productForm.name.trim() || !productForm.price) {
      alert('الرجاء إدخال اسم المنتج والسعر')
      return
    }

    setSaving(true)

    const productData = {
      name: productForm.name.trim(),
      description: productForm.description.trim() || null,
      price: parseFloat(productForm.price),
      category: productForm.category.trim() || null,
      image_url: productForm.image_url.trim() || null,
      file_url: productForm.file_url.trim() || null
    }

    let error
    if (editingProduct) {
      // تعديل منتج موجود
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id)
      error = updateError
    } else {
      // إضافة منتج جديد
      const { error: insertError } = await supabase
        .from('products')
        .insert([productData])
      error = insertError
    }

    if (error) {
      alert('حدث خطأ: ' + error.message)
    } else {
      alert(editingProduct ? 'تم تعديل المنتج بنجاح' : 'تم إضافة المنتج بنجاح')
      setShowProductModal(false)
      loadProducts()
    }
    setSaving(false)
  }

  // حذف منتج
  async function deleteProduct(productId, productName) {
    if (confirm(`هل أنت متأكد من حذف المنتج "${productName}"؟`)) {
      const { error } = await supabase.from('products').delete().eq('id', productId)
      if (error) {
        alert('حدث خطأ: ' + error.message)
      } else {
        alert('تم حذف المنتج بنجاح')
        loadProducts()
      }
    }
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    verified: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }

  const statusText = {
    pending: 'قيد المراجعة',
    verified: 'تم التحقق',
    completed: 'مكتمل',
    rejected: 'مرفوض'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">لوحة التحكم</h1>
      
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-2 px-4 ${activeTab === 'products' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          المنتجات ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
        >
          الطلبات ({orders.length})
        </button>
      </div>
      
      {/* قسم المنتجات */}
      {activeTab === 'products' && (
        <div>
          {/* زر إضافة منتج جديد */}
          <div className="mb-4 flex justify-end">
            <button
              onClick={openAddModal}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition flex items-center gap-2"
            >
              <span className="text-xl">+</span> إضافة منتج جديد
            </button>
          </div>

          {/* جدول المنتجات */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right">#</th>
                    <th className="px-4 py-3 text-right">اسم المنتج</th>
                    <th className="px-4 py-3 text-right">الوصف</th>
                    <th className="px-4 py-3 text-right">السعر</th>
                    <th className="px-4 py-3 text-right">التصنيف</th>
                    <th className="px-4 py-3 text-right">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">جاري التحميل...</td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-500">
                        لا توجد منتجات. اضغط "إضافة منتج جديد" لإضافة أول منتج
                      </td>
                    </tr>
                  ) : (
                    products.map((product, index) => (
                      <tr key={product.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 font-medium">{product.name}</td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{product.description || '-'}</td>
                        <td className="px-4 py-3 text-blue-600 font-bold">${product.price}</td>
                        <td className="px-4 py-3">{product.category || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(product)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                            >
                              تعديل
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id, product.name)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* قسم الطلبات */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right">العميل</th>
                  <th className="px-4 py-3 text-right">المنتج</th>
                  <th className="px-4 py-3 text-right">السعر</th>
                  <th className="px-4 py-3 text-right">الحالة</th>
                  <th className="px-4 py-3 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_email}</div>
                      {order.customer_phone && <div className="text-sm text-gray-500">{order.customer_phone}</div>}
                    </td>
                    <td className="px-4 py-3">{order.product?.name || '-'}</td>
                    <td className="px-4 py-3">${order.product?.price || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                        {statusText[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {order.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'verified')} 
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                              تحقق
                            </button>
                            <button 
                              onClick={() => updateOrderStatus(order.id, 'rejected')} 
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              رفض
                            </button>
                          </>
                        )}
                        {order.status === 'verified' && (
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'completed')} 
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                          >
                            إكمال
                          </button>
                        )}
                        {order.receipt_url && (
                          <a 
                            href={order.receipt_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                          >
                            الإيصال
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      لا توجد طلبات حالياً
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نافذة إضافة/تعديل المنتج (Modal) */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">اسم المنتج *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="مثال: أداة اختبار الاختراق"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">الوصف</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows="3"
                    placeholder="وصف المنتج..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">السعر *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">التصنيف</label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="مثال: tools, courses, software"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">رابط الصورة</label>
                  <input
                    type="url"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">رابط التحميل</label>
                  <input
                    type="url"
                    value={productForm.file_url}
                    onChange={(e) => setProductForm({...productForm, file_url: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveProduct}
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'جاري الحفظ...' : (editingProduct ? 'تحديث' : 'إضافة')}
                </button>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
    }
