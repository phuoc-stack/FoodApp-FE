import { BrowserRouter, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import "./index.css";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ShoppingListPage from "./pages/ShoppingList";
import ShoppingCartPage from "./pages/ShoppingCartPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import MySalesPage from "./pages/MySalesPage";
import AIRecipePage from "./pages/AIRecipePage";
import MyListingsPage from "./pages/MyListingsPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/cart" element={<ShoppingCartPage />} />
      <Route path="/orders" element={<MyOrdersPage />} />
      <Route path="/shopping-list" element={<ShoppingListPage />} />
      <Route path="/my-listings" element={<MyListingsPage />} />
      <Route path="/my-sales" element={<MySalesPage />} />
      <Route path="/ai-recipe" element={<AIRecipePage />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="App">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
};

export default App;
