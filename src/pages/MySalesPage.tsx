import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, Calendar, CheckCircle, MessageCircle, Package, Loader, Search, ArrowRight } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import { fetchWithAuth } from '../utils/api';
import type { Order } from '../types/types';

interface MySalesPageProps {
  cartCount: number;
}

const MySalesPage: React.FC<MySalesPageProps> = ({ cartCount }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const API_BASE_URL = 'http://localhost:9393';

  useEffect(() => {
    fetchSales();
  }, [statusFilter]);

  const fetchSales = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please login to view sales');
      setLoading(false);
      return;
    }

    try {
      const url = statusFilter === 'ALL' 
        ? `${API_BASE_URL}/api/my-sales?status=ALL`
        : `${API_BASE_URL}/api/my-sales?status=${statusFilter}`;

      const response = await fetchWithAuth(url);

      if (!response.ok) throw new Error('Failed to fetch sales');

      const data: Order[] = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update order status');

      alert(`Order marked as ${newStatus.toLowerCase()}`);
      fetchSales();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'Preparing';
      case 'COMPLETED':
        return 'Completed';
      case 'PENDING':
        return 'Pending';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid date';
    }
  };

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
    const pendingOrders = orders.filter(o => o.status === 'PAID').length;

    return { totalRevenue, totalOrders, completedOrders, pendingOrders };
  };

  const stats = calculateStats();

  const filteredOrders = orders.filter(order =>
    order.items.some(item => 
      item.listingTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ) || (order.username && order.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar cartCount={cartCount} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Dashboard</h1>
          <p className="text-gray-600">Manage your orders and track revenue</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-3 px-4 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">All Orders</option>
              <option value="PAID">Preparing</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader size={48} className="text-orange-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading sales data...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No sales yet</h2>
            <p className="text-gray-600 mb-8">Start by creating listings to receive orders</p>
            <button
              onClick={() => navigate('/my-listings')}
              className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Manage Listings
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length > 0 && (
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                      <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>{formatDate(order.orderDate)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-500">${order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mb-2"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={`${API_BASE_URL}${item.imageUrl}`}
                          alt={item.listingTitle}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">{item.listingTitle}</h4>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Customer Info & Actions */}
                <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-base font-bold text-gray-600">
                      {order.username?.charAt(0).toUpperCase() || 'B'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.username}</p>
                      <p className="text-xs text-gray-500">Customer</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {order.status === 'PAID' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-green-600 flex items-center gap-2 transition-colors"
                      >
                        <CheckCircle size={16} />
                        Mark Completed
                      </button>
                    )}
                    <button
                      onClick={() => alert('Contact feature coming soon')}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <MessageCircle size={16} />
                      Contact Buyer
                    </button>
                    <button
                      onClick={() => navigate(`/order-detail?id=${order.id}`)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium cursor-pointer hover:bg-orange-600 flex items-center gap-2 transition-colors"
                    >
                      <ArrowRight size={16} />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySalesPage;