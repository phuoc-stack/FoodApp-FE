import { useState, useEffect } from "react";
import { Trash2, Plus, Minus, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { CartResponse, CheckoutResponse } from "../types/types";
import { fetchWithAuth } from "../utils/api";
import NavigationBar from "../components/NavigationBar";

interface ShoppingCartPageProps {
  cartCount: number;
  setCartCount: (count: number) => void;
}

const ShoppingCartPage: React.FC<ShoppingCartPageProps> = ({ cartCount, setCartCount }) => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [checkoutLoading, setCheckoutLoading] = useState<boolean>(false);

  const API_BASE_URL = "http://localhost:9393";

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async (): Promise<void> => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Please login to view cart");
      setLoading(false);
      return;
    }

    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/cart`);

      if (!response.ok) throw new Error("Failed to fetch cart");

      const data = await response.json();

      if (typeof data === "string") {
        setCart(null);
        setCartCount(0);
      } else {
        setCart(data as CartResponse);
        if (data.totalItems !== undefined) {
          setCartCount(data.totalItems);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (
    listingId: number,
    newQuantity: number
  ): Promise<void> => {
    if (newQuantity < 1) return;

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/cart/update-quantity`,
        {
          method: "PUT",
          body: JSON.stringify({ listingId, quantity: newQuantity }),
        }
      );

      if (!response.ok) throw new Error("Failed to update quantity");

      const updatedCart: CartResponse = await response.json();
      setCart(updatedCart);
      if (updatedCart.totalItems !== undefined) {
        setCartCount(updatedCart.totalItems);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update quantity");
    }
  };

  const removeItem = async (listingId: number): Promise<void> => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/cart/remove/${listingId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to remove item");

      const updatedCart: CartResponse = await response.json();
      setCart(updatedCart);
      if (updatedCart.totalItems !== undefined) {
        setCartCount(updatedCart.totalItems);
      } else {
        setCartCount(0);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove item");
    }
  };

  const clearCart = async (): Promise<void> => {
    if (!confirm("Are you sure you want to clear your cart?")) return;
    
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/cart/clear`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to clear cart");

      setCart(null);
      setCartCount(0);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to clear cart");
    }
  };

  const handleCheckout = async (): Promise<void> => {
    setCheckoutLoading(true);

    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/cart/checkout`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create checkout session");
      }

      const data: CheckoutResponse = await response.json();
      window.location.href = data.checkoutUrl;
    } catch (err) {
      alert(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatTimeRemaining = (): string => {
    if (!cart?.expiresAt) return "";

    const now = new Date();
    const expires = new Date(cart.expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar cartCount={cartCount} />
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar cartCount={cartCount} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8">
          <Link to="/" className="text-gray-600 hover:text-orange-500 no-underline">
            Home
          </Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Shopping Cart</span>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-6 rounded-lg mb-8 text-center">
            <p className="mb-4 font-medium">{error}</p>
            {error.includes("login") && (
              <Link 
                to="/login"
                className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg no-underline font-medium hover:bg-orange-600"
              >
                Login
              </Link>
            )}
          </div>
        )}

        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="bg-orange-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                <circle cx="8" cy="21" r="1"></circle>
                <circle cx="19" cy="21" r="1"></circle>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Browse our marketplace to find delicious homemade food from local sellers
            </p>

            <Link
              to="/"
              className="inline-block bg-orange-500 text-white px-8 py-3 rounded-lg no-underline font-medium hover:bg-orange-600 transition-colors"
            >
              Explore Listings
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                  <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
                    Cart expires in {formatTimeRemaining()}
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Items from {cart.sellerUsername}
                </p>
              </div>

              {/* Single Seller Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-blue-900">
                <strong>Single Seller Cart:</strong> You can only order from one
                seller at a time. To add items from another seller, you'll need
                to checkout or clear your current cart.
              </div>

              {/* Cart Actions */}
              <div className="flex justify-end mb-4">
                <button 
                  onClick={clearCart}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              {/* Cart Items List */}
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 mb-4 flex gap-4 shadow-sm"
                >
                  <img
                    src=""
                    alt={item.listingTitle}
                    className="w-24 h-24 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      {item.listingTitle}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.listingDescription}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${item.priceAtTimeAdded.toFixed(2)} each
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.listingId)}
                      className="bg-transparent border-none text-red-600 cursor-pointer p-1 hover:bg-red-50 rounded-full"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.listingId, item.quantity - 1)
                        }
                        className="bg-transparent border-none p-1 cursor-pointer text-gray-600 hover:bg-gray-100 rounded-md"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="min-w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.listingId, item.quantity + 1)
                        }
                        className="bg-transparent border-none p-1 cursor-pointer text-gray-600 hover:bg-gray-100 rounded-md"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <p className="text-lg font-bold text-orange-500">
                      ${item.itemTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              {/* Seller Info */}
              <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center text-lg font-bold text-gray-600">
                    {cart.sellerUsername ? cart.sellerUsername.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {cart.sellerUsername}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★★★★☆</span>
                      <span className="text-sm text-gray-600">
                        4.8 (248 reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 border-t border-gray-200 pt-4">
                  <div className="flex items-center mb-2">
                    <Clock size={16} className="mr-2" />
                    <span>Pickup time: 45-60 mins</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-2" />
                    <span>Distance: 2.3 miles</span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Order Summary
                </h3>

                  <div className="flex justify-between mb-2 text-sm text-gray-600">
                    <span>Subtotal ({cart.totalItems} items)</span>
                    <span>${cart.totalPrice.toFixed(2)}</span>
                  </div>
                 
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-orange-500">
                      $
                      {(parseFloat(cart.totalPrice.toString())).toFixed(
                        2
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full bg-orange-500 text-white py-4 px-4 rounded-lg border-none text-base font-semibold cursor-pointer mb-4 hover:bg-orange-600 disabled:bg-orange-400 transition-colors"
                >
                  {checkoutLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShoppingCartPage;