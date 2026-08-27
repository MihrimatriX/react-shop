import type {
  Address,
  CartDto,
  CartItemDto,
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
  filterProducts,
  paginate,
  reviewsForProduct,
  type ProductQuery,
} from "./catalog";

export type DemoUser = {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  token: string;
  isEmailVerified: boolean;
};

const users: DemoUser[] = [];
const tokens = new Map<string, number>();
const carts = new Map<number, CartItemDto[]>();
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
let nextFavId = 1;
let nextOrderId = 1;
let nextNotifId = 1;
let nextReviewId = 100_000;

function nowIso() {
  return new Date().toISOString();
}

function newToken(userId: number) {
  return `demo.${userId}.${crypto.randomUUID()}`;
}

function unitAfterDiscount(price: number, discount?: number) {
  const d = discount && discount > 0 ? (price * discount) / 100 : 0;
  return Math.round((price - d) * 100) / 100;
}

function cartDto(userId: number): CartDto {
  const items = carts.get(userId) ?? [];
  const enriched = items.map((row) => {
    const p = PRODUCTS.find((x) => x.id === row.productId);
    const unit = p ? unitAfterDiscount(p.unitPrice, p.discount) : Number(row.unitPrice ?? 0);
    const qty = row.quantity;
    return {
      productId: row.productId,
      productName: p?.productName ?? row.productName,
      productImageUrl: p?.imageUrl ?? row.productImageUrl,
      unitPrice: p?.unitPrice ?? row.unitPrice,
      quantity: qty,
      totalPrice: Math.round(unit * qty * 100) / 100,
      discount: p?.discount ?? row.discount ?? 0,
      unitInStock: p?.unitInStock ?? row.unitInStock,
      quantityPerUnit: p?.quantityPerUnit ?? row.quantityPerUnit,
    } satisfies CartItemDto;
  });
  return {
    userId,
    items: enriched,
    totalItems: enriched.reduce((a, i) => a + i.quantity, 0),
    totalAmount: Math.round(enriched.reduce((a, i) => a + (i.totalPrice ?? 0), 0) * 100) / 100,
  };
}

