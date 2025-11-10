import React, { useState, useEffect } from "react";
import { Heart, Star, Clock, Search, Filter } from "lucide-react";
import type { Listing, User as UserType } from "../types/types";
import { fetchWithAuth } from "../utils/api";
import NavigationBar from "../components/NavigationBar";
import { useNavigate } from "react-router-dom";

interface LandingPageProps {
  cartCount: number;
  setCartCount: (count: number) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ cartCount, setCartCount }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("Most Recent");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [user, setUser] = useState<UserType | null>(null);
  const navigate = useNavigate();

  const API_BASE_URL = "http://localhost:9393";

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr) as UserType);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      const token = localStorage.getItem("authToken");
  
      if (!token) {
        setLoading(false);
        setError("Please login to view listings");
        return;
      }
  
      try {
        setLoading(true);
        const response = await fetchWithAuth(`${API_BASE_URL}/api/listings`);
  
        if (response.status === 401) {
          // Redirect to login if unauthorized
          navigate('/login');
          return;
        }
  
        if (!response.ok) throw new Error("Failed to fetch listings");
  
        const data: Listing[] = await response.json();
        setListings(data);
        setError("");
      } catch (err) {
        console.error("Error fetching listings:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };
  
    fetchListings();
  }, []);

  const addToCart = async (listingId: number) => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/cart/add/${listingId}`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || "Failed to add item to cart";
        throw new Error(errorMessage);
      }

      setCartCount(data.totalItems || 0);

      const listing = listings.find((l) => l.id === listingId);
      alert(`Added ${listing?.title || "item"} to cart!`);
    } catch (err) {
      console.error("Add to cart error:", err);
      alert(err instanceof Error ? err.message : "Failed to add to cart");
    }
  };

  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return "";
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Time TBD";
    }
  };

  const getSortedListings = (listingsToSort: Listing[]): Listing[] => {
    const sorted = [...listingsToSort];
    switch (sortBy) {
      case "Price: Low to High":
        return sorted.sort((a, b) => a.price - b.price);
      case "Price: High to Low":
        return sorted.sort((a, b) => b.price - a.price);
      case "Rating":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  };

  const filteredListings = getSortedListings(
    listings.filter(
      (listing) =>
        listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        listing.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-white">
      <NavigationBar cartCount={cartCount}/>
      {/* Search and filters */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-full px-8">
          <div className="flex flex-col gap-4">
            <div className="relative max-w-lg w-full">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search for delicious homemade food..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-base text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Sort by:
                </span>
                <select
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option>Most Recent</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-full px-8 py-8 bg-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Homemade Delights
          </h1>
          <p className="text-gray-600 text-base">
            Fresh, homemade food from your local community
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-base">Loading delicious food...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 text-center">
            {error}
          </div>
        )}

        {!loading && !error && filteredListings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-base">
              No listings found. Try adjusting your search.
            </p>
          </div>
        )}

        {!loading && filteredListings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 transition-shadow hover:shadow-lg cursor-pointer"
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                <div className="relative h-48">
                  <img
                    src={`http://localhost:9393${listing.imageUrl}`}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src =
                        "";
                    }}
                  />
                  <button
                    onClick={() => alert("Feature coming soon!")}
                    className="absolute top-3 right-3 bg-white rounded-full p-2 border-none shadow-sm cursor-pointer"
                  >
                    <Heart
                      size={16}
                      color={favorites.has(listing.id) ? "#ef4444" : "#6b7280"}
                      fill={favorites.has(listing.id) ? "#ef4444" : "none"}
                    />
                  </button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-base">
                    {listing.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-orange-500">
                      ${listing.price?.toFixed(2)}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={16} color="#fbbf24" fill="#fbbf24" />
                      <span className="text-sm text-gray-600">4.8</span>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="w-6 h-6 bg-gray-300 rounded-full mr-2" />
                    <span className="text-sm text-gray-600">
                      {listing.username}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Clock size={16} className="mr-1" />
                    <span>
                      Pickup: {formatTime(listing.pickupStartTime)}-
                      {formatTime(listing.pickupEndTime)}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(listing.id)}
                    className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg border-none font-medium cursor-pointer transition-colors hover:bg-orange-600"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LandingPage;
