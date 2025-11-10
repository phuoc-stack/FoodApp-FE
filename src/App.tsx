import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ShoppingCartPage from "./pages/ShoppingCartPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import MySalesPage from "./pages/MySalesPage";
import AIRecipePage from "./pages/AIRecipePage";
import MyListingsPage from "./pages/MyListingsPage";
import { useState, useEffect } from "react";
import CreateListingPage from "./pages/CreateListingPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import { fetchWithAuth } from "./utils/api";
import OrderDetailPage from "./pages/OrderDetailPage";
import PaymentFailedPage from "./pages/PaymentFailedPage";
import ListingDetailPage from "./pages/ListingDetailPage";

const App: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const isValidUser = (): boolean => {
    try {
      const userStr = localStorage.getItem("user");
      const tokenStr = localStorage.getItem("authToken");
      
      if (!userStr || !tokenStr) {
        return false;
      }
      
      // Try to parse user data to verify it's valid JSON
      JSON.parse(userStr);
      return true;
    } catch (e) {
      // Clean up invalid user data
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      return false;
    }
  }

  useEffect(() => {
    if (isValidUser()) {
      fetchCartCount();
    } else {
      setCartCount(0);
      // Clear any invalid data
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
    }
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      try {
        // Make sure user data is valid JSON
        JSON.parse(user);
        setIsAuthenticated(true);
      } catch (e) {
        // Clean up invalid user data
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);
  
  // Only fetch cart count if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
    }
  }, [isAuthenticated]);

  const fetchCartCount = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:9393/api/cart");
      if (response.ok) {
        const data = await response.json();
        if (data && data.totalItems !== undefined) {
          setCartCount(data.totalItems);
        }
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage cartCount={cartCount} setCartCount={setCartCount} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/cart" element={<ShoppingCartPage cartCount={cartCount} setCartCount={setCartCount} />} />
          <Route path="/orders" element={<MyOrdersPage cartCount={cartCount} />} />
          <Route path="/order-detail" element={<OrderDetailPage cartCount={cartCount} />} />
          <Route path="/my-listings" element={<MyListingsPage cartCount={cartCount} />} />
          <Route path="/listing/:id" element={<ListingDetailPage cartCount={cartCount} />} />
          <Route path="/create-listing" element={<CreateListingPage cartCount={cartCount} />} />
          <Route path="/my-sales" element={<MySalesPage cartCount={cartCount} />} />
          <Route path="/ai-recipe" element={<AIRecipePage cartCount={cartCount} />} />
          <Route path="/payment-success" element={<PaymentSuccessPage cartCount={cartCount} />} />
          <Route path="/payment-failed" element={<PaymentFailedPage cartCount={cartCount} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;