function seed() {
  if (users.length) return;
  const demo: DemoUser = {
    id: nextUserId++,
    email: "demo@kapidamart.com",
    password: "demo123",
    firstName: "Demo",
    lastName: "Kullanıcı",
    token: newToken(1),
    isEmailVerified: true,
  };
  users.push(demo);
  tokens.set(demo.token, demo.id);

  addresses.set(demo.id, [
    {
      id: nextAddrId++,
      userId: demo.id,
      title: "Ev",
      fullAddress: "Bağdat Cad. No:12 D:5",
      city: "İstanbul",
      district: "Kadıköy",
      postalCode: "34710",
      country: "Turkey",
      isDefault: true,
      phoneNumber: "0532 000 00 00",
    },
    {
      id: nextAddrId++,
      userId: demo.id,
      title: "İş",
      fullAddress: "Levent Mah. Büyükdere Cad. No:100",
      city: "İstanbul",
      district: "Beşiktaş",
      postalCode: "34330",
      country: "Turkey",
      isDefault: false,
      phoneNumber: "0212 000 00 00",
    },
  ]);

  payments.set(demo.id, [
    {
      id: nextPayId++,
      type: "CREDIT_CARD",
      cardHolderName: "DEMO KULLANICI",
      cardNumber: "**** **** **** 4242",
      expiryMonth: 12,
      expiryYear: 2028,
      isDefault: true,
    },
  ]);

  favorites.set(demo.id, [3, 28, 51, 120, 200]);
  nextFavId = 6;

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
    theme: "light",
    itemsPerPage: 24,
  });

  const notifs: NotificationItem[] = [
    { id: nextNotifId++, title: "Siparişiniz kargoya verildi", message: "KM-1001 numaralı siparişiniz yola çıktı.", type: "order", isRead: false, createdAt: nowIso() },
    { id: nextNotifId++, title: "Sepetiniz sizi bekliyor", message: "Sepetinizdeki ürünlerde stok azalıyor.", type: "cart", isRead: false, createdAt: nowIso() },
    { id: nextNotifId++, title: "Flaş indirim", message: "Elektronik kategorisinde %25'e varan indirim.", type: "campaign", isRead: true, createdAt: nowIso() },
    { id: nextNotifId++, title: "Hoş geldiniz", message: "KapıdaMart hesabınız hazır. demo123 ile giriş yaptınız.", type: "system", isRead: true, createdAt: nowIso() },
    { id: nextNotifId++, title: "Yorum hatırlatması", message: "Teslim edilen ürünü puanlayın, 50 puan kazanın.", type: "review", isRead: false, createdAt: nowIso() },
    { id: nextNotifId++, title: "Kargo bedava", message: "250 ₺ üzeri siparişlerde kargo bizden.", type: "campaign", isRead: true, createdAt: nowIso() },
    { id: nextNotifId++, title: "Adres onaylandı", message: "Ev adresiniz teslimat için kaydedildi.", type: "account", isRead: true, createdAt: nowIso() },
    { id: nextNotifId++, title: "Ödeme yöntemi eklendi", message: "**** 4242 kartınız varsayılan olarak ayarlandı.", type: "account", isRead: true, createdAt: nowIso() },
  ];
  notifications.set(demo.id, notifs);

  const p1 = PRODUCTS[4];
  const p2 = PRODUCTS[39];
  const delivered: Order = {
    id: nextOrderId++,
    orderNumber: "KM-1001",
    totalAmount: unitAfterDiscount(p1.unitPrice, p1.discount) * 1,
    status: "delivered",
    items: [
      {
        productId: p1.id,
        productName: p1.productName,
        quantity: 1,
        unitPrice: p1.unitPrice,
        totalPrice: unitAfterDiscount(p1.unitPrice, p1.discount),
        productImageUrl: p1.imageUrl,
      },
    ],
    shippingAddress: addresses.get(demo.id)![0],
    paymentMethod: payments.get(demo.id)![0],
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    shippedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
    estimatedDeliveryAt: new Date(Date.now() - 9 * 86400000).toISOString(),
    trackingNumber: "TR123456789TR",
    carrier: "Yurtiçi Kargo",
    demoNextAction: null,
  };
  const processing: Order = {
    id: nextOrderId++,
    orderNumber: "KM-1002",
    totalAmount: unitAfterDiscount(p2.unitPrice, p2.discount) * 2,
    status: "processing",
    items: [
      {
        productId: p2.id,
        productName: p2.productName,
        quantity: 2,
        unitPrice: p2.unitPrice,
        totalPrice: unitAfterDiscount(p2.unitPrice, p2.discount) * 2,
        productImageUrl: p2.imageUrl,
      },
    ],
    shippingAddress: addresses.get(demo.id)![0],
    paymentMethod: payments.get(demo.id)![0],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    demoNextAction: "DEMO_ADVANCE_FULFILLMENT",
  };
  orders.push({ userId: demo.id, order: delivered }, { userId: demo.id, order: processing });
}

seed();

