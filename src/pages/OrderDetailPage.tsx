import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Package,
  CheckCircle,
  MessageCircle,
  Printer,
  Phone,
  User,
  FileText,
  Star,
  ShoppingBag,
  AlertTriangle,
  Loader
} from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import { fetchWithAuth } from '../utils/api';
import type { Order } from '../types/types';

interface OrderDetailPageProps {
  cartCount: number;
}

const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ cartCount }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  
  const API_BASE_URL = 'http://localhost:9393';
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get('id');
    
    if (orderId) {
      fetchOrderDetails(orderId);
    } else {
      setError('Order ID not found');
      setLoading(false);
    }
  }, [location]);

  const fetchOrderDetails = async (orderId: string) => {
    try {
      // First try as a buyer
      const response = await fetchWithAuth(`${API_BASE_URL}/api/my-orders/${orderId}`);
      
      if (!response.ok) {
        // If not found as buyer, try as seller
        const sellerResponse = await fetchWithAuth(`${API_BASE_URL}/api/orders/${orderId}`);
        
        if (!sellerResponse.ok) {
          throw new Error('Failed to fetch order details');
        }
        
        const data = await sellerResponse.json();
        setOrder(data);
        setIsSeller(true);
      } else {
        const data = await response.json();
        setOrder(data);
        setIsSeller(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;
    
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/orders/${order.id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update order status');

      alert(`Order marked as ${newStatus.toLowerCase()}`);
      fetchOrderDetails(order.id.toString());
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Invalid time';
    }
  };

  const getStatusBadge = (status: string) => {
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
        return 'Pending Payment';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Clock size={16} />;
      case 'COMPLETED':
        return <CheckCircle size={16} />;
      case 'PENDING':
        return <AlertTriangle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { label: 'Order Placed', completed: true, status: 'PENDING' },
      { label: 'Payment Confirmed', completed: ['PAID', 'COMPLETED'].includes(order?.status || ''), status: 'PAID' },
      { label: 'Preparing', completed: ['PAID', 'COMPLETED'].includes(order?.status || ''), status: 'PAID' },
      { label: 'Ready for Pickup', completed: order?.status === 'COMPLETED', status: 'COMPLETED' }
    ];
    
    // Find current step
    const currentStepIndex = steps.findIndex(step => step.status === order?.status);
    
    return {
      steps,
      currentStepIndex: currentStepIndex !== -1 ? currentStepIndex : 0
    };
  };

  const { steps, currentStepIndex } = getProgressSteps();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar cartCount={cartCount} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <Loader size={48} className="text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar cartCount={cartCount} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl p-8 shadow-md text-center">
            <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <AlertTriangle size={48} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar cartCount={cartCount} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl p-8 shadow-md text-center">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">We couldn't find the order you're looking for.</p>
            <Link
              to={isSeller ? "/my-sales" : "/orders"}
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar cartCount={cartCount} />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-orange-500"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to {isSeller ? "Sales" : "Orders"}
          </button>
        </div>
        
        {/* Order Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {getStatusLabel(order.status)}
                </span>
              </div>
              <p className="text-gray-600">Placed on {formatDate(order.orderDate)}</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-orange-500">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Order Progress */}
          <div className="mt-8">
            <div className="relative">
              {/* Progress Bar */}
              <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gray-200 z-0"></div>
              <div 
                className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-orange-500 z-0"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              ></div>
              
              {/* Steps */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => (
                  <div key={index} className="flex flex-col items-center z-10">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold mb-2 ${
                      step.completed 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-white border-2 border-gray-300 text-gray-500'
                    }`}>
                      {step.completed ? (index + 1) : (index + 1)}
                    </div>
                    <span className={`text-xs text-center whitespace-nowrap ${
                      step.completed ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Order Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ShoppingBag size={18} />
              Order Items
            </h2>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  {item.imageUrl ? (
                    <img
                      src={`${API_BASE_URL}${item.imageUrl}`}
                      alt={item.listingTitle}
                      className="h-16 w-16 rounded-lg object-cover mr-4"
                      onError={(e) => {
                        // Fallback for failed images
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64?text=Food';
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 bg-gray-200 rounded-lg flex-shrink-0 mr-4 flex items-center justify-center text-gray-400">
                      <Package size={24} />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.listingTitle}</h3>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className="font-bold text-gray-900">${(item.quantity * item.price).toFixed(2)}</span>
                    <p className="text-xs text-gray-600">${item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">${order.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-orange-500">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Contact Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} />
              {isSeller ? "Customer Details" : "Seller Details"}
            </h2>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                {order.username ? order.username.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{order.username || 'User'}</h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Star size={14} className="text-yellow-400 mr-1" />
                  <span>4.8 (24 reviews)</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <button className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <MessageCircle size={16} />
                Send Message
              </button>
              
              <button className="w-full py-3 border border-gray-300 rounded-lg text-gray-700 font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                <Phone size={16} />
                Call
              </button>
            </div>
          </div>
          
          {/* Pickup Details */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} />
              Pickup Details
            </h2>
            
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-2 mb-4">
                <MapPin size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Pickup Address</p>
                  {/* This would be better coming from the item.pickupAddress if available */}
                  <p className="text-sm text-gray-600">123 Main Street, Apt 4B, Melbourne, VIC 3000</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Clock size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Pickup Time</p>
                  <p className="text-sm text-gray-600">Today, {formatTime(order.orderDate)} - {formatTime(new Date(new Date(order.orderDate).getTime() + 3600000).toISOString())}</p>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2 font-medium text-gray-900">Pickup Instructions:</p>
              <p>Please text when you arrive. I'll meet you at the front entrance of the building.</p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap justify-between gap-4 mt-8">
          <div>
            {isSeller && order.status === 'PAID' && (
              <button 
                onClick={() => updateOrderStatus('COMPLETED')}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-green-600 transition-colors"
              >
                <CheckCircle size={18} />
                Mark as Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;