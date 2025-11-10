import { useEffect, useState, useRef } from "react"; // Add useRef
import { Heart, ShoppingCart, Menu, X, ChefHat, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { User as UserType } from "../types/types";

interface NavigationProps {
  cartCount: number;
}

const NavigationBar = ({ cartCount: appCartCount }: NavigationProps) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [localCartCount, setLocalCartCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false); 
  const userMenuRef = useRef<HTMLDivElement>(null); 
  const location = useLocation();

  useEffect(() => {
    setLocalCartCount(appCartCount);
  }, [appCartCount]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        // Clear invalid user data
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Add click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navLinkClass = (path: string) => {
    return `transition-colors ${isActive(path) 
      ? 'text-orange-500 font-medium' 
      : 'text-gray-600 hover:text-gray-900'} no-underline`;
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div className="bg-orange-500 p-2 rounded-lg">
            <ChefHat size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Foodie</span>
        </Link>

        {/* Mobile menu button */}
        <button 
          className="md:hidden bg-transparent border-none" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={navLinkClass('/')}>Home</Link>
          
          {user ? (
            <>
              {/* User is logged in */}
              <Link to="/ai-recipe" className={navLinkClass('/ai-recipe')}>AI Recipe</Link>
              <Link to="/orders" className={navLinkClass('/orders')}>My Orders</Link>
              <Link to="/my-listings" className={navLinkClass('/my-listings')}>My Listings</Link>
              <Link to="/my-sales" className={navLinkClass('/my-sales')}>My Sales</Link>
              
              <div className="flex items-center gap-4">
                <button className="p-2 text-gray-600 border-none bg-transparent hover:text-orange-500 transition-colors">
                  <Heart size={20} />
                </button>
                
                {/* Cart with badge */}
                <Link to="/cart" className="relative p-2 text-gray-600 border-none bg-transparent hover:text-orange-500 transition-colors">
                  <ShoppingCart size={20} />
                  {localCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {localCartCount}
                    </span>
                  )}
                </Link>
                
                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button 
                    className="flex items-center gap-2 bg-gray-100 rounded-full p-1 px-2 text-gray-700 hover:bg-gray-200 transition-colors"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium hidden lg:inline">{user.username}</span>
                  </button>
                  
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* User is not logged in */}
              <Link to="/login" className={navLinkClass('/login')}>Login</Link>
              <Link to="/register" className={navLinkClass('/register')}>Register</Link>
            </>
          )}
        </nav>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden z-50">
            <div className="px-4 py-2">
              <Link to="/" className={`block py-3 ${navLinkClass('/')}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
              
              {user ? (
                <>
                  {/* User is logged in */}
                  <Link to="/ai-recipe" className={`block py-3 ${navLinkClass('/ai-recipe')}`} onClick={() => setMobileMenuOpen(false)}>AI Recipe</Link>
                  <Link to="/orders" className={`block py-3 ${navLinkClass('/orders')}`} onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                  <Link to="/my-listings" className={`block py-3 ${navLinkClass('/my-listings')}`} onClick={() => setMobileMenuOpen(false)}>My Listings</Link>
                  <Link to="/my-sales" className={`block py-3 ${navLinkClass('/my-sales')}`} onClick={() => setMobileMenuOpen(false)}>My Sales</Link>
                  <Link to="/cart" className={`block py-3 ${navLinkClass('/cart')}`} onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={20} />
                      <span>Cart</span>
                      {localCartCount > 0 && (
                        <span className="bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {localCartCount}
                        </span>
                      )}
                    </div>
                  </Link>
                  
                  <div className="border-t border-gray-200 mt-3 pt-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left py-3 text-red-600 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* User is not logged in */}
                  <Link to="/login" className={`block py-3 ${navLinkClass('/login')}`} onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className={`block py-3 ${navLinkClass('/register')}`} onClick={() => setMobileMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default NavigationBar;