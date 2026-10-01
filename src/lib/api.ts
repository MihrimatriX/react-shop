import type {
  Address,
  ApiResponse,
  AuthUser,
  CartDto,
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
import { useAuthStore } from "../store/authStore";

const prefix = process.env.NEXT_PUBLIC_API_URL || "";

type Init = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  headers?: Record<string, string>;
};

async function req<T>(path: string, { method, body, token, headers }: Init = {}): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${prefix}${path}`, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    return { success: false, message: "Ağ hatası: sunucuya ulaşılamadı.", httpStatus: 0 };
  }
  // Oturumlar sunucu belleğinde; sunucu yeniden başlarsa saklı token geçersiz kalır.
  // Hâlâ aynı token ile oturum açıksa kapat ki arayüz "girişli ama her şey 401" durumunda kalmasın.
  if (res.status === 401 && token && useAuthStore.getState().user?.token === token) {
    useAuthStore.getState().logout();
  }
  const data = await res
    .json()
    .catch(() => ({ success: false, message: `Beklenmeyen yanıt (${res.status}).` }));
  return { ...data, httpStatus: res.status };
}

/** Başarısız yanıtı Error'a çevirir; react-query queryFn / mutationFn içinde kullanılır. */
export function unwrap<T>(r: ApiResponse<T>): T {
  if (!r.success) throw new Error(r.message || `İstek tamamlanamadı (${r.httpStatus}).`);
  return r.data as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      req<AuthUser>("/api/auth/login", { method: "POST", body: { email, password } }),
    register: (body: Record<string, string>) =>
      req<AuthUser>("/api/auth/register", { method: "POST", body }),
    logout: (token: string) => req<null>("/api/auth/logout", { method: "POST", token }),
  },

  products: {
    page: (params: URLSearchParams) => req<SpringPage<Product>>(`/api/product?${params}`),
    one: (id: number) => req<Product>(`/api/product/${id}`),
  },

  reviews: {
    byProduct: (productId: number) => req<Review[]>(`/api/review/product/${productId}`),
    summary: (productId: number) => req<ReviewSummary>(`/api/review/product/${productId}/summary`),
    create: (token: string, body: { productId: number; rating: number; title?: string; comment?: string }) =>
      req<Review>("/api/review", { method: "POST", body, token }),
  },

  cart: {
    get: (token: string) => req<CartDto>("/api/cart", { token }),
    add: (token: string, productId: number, quantity: number) =>
      req<CartDto>("/api/cart/add", { method: "POST", body: { productId, quantity }, token }),
    update: (token: string, productId: number, quantity: number) =>
      req<CartDto>("/api/cart/update", { method: "PUT", body: { productId, quantity }, token }),
    remove: (token: string, productId: number) =>
      req<CartDto>(`/api/cart/remove/${productId}`, { method: "DELETE", token }),
  },

  orders: {
    list: (token: string) => req<Order[]>("/api/order", { token }),
    one: (token: string, id: number) => req<Order>(`/api/order/${id}`, { token }),
    /** Sipariş sunucudaki sepetten oluşur; aynı anahtarla tekrar gönderim aynı siparişi döner. */
    create: (
      token: string,
      body: { shippingAddressId: number; paymentMethodId: number; notes?: string },
      idempotencyKey: string,
    ) =>
      req<Order>("/api/order", {
        method: "POST",
        body,
        token,
        headers: { "Idempotency-Key": idempotencyKey },
      }),
    cancel: (token: string, id: number, reason?: string) =>
      req<Order>(`/api/order/${id}/cancel`, { method: "PUT", body: { reason }, token }),
    returnRequest: (token: string, id: number, reason: string) =>
      req<Order>(`/api/order/${id}/return-request`, { method: "POST", body: { reason }, token }),
    demoAdvanceFulfillment: (token: string, id: number) =>
      req<Order>(`/api/order/${id}/demo/advance-fulfillment`, { method: "POST", token }),
  },

  addresses: {
    list: (token: string, userId: number) => req<Address[]>(`/api/address/user/${userId}`, { token }),
    create: (token: string, body: Omit<Address, "id" | "userId">) =>
      req<Address>("/api/address", { method: "POST", body, token }),
    delete: (token: string, id: number) => req<null>(`/api/address/${id}`, { method: "DELETE", token }),
  },

  payments: {
    list: (token: string, userId: number) =>
      req<PaymentMethod[]>(`/api/payment-method/user/${userId}`, { token }),
    create: (token: string, body: object) =>
      req<PaymentMethod>("/api/payment-method", { method: "POST", body, token }),
    delete: (token: string, id: number) =>
      req<null>(`/api/payment-method/${id}`, { method: "DELETE", token }),
  },

  favorites: {
    list: (token: string) => req<Favorite[]>("/api/favorite", { token }),
    add: (token: string, productId: number) =>
      req<Favorite>("/api/favorite/add", { method: "POST", body: { productId }, token }),
    remove: (token: string, productId: number) =>
      req<null>(`/api/favorite/remove/${productId}`, { method: "DELETE", token }),
    check: (token: string, productId: number) => req<boolean>(`/api/favorite/check/${productId}`, { token }),
  },

  settings: {
    get: (token: string, userId: number) => req<UserSettings>(`/api/settings/user/${userId}`, { token }),
    put: (token: string, userId: number, body: UserSettings) =>
      req<UserSettings>(`/api/settings/user/${userId}`, { method: "PUT", body, token }),
  },

  notifications: {
    list: (token: string, userId: number) =>
      req<NotificationItem[]>(`/api/notification/user/${userId}`, { token }),
    markRead: (token: string, id: number) =>
      req<NotificationItem>(`/api/notification/${id}`, { method: "PUT", token }),
    markAllRead: (token: string) => req<null>("/api/notification/mark-all-read", { method: "PUT", token }),
  },

  security: {
    changePassword: (token: string, body: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      req<null>("/api/security/change-password", { method: "POST", body, token }),
  },
};
