import type {
  Address,
  CartDto,
  Favorite,
  NotificationItem,
  Order,
  OrderItem,
  PaymentMethod,
  Review,
  UserSettings,
} from "../types/api";
import {
  CAMPAIGNS,
  CATEGORIES,
  PRODUCTS,
  averageRating,
  filterProducts,
  paginate,
  reviewsForProduct,
  type ProductQuery,
} from "./catalog";

// ponytail: tüm veri süreç belleğinde; yeniden başlatmada sıfırlanır, tek instance'ta çalışır.
// Kalıcılık gerekirse bu modülün arkasına SQLite/Postgres konur, route.ts değişmez.

export type DemoUser = {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
};

type CartRow = { productId: number; quantity: number };

const users: DemoUser[] = [];
const tokens = new Map<string, number>();
const carts = new Map<number, CartRow[]>();
const addresses = new Map<number, Address[]>();
const payments = new Map<number, PaymentMethod[]>();
const favorites = new Map<number, number[]>();
const settings = new Map<number, UserSettings>();
const notifications = new Map<number, NotificationItem[]>();
const orders: { userId: number; order: Order }[] = [];
const extraReviews: Review[] = [];
const idempotency = new Map<string, Order>();

let nextUserId = 1;
let nextAddrId = 1;
let nextPayId = 1;
let nextOrderId = 1;
let nextNotifId = 1;
let nextReviewId = 100_000;

const nowIso = () => new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
const round2 = (n: number) => Math.round(n * 100) / 100;
const findProduct = (id: number) => PRODUCTS.find((p) => p.id === id);

/** Oturum başına ayrı token: aynı hesaba birden çok cihaz/ziyaretçi girebilir. */
function issueToken(userId: number) {
  const token = `demo.${userId}.${crypto.randomUUID()}`;
  tokens.set(token, userId);
  return token;
}

function cartDto(userId: number): CartDto {
  const items = (carts.get(userId) ?? []).flatMap(({ productId, quantity }) => {
    const p = findProduct(productId);
    if (!p) return [];
    return [{
      productId,
      productName: p.productName,
      productImageUrl: p.imageUrl,
      unitPrice: p.price,
      quantity,
      totalPrice: round2(p.price * quantity),
      unitInStock: p.unitInStock,
    }];
  });
  return {
    userId,
    items,
    totalItems: items.reduce((a, i) => a + i.quantity, 0),
    totalAmount: round2(items.reduce((a, i) => a + i.totalPrice, 0)),
  };
}

function notify(userId: number, n: Omit<NotificationItem, "id" | "createdAt">) {
  const list = notifications.get(userId) ?? [];
  list.unshift({ ...n, id: nextNotifId++, createdAt: nowIso() });
  notifications.set(userId, list);
}

function orderItem(productId: number, quantity: number): OrderItem {
  const p = findProduct(productId)!;
  return {
    productId,
    productName: p.productName,
    quantity,
    unitPrice: p.price,
    totalPrice: round2(p.price * quantity),
    productImageUrl: p.imageUrl,
  };
}

