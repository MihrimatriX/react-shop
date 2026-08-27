import type {
  Address,
  ApiResponse,
  BaseResponse,
  Campaign,
  CartDto,
  Category,
  Favorite,
  NotificationItem,
  Order,
  PaymentMethod,
  Product,
  Review,
  ReviewSummary,
  SpringPage,
  UserSettings,
} from "../types/api";

const prefix = () => process.env.NEXT_PUBLIC_API_URL || "";

function newCorrelationId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

async function req<T>(
  path: string,
  init?: RequestInit & { token?: string | null },
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Correlation-ID": newCorrelationId(),
    ...(init?.headers as Record<string, string>),
  };
  if (init?.token) headers.Authorization = `Bearer ${init.token}`;
  const { token: _t, headers: _ignore, ...rest } = init || {};
  let res: Response;
  try {
    res = await fetch(`${prefix()}${path}`, { ...rest, headers });
  } catch {
    return {
      success: false,
      message:
        "Ağ hatası: API’ye ulaşılamadı. Bağlantınızı ve proxy ayarlarını kontrol edin.",
      httpStatus: 0,
    };
  }
  const text = await res.text();
  let body: BaseResponse<T> = {
    success: false,
    message: text || res.statusText,
  };
  try {
    body = text ? JSON.parse(text) : body;
  } catch {
    body = { success: false, message: text || "Geçersiz JSON yanıtı" };
  }
  return { ...body, httpStatus: res.status };
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      req<{
        token: string;
        userId: number;
        email: string;
        firstName: string;
        lastName: string;
        isEmailVerified: boolean;
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (body: Record<string, unknown>) =>
      req<{
        token: string;
        userId: number;
        email: string;
        firstName: string;
        lastName: string;
      }>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
    logout: (token: string) =>
      req<string>("/api/auth/logout", { method: "POST", token }),
  },

  products: {
    page: (params: URLSearchParams) =>
      req<SpringPage<Product>>(`/api/product?${params.toString()}`),
    one: (id: number) => req<Product>(`/api/product/${id}`),
    featured: () => req<Product[]>("/api/product/featured"),
    discounted: () => req<Product[]>("/api/product/discounted"),
    byCategory: (categoryId: number) =>
      req<Product[]>(`/api/product/category/${categoryId}`),
  },

  categories: {
    all: () => req<Category[]>("/api/category"),
  },

  campaigns: {
    active: () => req<Campaign[]>("/api/campaign/active"),
  },

  reviews: {
    byProduct: (productId: number) =>
      req<Review[]>(`/api/review/product/${productId}`),
    summary: (productId: number) =>
      req<ReviewSummary>(`/api/review/product/${productId}/summary`),
    create: (
      token: string,
      body: {
        productId: number;
        userId: number;
        rating: number;
        title?: string;
        comment?: string;
      },
    ) =>
      req<Review>("/api/review", {
        method: "POST",
        body: JSON.stringify(body),
        token,
      }),
  },

  cart: {
    get: (token: string) => req<CartDto>("/api/cart", { token }),
    add: (token: string, productId: number, quantity: number) =>
      req<CartDto>("/api/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
        token,
      }),
    update: (token: string, productId: number, quantity: number) =>
      req<CartDto>("/api/cart/update", {
        method: "PUT",
        body: JSON.stringify({ productId, quantity }),
        token,
      }),
    remove: (token: string, productId: number) =>
      req<CartDto>(`/api/cart/remove/${productId}`, {
        method: "DELETE",
        token,
      }),
    clear: (token: string) =>
      req<string>("/api/cart/clear", { method: "DELETE", token }),
  },

  orders: {
    list: (token: string) => req<Order[]>("/api/order", { token }),
    one: (token: string, id: number) =>
      req<Order>(`/api/order/${id}`, { token }),
    create: (token: string, body: object, idempotencyKey: string) =>
      req<Order>("/api/order", {
        method: "POST",
        body: JSON.stringify(body),
        token,
        headers: { "Idempotency-Key": idempotencyKey },
      }),
    cancel: (token: string, id: number, reason?: string) =>
      req<string>(`/api/order/${id}/cancel`, {
        method: "PUT",
        token,
        body: JSON.stringify(reason?.trim() ? { reason: reason.trim() } : {}),
      }),
    returnRequest: (token: string, id: number, reason: string) =>
      req<Order>(`/api/order/${id}/return-request`, {
        method: "POST",
        body: JSON.stringify({ reason }),
        token,
      }),
    demoAdvanceFulfillment: (token: string, id: number) =>
      req<Order>(`/api/order/${id}/demo/advance-fulfillment`, {
        method: "POST",
        token,
      }),
  },

  addresses: {
    list: (token: string, userId: number) =>
      req<Address[]>(`/api/address/user/${userId}`, { token }),
    create: (token: string, body: object) =>
      req<Address>("/api/address", {
        method: "POST",
        body: JSON.stringify(body),
        token,
      }),
    delete: (token: string, id: number) =>
      req<string>(`/api/address/${id}`, { method: "DELETE", token }),
  },

  payments: {
    list: (token: string, userId: number) =>
      req<PaymentMethod[]>(`/api/payment-method/user/${userId}`, { token }),
    create: (token: string, body: object) =>
      req<PaymentMethod>("/api/payment-method", {
        method: "POST",
        body: JSON.stringify(body),
        token,
      }),
    delete: (token: string, id: number) =>
      req<string>(`/api/payment-method/${id}`, { method: "DELETE", token }),
  },

  favorites: {
    list: (token: string) => req<Favorite[]>("/api/favorite", { token }),
    add: (token: string, productId: number) =>
      req<Favorite>("/api/favorite/add", {
        method: "POST",
        body: JSON.stringify({ productId }),
        token,
      }),
    remove: (token: string, productId: number) =>
      req<string>(`/api/favorite/remove/${productId}`, {
        method: "DELETE",
        token,
      }),
    check: (token: string, productId: number) =>
      req<boolean>(`/api/favorite/check/${productId}`, { token }),
  },

  settings: {
    get: (token: string, userId: number) =>
      req<UserSettings>(`/api/settings/user/${userId}`, { token }),
    put: (token: string, userId: number, body: UserSettings) =>
      req<UserSettings>(`/api/settings/user/${userId}`, {
        method: "PUT",
        body: JSON.stringify(body),
        token,
      }),
  },

  notifications: {
    list: (token: string, userId: number, page = 1, size = 20) =>
      req<NotificationItem[]>(
        `/api/notification/user/${userId}?pageNumber=${page}&pageSize=${size}`,
        {
          token,
        },
      ),
    markRead: (token: string, id: number) =>
      req<NotificationItem>(`/api/notification/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isRead: true }),
        token,
      }),
    markAllRead: (token: string) =>
      req<string>("/api/notification/mark-all-read", { method: "PUT", token }),
  },

  security: {
    changePassword: (
      token: string,
      currentPassword: string,
      newPassword: string,
      confirmPassword: string,
    ) =>
      req<string>("/api/security/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
        token,
      }),
  },
};
