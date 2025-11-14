# 🍽️ Foodie -- Homemade Food Marketplace (Frontend)

Foodie is a modern React-based marketplace that connects home cooks with customers looking for fresh homemade food.
This frontend interacts with a Spring Boot backend running at:

http://localhost:9393

------------------------------------------------------------------------

## 🚀 Features

### 👤 Authentication

-   JWT-based login & registration\
-   LocalStorage persistence\
-   Auto-clean invalid tokens

### 🍲 Food Listings

-   Browse all listings on the landing page\
-   Listing cards with pricing, chef name, pickup windows\
-   Listing detail page with:
    -   Quantity selection\
    -   Add-to-cart\
    -   Chef profile\
    -   Pickup times

### 🛒 Shopping Cart

-   Single-seller shopping cart\
-   Update quantities\
-   Remove items\
-   Auto-expiring cart timer\
-   Stripe Checkout integration\
-   Success & Failed payment pages

### 🧾 Orders System

-   Buyer order dashboard\
-   Seller order dashboard\
-   Order details with timeline steps\
-   Sellers can mark orders as **Completed**

### 🍳 Sell on Foodie

-   Create new listing:
    -   Title, description\
    -   Price\
    -   Pickup time window\
    -   Pickup address\
    -   Image upload with preview\
-   Manage listings (active/inactive)

### 🤖 AI Recipe Generator

-   Upload image of a dish\
-   Backend uses **Google Gemini** to generate:
    -   Recipe name\
    -   Ingredients\
    -   Instructions\
-   Add ingredients to shopping list

------------------------------------------------------------------------

## 🧱 Tech Stack

### Frontend

-   **React + TypeScript**
-   **Vite**
-   **TailwindCSS**
-   **React Router**
-   **Lucide Icons**

### Backend (external)

-   **Spring Boot**
-   **JWT Auth**
-   **Stripe Checkout**
-   **Gemini AI API**

------------------------------------------------------------------------

## ▶️ Running the Project

### 1. Install dependencies

    npm install

### 2. Start dev server

    npm run dev

Runs at:

    http://localhost:5173

### 3. Ensure backend is running at:

    http://localhost:9393