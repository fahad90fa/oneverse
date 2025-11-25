// Common TypeScript interfaces for the application

export type UserRole = "buyer" | "seller" | "client" | "worker";

export interface AppUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  title?: string;
  bio?: string;
  location?: string;
  experience_years?: number;
  skills?: string[];
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export interface Product {
  id: string;
  seller_id: string;
  title: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category?: string;
  images?: string[];
  status: "active" | "inactive" | "draft";
  created_at: string;
  updated_at: string;
}

export interface Gig {
  id: string;
  worker_id: string;
  title: string;
  description?: string;
  price: number;
  delivery_days: number;
  category?: string;
  skills?: string[];
  images?: string[];
  status: "active" | "inactive" | "draft";
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  budget_min?: number;
  budget_max?: number;
  category?: string;
  skills_required?: string[];
  status: "open" | "closed" | "in_progress" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  client_id: string;
  worker_id: string;
  job_id?: string;
  title: string;
  description?: string;
  budget: number;
  status: "active" | "completed" | "paused" | "cancelled";
  deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  conversation_id?: string;
  is_read: boolean;
  read_at?: string;
  file_url?: string;
  file_type?: string;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  seller_id?: string;
  worker_id?: string;
  product_id?: string;
  gig_id?: string;
  job_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shipping_address?: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  images?: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  project_url?: string;
  images?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  is_read: boolean;
  created_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  title: string;
  image_url?: string;
}

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  created_at: string;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PricingFeature {
  name: string;
  included: boolean;
  description?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PricingFeature[];
  popular?: boolean;
  ctaText: string;
  ctaLink: string;
}

export interface RolePricing {
  role: UserRole;
  plans: PricingPlan[];
}