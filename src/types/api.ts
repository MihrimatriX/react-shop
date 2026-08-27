export interface BaseResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  /** Sunucu iş kuralı / hata kodu (örn. STOCK_INSUFFICIENT) */
  code?: string;
  fieldErrors?: Record<string, string>;
  /** Sunucu loglarıyla eşleştirme (X-Correlation-ID / cid) */
  traceId?: string;
}

/** fetch sonrası HTTP durumu ile birlikte */
export type ApiResponse<T> = BaseResponse<T> & { httpStatus: number };

export interface AuthUser {
  token: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified?: boolean;
}

export interface Product {
  id: number;
  productName: string;
  unitPrice: number;
  unitInStock: number;
  quantityPerUnit: string;
  categoryId: number;
  categoryName?: string;
  description?: string;
  imageUrl?: string;
  discount?: number;
  isActive?: boolean;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

export interface Category {
  id: number;
  categoryName: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
}

export interface Campaign {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  discount?: number;
  imageUrl?: string;
  backgroundColor?: string;
  timeLeft?: string;
  buttonText?: string;
  buttonHref?: string;
  isActive?: boolean;
}

export interface Review {
  id: number;
  rating: number;
  title?: string;
  comment?: string;
  userName?: string;
  productId: number;
  createdAt?: string;
}

export interface ReviewSummary {
  productId: number;
  averageRating: number;
  totalReviews: number;
}

export interface Address {
  id: number;
  userId?: number;
  title: string;
  fullAddress: string;
  city: string;
  district: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
  phoneNumber?: string;
}

export interface PaymentMethod {
  id: number;
  type: string;
  cardHolderName?: string;
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

export interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  shippingAddress?: Address;
  paymentMethod?: PaymentMethod;
  createdAt?: string;
  updatedAt?: string;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string;
  estimatedDeliveryAt?: string;
  cancelReason?: string;
  returnReason?: string;
  returnRequestedAt?: string;
  /** DEMO_ADVANCE_FULFILLMENT: demo ortamında lojistik adımı simüle et */
  demoNextAction?: string | null;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImageUrl?: string;
}

export interface Favorite {
  id: number;
  productId: number;
  productName: string;
  productImageUrl?: string;
  productPrice: number;
  productCategory?: string;
}

export interface UserSettings {
  language?: string;
  currency?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  marketingEmails?: boolean;
  theme?: string;
  itemsPerPage?: number;
}

export interface CartItemDto {
  productId: number;
  productName?: string;
  productImageUrl?: string;
  unitPrice?: number;
  quantity: number;
  totalPrice?: number;
  discount?: number;
  unitInStock?: number;
  quantityPerUnit?: string;
}

export interface CartDto {
  userId?: number;
  items: CartItemDto[];
  totalItems?: number;
  totalAmount?: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;
}
