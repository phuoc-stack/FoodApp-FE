import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, RefreshCcw } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';

interface PaymentFailedPageProps {
  cartCount: number;
}

const PaymentFailedPage: React.FC<PaymentFailedPageProps> = ({ cartCount }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const orderId = searchParams.get('order_id');
  const errorMessage = searchParams.get('error') || 'Your payment could not be processed.';

  const handleRetry = () => {
    if (orderId) {
      navigate(`/cart`);
    } else {
      navigate('/cart');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar cartCount={cartCount} />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-md text-center">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
          <p className="text-gray-600 mb-8">
            {errorMessage} Your card has not been charged.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-left">
            <h2 className="font-semibold text-red-800 mb-2">Common reasons for payment failure:</h2>
            <ul className="text-sm text-red-700 space-y-2 ml-5 list-disc">
              <li>Insufficient funds in your account</li>
              <li>Incorrect card information</li>
              <li>Your bank declined the transaction</li>
              <li>Network or connection issues</li>
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleRetry}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 hover:bg-orange-600"
            >
              <RefreshCcw size={20} />
              Try Again
            </button>
            
            <button 
              onClick={() => navigate("/")}
              className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <ArrowLeft size={20} />
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;