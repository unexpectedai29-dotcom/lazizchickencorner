export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'ready' | 'rejected' | 'completed';

export interface Order {
  id?: string;
  userId: string;
  customerName: string;
  phone: string;
  items: OrderItem[];
  totalPrice: number;
  orderStatus: OrderStatus;
  pickupTime: string;
  notes: string;
  allergyNotes?: string;
  createdAt: any; // Timestamp or date ISO string
  updatedAt: any;
  estimatedPrepTime?: string; // e.g. "20 mins", "30 mins"
}

export interface Admin {
  id: string;
  email: string;
}
