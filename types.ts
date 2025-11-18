export interface User {
  id: number;
  name: string;
  email: string;
  role: 'traveler' | 'operator' | 'admin';
  phone?: string;
  bio?: string;
  loyaltyPoints: number;
}

export interface Destination {
  id: string;
  name: string;
  province: string;
  summary: string;
  rating: number;
  image: string;
  images?: string[];
}

export interface Package {
  id: number;
  title: string;
  destId: string;
  price: number;
  type: 'leisure' | 'adventure' | 'culture';
  seats: number;
  description: string;
}

export interface Booking {
  id: string;
  packageId: number;
  packageTitle: string;
  traveler: string;
  email: string;
  date: string;
  seats: number;
  paid: boolean;
  totalPrice: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Comment {
  text: string;
  user: string;
  date: string;
}

export interface ItineraryItem {
  id: number;
  title: string;
  date: string;
  description: string;
}

export type DashboardTab = 'overview' | 'history' | 'wishlist' | 'profile';