export const db = {
  categories: () => CATEGORIES,
  campaigns: () => CAMPAIGNS.filter((c) => c.isActive !== false),
  product: (id: number) => PRODUCTS.find((p) => p.id === id),
  productsPage(q: ProductQuery) {
    return paginate(filterProducts(PRODUCTS, q), q.pageNumber, q.pageSize);
  },
  featured() {
    return PRODUCTS.filter((p) => (p.discount ?? 0) >= 15 || p.id % 9 === 0).slice(0, 24);
  },
  discounted() {
    return [...PRODUCTS]
      .filter((p) => (p.discount ?? 0) > 0)
      .sort((a, b) => (b.discount ?? 0) - (a.discount ?? 0))
      .slice(0, 40);
  },
  byCategory(categoryId: number) {
    return PRODUCTS.filter((p) => p.categoryId === categoryId);
  },

  reviews(productId: number) {
    return [...reviewsForProduct(productId), ...extraReviews.filter((r) => r.productId === productId)];
  },
  reviewSummary(productId: number) {
    const list = this.reviews(productId);
    const totalReviews = list.length;
    const averageRating =
      totalReviews === 0
        ? 0
        : Math.round((list.reduce((a, r) => a + r.rating, 0) / totalReviews) * 10) / 10;
    return { productId, averageRating, totalReviews };
  },
  addReview(body: { productId: number; userId: number; rating: number; title?: string; comment?: string; userName: string }) {
    const r: Review = {
      id: nextReviewId++,
      productId: body.productId,
      rating: body.rating,
      title: body.title,
      comment: body.comment,
      userName: body.userName,
      createdAt: nowIso(),
    };
    extraReviews.unshift(r);
    return r;
  },

  userByToken(token: string | null) {
    if (!token) return null;
    const id = tokens.get(token);
    if (!id) return null;
    return users.find((u) => u.id === id) ?? null;
  },
  login(email: string, password: string) {
    const u = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!u || u.password !== password) return null;
    tokens.delete(u.token);
    u.token = newToken(u.id);
    tokens.set(u.token, u.id);
    return u;
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
      return { error: "Bu e-posta zaten kayıtlı." as const };
    }
    const id = nextUserId++;
    const u: DemoUser = {
      id,
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      token: newToken(id),
      isEmailVerified: true,
    };
    users.push(u);
    tokens.set(u.token, u.id);
    carts.set(id, []);
    favorites.set(id, []);
    settings.set(id, {
      language: "tr",
      currency: "TRY",
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
    });
    notifications.set(id, [
      {
        id: nextNotifId++,
        title: "Hoş geldiniz",
        message: `Merhaba ${u.firstName}, hesabınız oluşturuldu.`,
        type: "system",
        isRead: false,
        createdAt: nowIso(),
      },
    ]);
    if (body.address && body.city) {
      addresses.set(id, [
        {
          id: nextAddrId++,
          userId: id,
          title: "Ev",
          fullAddress: body.address,
          city: body.city,
          district: body.city,
          postalCode: body.postalCode || "00000",
          country: "Turkey",
          isDefault: true,
          phoneNumber: body.phoneNumber,
        },
      ]);
    } else {
      addresses.set(id, []);
    }
    payments.set(id, []);
    return { user: u };
  },
  logout(token: string) {
    const u = this.userByToken(token);
    if (!u) return;
    tokens.delete(token);
    u.token = newToken(u.id);
  },
  changePassword(user: DemoUser, current: string, next: string, confirm: string) {
    if (user.password !== current) return "Mevcut şifre hatalı.";
    if (next.length < 6) return "Yeni şifre en az 6 karakter olmalı.";
    if (next !== confirm) return "Yeni şifreler eşleşmiyor.";
    user.password = next;
    return null;
  },

  cart(userId: number) {
    if (!carts.has(userId)) carts.set(userId, []);
    return cartDto(userId);
  },
  cartAdd(userId: number, productId: number, quantity: number) {
    const p = PRODUCTS.find((x) => x.id === productId);
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
  cartUpdate(userId: number, productId: number, quantity: number) {
    const items = carts.get(userId) ?? [];
    if (quantity <= 0) {
      carts.set(userId, items.filter((i) => i.productId !== productId));
      return { cart: cartDto(userId) };
    }
    const p = PRODUCTS.find((x) => x.id === productId);
    if (p && quantity > p.unitInStock) return { error: "STOCK_INSUFFICIENT" as const };
    const row = items.find((i) => i.productId === productId);
    if (!row) return { error: "NOT_IN_CART" as const };
    row.quantity = quantity;
    return { cart: cartDto(userId) };
  },
  cartRemove(userId: number, productId: number) {
    const items = (carts.get(userId) ?? []).filter((i) => i.productId !== productId);
    carts.set(userId, items);
    return cartDto(userId);
  },
  cartClear(userId: number) {
    carts.set(userId, []);
  },

  addresses(userId: number) {
    return addresses.get(userId) ?? [];
  },
  addAddress(userId: number, body: Omit<Address, "id" | "userId">) {
    const list = addresses.get(userId) ?? [];
    if (body.isDefault) list.forEach((a) => (a.isDefault = false));
    const a: Address = { ...body, id: nextAddrId++, userId };
    list.push(a);
    addresses.set(userId, list);
    return a;
  },
  deleteAddress(userId: number, id: number) {
    const list = (addresses.get(userId) ?? []).filter((a) => a.id !== id);
    addresses.set(userId, list);
  },

  payments(userId: number) {
    return payments.get(userId) ?? [];
  },
  addPayment(userId: number, body: { type: string; cardHolderName?: string; cardNumber?: string; expiryMonth?: number; expiryYear?: number; isDefault?: boolean }) {
    const list = payments.get(userId) ?? [];
    if (body.isDefault) list.forEach((p) => (p.isDefault = false));
    const last4 = (body.cardNumber || "0000").replace(/\s/g, "").slice(-4);
    const p: PaymentMethod = {
      id: nextPayId++,
      type: body.type || "CREDIT_CARD",
      cardHolderName: body.cardHolderName,
      cardNumber: `**** **** **** ${last4}`,
      expiryMonth: body.expiryMonth,
      expiryYear: body.expiryYear,
      isDefault: body.isDefault ?? list.length === 0,
    };
    list.push(p);
    payments.set(userId, list);
    return p;
  },
  deletePayment(userId: number, id: number) {
    payments.set(userId, (payments.get(userId) ?? []).filter((p) => p.id !== id));
  },

  favorites(userId: number): Favorite[] {
    const out: Favorite[] = [];
    for (const productId of favorites.get(userId) ?? []) {
      const p = PRODUCTS.find((x) => x.id === productId);
      if (!p) continue;
      out.push({
        id: productId,
        productId: p.id,
        productName: p.productName,
        productImageUrl: p.imageUrl,
        productPrice: unitAfterDiscount(p.unitPrice, p.discount),
        productCategory: p.categoryName,
      });
    }
    return out;
  },
  favAdd(userId: number, productId: number) {
    const ids = favorites.get(userId) ?? [];
    if (!ids.includes(productId)) ids.push(productId);
    favorites.set(userId, ids);
    nextFavId += 1;
    return this.favorites(userId).find((f) => f.productId === productId)!;
  },
  favRemove(userId: number, productId: number) {
    favorites.set(userId, (favorites.get(userId) ?? []).filter((id) => id !== productId));
  },
  favCheck(userId: number, productId: number) {
    return (favorites.get(userId) ?? []).includes(productId);
  },

  settings(userId: number) {
    return (
      settings.get(userId) ?? {
        language: "tr",
        currency: "TRY",
        emailNotifications: true,
      }
    );
  },
  putSettings(userId: number, body: UserSettings) {
    const next = { ...this.settings(userId), ...body };
    settings.set(userId, next);
    return next;
  },

  notifications(userId: number) {
    return notifications.get(userId) ?? [];
  },
  markRead(userId: number, id: number) {
    const list = notifications.get(userId) ?? [];
    const n = list.find((x) => x.id === id);
    if (n) n.isRead = true;
    return n;
  },
  markAllRead(userId: number) {
    for (const n of notifications.get(userId) ?? []) n.isRead = true;
  },

  orders(userId: number) {
    return orders.filter((o) => o.userId === userId).map((o) => o.order).reverse();
  },
  order(userId: number, id: number) {
    return orders.find((o) => o.userId === userId && o.order.id === id)?.order;
  },
  createOrder(
    userId: number,
    body: { shippingAddressId: number; paymentMethodId: number; notes?: string; items: { productId: number; quantity: number }[] },
    idemKey: string | null,
  ) {
    if (idemKey && idempotency.has(idemKey)) return { order: idempotency.get(idemKey)! };
    const addr = (addresses.get(userId) ?? []).find((a) => a.id === body.shippingAddressId);
    if (!addr) return { error: "ADDRESS_NOT_OWNED" as const };
    const pay = (payments.get(userId) ?? []).find((p) => p.id === body.paymentMethodId);
    if (!pay) return { error: "PAYMENT_NOT_OWNED" as const };
    const items: OrderItem[] = [];
    let total = 0;
    for (const line of body.items) {
      const p = PRODUCTS.find((x) => x.id === line.productId);
      if (!p || p.isActive === false) return { error: "PRODUCT_NOT_AVAILABLE" as const };
      if (line.quantity > p.unitInStock) return { error: "STOCK_INSUFFICIENT" as const };
      const unit = unitAfterDiscount(p.unitPrice, p.discount);
      const totalPrice = Math.round(unit * line.quantity * 100) / 100;
      total += totalPrice;
      items.push({
        productId: p.id,
        productName: p.productName,
        quantity: line.quantity,
        unitPrice: p.unitPrice,
        totalPrice,
        productImageUrl: p.imageUrl,
      });
      p.unitInStock -= line.quantity;
    }
    const order: Order = {
      id: nextOrderId++,
      orderNumber: `KM-${1000 + nextOrderId}`,
      totalAmount: Math.round(total * 100) / 100,
      status: "pending",
      items,
      shippingAddress: addr,
      paymentMethod: pay,
      createdAt: nowIso(),
      demoNextAction: "DEMO_ADVANCE_FULFILLMENT",
    };
    orders.push({ userId, order });
    carts.set(userId, []);
    if (idemKey) idempotency.set(idemKey, order);
    const nlist = notifications.get(userId) ?? [];
    nlist.unshift({
      id: nextNotifId++,
      title: "Sipariş alındı",
      message: `${order.orderNumber} numaralı siparişiniz alındı.`,
      type: "order",
      isRead: false,
      createdAt: nowIso(),
    });
    notifications.set(userId, nlist);
    return { order };
  },
  cancelOrder(userId: number, id: number, reason?: string) {
    const o = this.order(userId, id);
    if (!o) return { error: "ORDER_NOT_FOUND" as const };
    const st = (o.status || "").toLowerCase();
    if (["shipped", "delivered", "returnrequested", "cancelled", "canceled"].includes(st)) {
      return { error: "ORDER_NOT_CANCELLABLE" as const };
    }
    o.status = "cancelled";
    o.cancelReason = reason;
    o.demoNextAction = null;
    o.updatedAt = nowIso();
    return { ok: true as const };
  },
  returnRequest(userId: number, id: number, reason: string) {
    const o = this.order(userId, id);
    if (!o) return { error: "ORDER_NOT_FOUND" as const };
    if ((o.status || "").toLowerCase() !== "delivered") return { error: "RETURN_NOT_ALLOWED" as const };
    o.status = "returnRequested";
    o.returnReason = reason;
    o.returnRequestedAt = nowIso();
    o.demoNextAction = null;
    return { order: o };
  },
  demoAdvance(userId: number, id: number) {
    const o = this.order(userId, id);
    if (!o) return { error: "ORDER_NOT_FOUND" as const };
    const st = (o.status || "").toLowerCase();
    if (st === "pending") {
      o.status = "processing";
    } else if (st === "processing") {
      o.status = "shipped";
      o.shippedAt = nowIso();
      o.carrier = o.carrier || "Yurtiçi Kargo";
      o.trackingNumber = o.trackingNumber || `TR${o.id}${Date.now().toString().slice(-8)}TR`;
      o.estimatedDeliveryAt = new Date(Date.now() + 2 * 86400000).toISOString();
    } else if (st === "shipped") {
      o.status = "delivered";
      o.demoNextAction = null;
    } else {
      return { error: "DEMO_ADVANCE_INVALID_STATE" as const };
    }
    if (o.status !== "delivered") o.demoNextAction = "DEMO_ADVANCE_FULFILLMENT";
    o.updatedAt = nowIso();
    return { order: o };
  },
};
