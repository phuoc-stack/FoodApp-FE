export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number;
  pickupStartTime: string;
  pickupEndTime: string;
  pickupAddress: string;
  imageUrl: string;
  status: string;
  username: string;
}

export interface User {
  username: string;
  email: string;
}

export interface CartResponse {
  id: number;
  sellerUsername: string;
  sellerId: number;
  totalPrice: number;
  totalItems: number;
  items: CartItem[];
  createdAt: string;
  expiresAt: string;
  expired: boolean;
}

export interface CartItem {
  id: number;
  listingId: number;
  listingTitle: string;
  listingDescription: string;
  quantity: number;
  priceAtTimeAdded: number;
  itemTotal: number;
}

export interface ShoppingListItem {
  id: number;
  ingredient: string;
  purchased: boolean;
}

export interface AddIngredientsRequest {
  ingredients: string[];
}

export interface Order {
  id: number;
  status: string;
  orderDate: string;
  stripePaymentId: string;
  userId: number;
  username: string;
  items: OrderItem[];
  totalAmount: number;
}

export interface OrderItem {
  id: number;
  listingId: number;
  listingTitle: string;
  price: number;
  quantity: number;
  sellerId?: number;
  sellerUsername?: string;
  imageUrl?: string;
}

export interface CheckoutResponse {
  checkoutUrl: string;
  orderId: number;
}

export interface ShoppingListItem {
  id: number;
  ingredient: string;
  purchased: boolean;
}

export interface ShoppingListResponse {
  id: number | null;
  items: ShoppingListItem[];
  totalItems: number;
  purchasedItems: number;
}

export interface ListingRequest {
  title: string;
  description: string;
  price: number;
  pickupStartTime: string;
  pickupEndTime: string;
  pickupAddress: string;
  imageUrl?: string;
}

export interface UpdateQuantityRequest {
  listingId: number;
  quantity: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
}

export interface Listing {
  id: number;
  title: string;
  description: string;
  price: number; 
  pickupStartTime: string;
  pickupEndTime: string;
  pickupAddress: string;
  imageUrl: string;
  status: string;
  username: string;
}

export interface Recipe {
  recipe_name: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: string;
  servings: string;
}

export interface AIRecipePageProps {
  cartCount: number;
}