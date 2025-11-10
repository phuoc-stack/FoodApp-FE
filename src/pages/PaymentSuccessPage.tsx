import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight, ShoppingBag } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import { fetchWithAuth } from '../utils/api';
import type { Order } from '../types/types';

interface PaymentSuccessPageProps {
  cartCount: number;
}

const PaymentSuccessPage: React.FC<PaymentSuccessPageProps> = ({ cartCount }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('order_id');
    
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setError('Order ID not found');
      setLoading(false);
    }
  }, [location]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const response = await fetchWithAuth(`http://localhost:9393/api/my-orders/${orderId}`);
      
      if (!response.ok) throw new Error('Failed to fetch order details');
      
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setLoading(false);
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
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar cartCount={cartCount} />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar cartCount={cartCount} />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl p-8 shadow-md text-center">
            <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/orders')} 
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium"
            >
              View My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar cartCount={cartCount} />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-md text-center">
          <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle size={48} className="text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-8">Thank you for your order. Your payment has been processed successfully.</p>
          
          {order && (
            <div className="border border-gray-200 rounded-xl p-6 mb-8 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Order ID:</span>
                <span className="text-gray-900 font-medium">#{order.id}</span>
              </div>
              
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Date:</span>
                <span className="text-gray-900">{formatDate(order.orderDate)}</span>
              </div>
              
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  <Clock size={14} className="mr-1" />
                  {order.status === 'PAID' ? 'Preparing' : order.status}
                </span>
              </div>
              
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Items:</span>
                <span className="text-gray-900">{order.items.length}</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg">
                <span className="text-gray-800">Total:</span>
                <span className="text-orange-500">${order.totalAmount.toFixed(2)}</span>
              </div>
              
              <div className="border-t border-gray-200 mt-6 pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Pickup Information</h3>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Seller:</span> {order.username}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Pickup Time:</span> Check order details
                </p>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate(`/order-detail?id=${order?.id}`)}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 hover:bg-orange-600"
            >
              <ShoppingBag size={20} />
              View Order Details
            </button>
            
            <button 
              onClick={() => navigate("/")}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <ArrowRight size={20} />
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;