import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Edit2, Trash2, Eye, EyeOff, Calendar } from 'lucide-react';
import type { Listing } from '../types/types';
import NavigationBar from '../components/NavigationBar';
import { fetchWithAuth } from '../utils/api';

interface MyListingsPageProps {
  cartCount: number;
}

const MyListingsPage: React.FC<MyListingsPageProps> = ({ cartCount }) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const API_BASE_URL = 'http://localhost:9393';

  useEffect(() => {
    fetchMyListings();
  }, []);

  useEffect(() => {
    console.log("Current listings:", listings);
  }, [listings]);

  const fetchMyListings = async () => {
    try {
      console.log("Fetching my listings...");
      const response = await fetchWithAuth(`${API_BASE_URL}/api/listings/my-listings`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch my listings');
      }
      
      const myListings = await response.json();
      console.log("My listings:", myListings);
      setListings(myListings);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'Time TBD';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      available: 'bg-green-100 text-green-800',
      unavailable: 'bg-gray-100 text-gray-800',
      expired: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const filteredListings = statusFilter === 'all' 
    ? listings 
    : listings.filter(l => l.status === statusFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar cartCount={cartCount} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use the NavigationBar component instead of a custom header */}
      <NavigationBar cartCount={cartCount} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Listings</h1>
            <p className="text-gray-600">Manage your food listings</p>
          </div>
          <button
            onClick={() => navigate('/create-listing')}
            className="flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600"
          >
            <Plus size={20} />
            Create New Listing
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-6 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              All ({listings.length})
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-6 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'available' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Active ({listings.filter(l => l.status === 'available').length})
            </button>
            <button
              onClick={() => setStatusFilter('unavailable')}
              className={`px-6 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'unavailable' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Inactive ({listings.filter(l => l.status === 'unavailable').length})
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            <p>{error}</p>
            {error.includes('login') && (
              <button
                onClick={() => navigate('/login')}
                className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600"
              >
                Login
              </button>
            )}
          </div>
        )}

        {/* Listings Grid */}
        {filteredListings.length === 0 && !error ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No listings yet</h2>
            <p className="text-gray-600 mb-8">Create your first listing to start selling!</p>
            <button
              onClick={() => navigate('/create-listing')}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-orange-600"
            >
              Create Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div key={listing.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <div className="relative h-48">
                  <img
                    src= {`http://localhost:9393${listing.imageUrl}`}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded text-xs font-medium ${getStatusBadge(listing.status)}`}>
                    {listing.status}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{listing.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{listing.description}</p>

                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatTime(listing.pickupStartTime)} - {formatTime(listing.pickupEndTime)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-orange-500">
                    ${listing.price ? listing.price.toFixed(2) : "0.00"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {listing.status === 'available' ? (
                      <button
                        onClick={() => alert('Deactivate functionality coming soon')}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-200"
                      >
                        <EyeOff size={16} />
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => alert('Activate functionality coming soon')}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-200"
                      >
                        <Eye size={16} />
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => alert('Edit functionality coming soon')}
                      className="flex items-center justify-center bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => alert('Delete functionality coming soon')}
                      className="flex items-center justify-center bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 size={16} />
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

export default MyListingsPage;