import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, Calendar, MessageCircle, Star, ArrowRight, Loader, Clock } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import { fetchWithAuth } from '../utils/api';
import type { Order } from '../types/types';

interface MyOrdersPageProps {
  cartCount: number;
}

const MyOrdersPage: React.FC<MyOrdersPageProps> = ({ cartCount }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const API_BASE_URL = 'http://localhost:9393';

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async (): Promise<void> => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Please login to view orders');
      setLoading(false);
      return;
    }

    try {
      const url = statusFilter === 'ALL' 
        ? `${API_BASE_URL}/api/my-orders?status=ALL`
        : `${API_BASE_URL}/api/my-orders?status=${statusFilter}`;

      const response = await fetchWithAuth(url);
      
      if (!response.ok) throw new Error('Failed to fetch orders');

      const data: Order[] = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
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

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'PAID': return 'Preparing';
      case 'COMPLETED': return 'Completed';
      case 'PENDING': return 'Pending';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Clock size={16} />;
      case 'COMPLETED':
        return <Star size={16} />;
      case 'PENDING':
        return <Package size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track your food purchases and pickups</p>
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
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-8">Start browsing delicious homemade food!</p>
            
            <button 
              onClick={() => navigate('/')}
              className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Browse Food
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Placed on {formatDate(order.orderDate)}</p>
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
                          src={`http://localhost:9393${item.imageUrl}`}
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

                {/* Seller Info */}
                <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-base font-bold text-gray-600">
                      {order.items[0]?.sellerUsername?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.items[0]?.sellerUsername}</p>
                      <p className="text-xs text-gray-500">Seller</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => alert('Contact feature coming soon')}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <MessageCircle size={16} />
                      Contact Seller
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

export default MyOrdersPage;