function seed() {
  const demo: DemoUser = {
    id: nextUserId++,
    email: "demo@kapidamart.com",
    password: "demo123",
    firstName: "Demo",
    lastName: "Kullanıcı",
    isEmailVerified: true,
  };
  users.push(demo);

  addresses.set(demo.id, [
    { id: nextAddrId++, userId: demo.id, title: "Ev", fullAddress: "Bağdat Cad. No:12 D:5", city: "İstanbul", district: "Kadıköy", postalCode: "34710", country: "Turkey", isDefault: true, phoneNumber: "0532 000 00 00" },
    { id: nextAddrId++, userId: demo.id, title: "İş", fullAddress: "Levent Mah. Büyükdere Cad. No:100", city: "İstanbul", district: "Beşiktaş", postalCode: "34330", country: "Turkey", isDefault: false, phoneNumber: "0212 000 00 00" },
  ]);
  payments.set(demo.id, [
    { id: nextPayId++, type: "CREDIT_CARD", cardHolderName: "DEMO KULLANICI", cardNumber: "**** **** **** 4242", expiryMonth: 12, expiryYear: 2028, isDefault: true },
  ]);
  favorites.set(demo.id, [3, 28, 51, 120, 200]);
  carts.set(demo.id, [
    { productId: 5, quantity: 1 },
    { productId: 40, quantity: 2 },
  ]);
  settings.set(demo.id, {
    language: "tr",
    currency: "TRY",
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
  });

  const seedNotifs: [string, string, string, boolean][] = [
    ["Siparişiniz kargoya verildi", "KM-1001 numaralı siparişiniz yola çıktı.", "order", false],
    ["Sepetiniz sizi bekliyor", "Sepetinizdeki ürünlerde stok azalıyor.", "cart", false],
    ["Flaş indirim", "Elektronik kategorisinde %25'e varan indirim.", "campaign", true],
    ["Hoş geldiniz", "KapıdaMart hesabınız hazır.", "system", true],
    ["Yorum hatırlatması", "Teslim edilen ürünü puanlayın, 50 puan kazanın.", "review", false],
    ["Kargo bedava", "250 ₺ üzeri siparişlerde kargo bizden.", "campaign", true],
  ];
  for (const [title, message, type, isRead] of seedNotifs.reverse()) {
    notify(demo.id, { title, message, type, isRead });
  }

  const seedOrder = (item: OrderItem, extra: Partial<Order> & { status: string }) => {
    const id = nextOrderId++;
    orders.push({
      userId: demo.id,
      order: {
        id,
        orderNumber: `KM-${1000 + id}`,
        totalAmount: item.totalPrice,
        items: [item],
        shippingAddress: addresses.get(demo.id)![0],
        paymentMethod: payments.get(demo.id)![0],
        ...extra,
      },
    });
  };
  seedOrder(orderItem(5, 1), {
    status: "delivered",
    createdAt: daysAgo(12),
    shippedAt: daysAgo(11),
    estimatedDeliveryAt: daysAgo(9),
    trackingNumber: "TR123456789TR",
    carrier: "Yurtiçi Kargo",
    demoNextAction: null,
  });
  seedOrder(orderItem(40, 2), {
    status: "processing",
    createdAt: daysAgo(1),
    demoNextAction: "DEMO_ADVANCE_FULFILLMENT",
  });
}

seed();

