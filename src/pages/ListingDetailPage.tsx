import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Clock, MapPin, Star, Minus, Plus } from 'lucide-react';
import NavigationBar from '../components/NavigationBar';
import { fetchWithAuth } from '../utils/api';
import type { Listing } from '../types/types';

interface ListingDetailPageProps {
  cartCount: number;
}

const ListingDetailPage: React.FC<ListingDetailPageProps> = ({ cartCount }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [addingToCart, setAddingToCart] = useState<boolean>(false);

  const API_BASE_URL = 'http://localhost:9393';

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    if (!id) return;
    
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/listings/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch listing details');
      }
      
      const data = await response.json();
      setListing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listing details');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!listing) return;
    
    setAddingToCart(true);
    
    try {
      // Add to cart multiple times based on quantity
      for (let i = 0; i < quantity; i++) {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/cart/add/${listing.id}`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          throw new Error('Failed to add to cart');
        }
      }
      
      alert('Added to cart successfully!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar cartCount={cartCount} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar cartCount={cartCount} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl p-8 shadow-md text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Unable to load listing</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = (quantity * parseFloat(listing.price.toString())).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar cartCount={cartCount} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb navigation */}
        <div className="flex items-center text-sm text-gray-600 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-orange-500">
            Home
          </button>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{listing.title}</span>
        </div>

        {/* Product details */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left side - Image */}
          <div className="md:w-1/2">
            <div className="relative">
              <span className="absolute top-4 left-4 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Fresh Today
              </span>
              <button 
                className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md"
                aria-label="Add to favorites"
              >
                <Heart size={20} className="text-gray-500" />
              </button>
              <img 
                src={`http://localhost:9393${listing.imageUrl}`} 
                alt={listing.title}
                className="w-full h-[400px] object-cover rounded-2xl" 
              />
            </div>
          </div>

          {/* Right side - Details */}
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {listing.title}
            </h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium ml-1">4.8</span>
              </div>
              <span className="text-sm text-gray-600">(24 reviews)</span>
              <span className="text-sm text-gray-400 ml-2">• Prep time: 2 hours</span>
            </div>
            
            <div className="text-2xl font-bold text-orange-500 mb-6">
              ${parseFloat(listing.price.toString()).toFixed(2)}
              <span className="text-sm text-gray-500 font-normal ml-2">per serving</span>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quantity</h2>
              
              <div className="flex items-center mb-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-16 text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                <span className="text-gray-700 font-medium">Total</span>
                <span className="text-xl font-bold text-orange-500">${totalPrice}</span>
              </div>
            </div>
            
            <div className="flex gap-4 mb-8">
              <button
                onClick={addToCart}
                disabled={addingToCart}
                className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 disabled:bg-orange-400 flex items-center justify-center gap-2"
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Pickup Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock size={14} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Available Today</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(listing.pickupStartTime)} - {formatDate(listing.pickupEndTime)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <MapPin size={14} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Pickup Location</h3>
                    <p className="text-sm text-gray-600">{listing.pickupAddress}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <Star size={14} className="text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Special Instructions</h3>
                    <p className="text-sm text-gray-600">Please bring your own containers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description section */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-700 mb-8">{listing.description}</p>
        </div>
        
        {/* About the Chef section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6">About the Chef</h2>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden">
              {/* Chef image would go here */}
              <div className="w-full h-full bg-orange-300"></div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold text-gray-900">{listing.username}</h3>
                <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                  <Star size={14} className="text-yellow-600 fill-yellow-600" />
                  <span className="text-xs font-medium text-yellow-800 ml-1">4.9</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">Italian chef with 15+ years experience. Specializing in traditional family recipes from Tuscany. All dishes made with organic, locally-sourced ingredients.</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                <span>127 dishes sold</span>
                <span>Member since 2022</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;