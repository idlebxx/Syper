import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [activeTab, setActiveTab] = useState('products')
  const [loading, setLoading] = useState(true)

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
      
      {activeTab === 'products' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-right">المنتج</th>
                  <th className="px-4 py-3 text-right">السعر</th>
                  <th className="px-4 py-3 text-right">التصنيف</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-t">
                    <td className="px-4 py-3">{product.name}</td>
                    <td className="px-4 py-3">${product.price}</td>
                    <td className="px-4 py-3">{product.category || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
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