export const db = {
  categories: () => CATEGORIES,
  campaigns: () => CAMPAIGNS.filter((c) => c.isActive !== false),
  product: findProduct,
  productsPage(q: ProductQuery) {
    return paginate(filterProducts(PRODUCTS, q), q.pageNumber, q.pageSize);
  },
  featured() {
    return PRODUCTS.filter((p) => (p.discount ?? 0) >= 15 || p.id % 9 === 0).slice(0, 24);
  },
  discounted() {
    return PRODUCTS.filter((p) => (p.discount ?? 0) > 0)
      .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
      .slice(0, 40);
  },
  byCategory(categoryId: number) {
    return PRODUCTS.filter((p) => p.categoryId === categoryId);
  },

  reviews(productId: number) {
    return [...extraReviews.filter((r) => r.productId === productId), ...reviewsForProduct(productId)];
  },
  reviewSummary(productId: number) {
    const list = db.reviews(productId);
    return { productId, averageRating: averageRating(list), totalReviews: list.length };
  },
  addReview(body: Omit<Review, "id" | "createdAt">) {
    const r: Review = { ...body, id: nextReviewId++, createdAt: nowIso() };
    extraReviews.unshift(r);
    const p = findProduct(body.productId)!;
    const s = db.reviewSummary(p.id);
    p.rating = s.averageRating;
    p.reviewCount = s.totalReviews;
    return r;
  },

  userByToken(token: string | null) {
    const id = token ? tokens.get(token) : undefined;
    return id ? (users.find((u) => u.id === id) ?? null) : null;
  },
  login(email: string, password: string) {
    const user = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) return null;
    return { user, token: issueToken(user.id) };
  },
  register(body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    address?: string;
    city?: string;
    postalCode?: string;
    phoneNumber?: string;
  }) {
    if (users.some((u) => u.email.toLowerCase() === body.email.toLowerCase())) {
      return { error: "EMAIL_TAKEN" as const };
    }
    const id = nextUserId++;
    const user: DemoUser = {
      id,
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      isEmailVerified: true,
    };
    users.push(user);
    settings.set(id, { language: "tr", currency: "TRY", emailNotifications: true });
    notify(id, {
      title: "Hoş geldiniz",
      message: `Merhaba ${user.firstName}, hesabınız oluşturuldu.`,
      type: "system",
      isRead: false,
    });
    if (body.address && body.city) {
      db.addAddress(id, {
        title: "Ev",
        fullAddress: body.address,
        city: body.city,
        district: body.city,
        postalCode: body.postalCode || "00000",
        country: "Turkey",
        isDefault: true,
        phoneNumber: body.phoneNumber,
      });
    }
    return { user, token: issueToken(id) };
  },
  logout(token: string) {
    tokens.delete(token);
  },
  changePassword(user: DemoUser, current: string, next: string, confirm: string) {
    if (user.password !== current) return "Mevcut şifre hatalı.";
    if (next.length < 6) return "Yeni şifre en az 6 karakter olmalı.";
    if (next !== confirm) return "Yeni şifreler eşleşmiyor.";
    user.password = next;
    return null;
  },

  cart: cartDto,
  /** quantity: route katmanında pozitif tamsayı olarak doğrulanmış olmalı. */
  cartAdd(userId: number, productId: number, quantity: number) {
    const p = findProduct(productId);
    if (!p || p.isActive === false) return { error: "PRODUCT_NOT_AVAILABLE" as const };
    const items = carts.get(userId) ?? [];
    const row = items.find((i) => i.productId === productId);
    const nextQty = (row?.quantity ?? 0) + quantity;
    if (nextQty > p.unitInStock) return { error: "STOCK_INSUFFICIENT" as const };
    if (row) row.quantity = nextQty;
    else items.push({ productId, quantity });
    carts.set(userId, items);
    return { cart: cartDto(userId) };
  },
  /** quantity: 0 satırı siler. */
  cartUpdate(userId: number, productId: number, quantity: number) {
    const items = carts.get(userId) ?? [];
    const row = items.find((i) => i.productId === productId);
    if (!row) return { error: "NOT_IN_CART" as const };
    if (quantity === 0) return { cart: db.cartRemove(userId, productId) };
    if (quantity > (findProduct(productId)?.unitInStock ?? 0)) return { error: "STOCK_INSUFFICIENT" as const };
    row.quantity = quantity;
    return { cart: cartDto(userId) };
  },
  cartRemove(userId: number, productId: number) {
    carts.set(userId, (carts.get(userId) ?? []).filter((i) => i.productId !== productId));
    return cartDto(userId);
  },
  cartClear(userId: number) {
    carts.set(userId, []);
  },

  addresses: (userId: number) => addresses.get(userId) ?? [],
  addAddress(userId: number, body: Omit<Address, "id" | "userId">) {
    const list = addresses.get(userId) ?? [];
    const isDefault = body.isDefault || list.length === 0;
    if (isDefault) list.forEach((a) => (a.isDefault = false));
    const a: Address = { ...body, isDefault, id: nextAddrId++, userId };
    list.push(a);
    addresses.set(userId, list);
    return a;
  },
  deleteAddress(userId: number, id: number) {
    addresses.set(userId, db.addresses(userId).filter((a) => a.id !== id));
  },

  payments: (userId: number) => payments.get(userId) ?? [],
  addPayment(userId: number, body: { cardHolderName?: string; cardNumber?: string; expiryMonth?: number; expiryYear?: number; isDefault?: boolean }) {
    const list = payments.get(userId) ?? [];
    const isDefault = body.isDefault || list.length === 0;
    if (isDefault) list.forEach((p) => (p.isDefault = false));
    // Kart numarasının yalnızca son 4 hanesi saklanır.
    const last4 = (body.cardNumber || "0000").replace(/\D/g, "").slice(-4);
    const p: PaymentMethod = {
      id: nextPayId++,
      type: "CREDIT_CARD",
      cardHolderName: body.cardHolderName,
      cardNumber: `**** **** **** ${last4}`,
      expiryMonth: body.expiryMonth,
      expiryYear: body.expiryYear,
      isDefault,
    };
    list.push(p);
    payments.set(userId, list);
    return p;
  },
  deletePayment(userId: number, id: number) {
    payments.set(userId, db.payments(userId).filter((p) => p.id !== id));
  },

  favorites(userId: number): Favorite[] {
    return (favorites.get(userId) ?? []).flatMap((productId) => {
      const p = findProduct(productId);
      if (!p) return [];
      return [{
        id: productId,
        productId,
        productName: p.productName,
        productImageUrl: p.imageUrl,
        productPrice: p.price,
        productCategory: p.categoryName,
      }];
    });
  },
  favAdd(userId: number, productId: number) {
    const ids = favorites.get(userId) ?? [];
    if (!ids.includes(productId)) ids.push(productId);
    favorites.set(userId, ids);
    return db.favorites(userId).find((f) => f.productId === productId);
  },
  favRemove(userId: number, productId: number) {
    favorites.set(userId, (favorites.get(userId) ?? []).filter((id) => id !== productId));
  },
  favCheck: (userId: number, productId: number) => (favorites.get(userId) ?? []).includes(productId),

  settings: (userId: number): UserSettings =>
    settings.get(userId) ?? { language: "tr", currency: "TRY", emailNotifications: true },
  putSettings(userId: number, body: UserSettings) {
    const next = { ...db.settings(userId), ...body };
    settings.set(userId, next);
    return next;
  },

  notifications: (userId: number) => notifications.get(userId) ?? [],
  markRead(userId: number, id: number) {
    const n = db.notifications(userId).find((x) => x.id === id);
    if (n) n.isRead = true;
    return n;
  },
  markAllRead(userId: number) {
    for (const n of db.notifications(userId)) n.isRead = true;
  },

  orders(userId: number) {
    return orders.filter((o) => o.userId === userId).map((o) => o.order).reverse();
  },
  order(userId: number, id: number) {
    return orders.find((o) => o.userId === userId && o.order.id === id)?.order;
  },
  /** Sipariş, istemcinin gönderdiği listeden değil sunucudaki sepetten oluşturulur. */
  createOrder(
    userId: number,
    body: { shippingAddressId: number; paymentMethodId: number; notes?: string },
    idemKey: string | null,
  ) {
    const replay = idemKey ? idempotency.get(`${userId}:${idemKey}`) : undefined;
    if (replay) return { order: replay };
    const addr = db.addresses(userId).find((a) => a.id === body.shippingAddressId);
    if (!addr) return { error: "ADDRESS_NOT_OWNED" as const };
    const pay = db.payments(userId).find((p) => p.id === body.paymentMethodId);
    if (!pay) return { error: "PAYMENT_NOT_OWNED" as const };
    const rows = carts.get(userId) ?? [];
    if (!rows.length) return { error: "CART_EMPTY" as const };

    // Önce tüm satırları doğrula, sonra stok düş: yarım kalan sipariş stok yemesin.
    for (const { productId, quantity } of rows) {
      const p = findProduct(productId);
      if (!p || p.isActive === false) return { error: "PRODUCT_NOT_AVAILABLE" as const };
      if (quantity > p.unitInStock) return { error: "STOCK_INSUFFICIENT" as const };
    }
    const items = rows.map(({ productId, quantity }) => {
      findProduct(productId)!.unitInStock -= quantity;
      return orderItem(productId, quantity);
    });

    const id = nextOrderId++;
    const order: Order = {
      id,
      orderNumber: `KM-${1000 + id}`,
      totalAmount: round2(items.reduce((a, i) => a + i.totalPrice, 0)),
      status: "pending",
      items,
      shippingAddress: addr,
      paymentMethod: pay,
      notes: body.notes,
      createdAt: nowIso(),
      demoNextAction: "DEMO_ADVANCE_FULFILLMENT",
    };
    orders.push({ userId, order });
    carts.set(userId, []);
    if (idemKey) idempotency.set(`${userId}:${idemKey}`, order);
    notify(userId, {
      title: "Sipariş alındı",
      message: `${order.orderNumber} numaralı siparişiniz alındı.`,
      type: "order",
      isRead: false,
    });
    return { order };
  },
  cancelOrder(userId: number, id: number, reason?: string) {
    const o = db.order(userId, id);
    if (!o) return { error: "ORDER_NOT_FOUND" as const };
    if (!["pending", "processing"].includes(o.status)) return { error: "ORDER_NOT_CANCELLABLE" as const };
    // İptal edilen ürünler stoğa geri döner.
    for (const it of o.items) {
      const p = findProduct(it.productId);
      if (p) p.unitInStock += it.quantity;
    }
    Object.assign(o, { status: "cancelled", cancelReason: reason, demoNextAction: null, updatedAt: nowIso() });
    return { order: o };
  },
  returnRequest(userId: number, id: number, reason: string) {
    const o = db.order(userId, id);
    if (!o) return { error: "ORDER_NOT_FOUND" as const };
    if (o.status !== "delivered") return { error: "RETURN_NOT_ALLOWED" as const };
    Object.assign(o, { status: "returnRequested", returnReason: reason, returnRequestedAt: nowIso(), demoNextAction: null });
    return { order: o };
  },
  demoAdvance(userId: number, id: number) {
    const o = db.order(userId, id);
    if (!o) return { error: "ORDER_NOT_FOUND" as const };
    if (o.status === "pending") {
      o.status = "processing";
    } else if (o.status === "processing") {
      o.status = "shipped";
      o.shippedAt = nowIso();
      o.carrier ||= "Yurtiçi Kargo";
      o.trackingNumber ||= `TR${o.id}${Date.now().toString().slice(-8)}TR`;
      o.estimatedDeliveryAt = new Date(Date.now() + 2 * 86400000).toISOString();
    } else if (o.status === "shipped") {
      o.status = "delivered";
    } else {
      return { error: "DEMO_ADVANCE_INVALID_STATE" as const };
    }
    o.demoNextAction = o.status === "delivered" ? null : "DEMO_ADVANCE_FULFILLMENT";
    o.updatedAt = nowIso();
    return { order: o };
  },
};
