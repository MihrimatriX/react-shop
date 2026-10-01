import { type NextRequest } from "next/server";
import { db, type DemoUser } from "@/server/store";
import { fail, ok } from "@/server/respond";

export const dynamic = "force-dynamic";

type Params = Record<string, string>;

/** Pozitif tamsayı değilse null. */
const posInt = (v: unknown) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};
/** Kırpılmış ve uzunluğu sınırlanmış metin; boşsa undefined. */
const text = (v: unknown, max = 500) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;
const invalid = (message: string) => fail("VALIDATION_ERROR", 400, message);

const SETTINGS_KEYS = ["language", "currency", "emailNotifications", "smsNotifications", "marketingEmails"];

function match(slug: string[], pattern: string): Params | null {
  const parts = pattern.split("/");
  if (parts.length !== slug.length) return null;
  const params: Params = {};
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith(":")) params[parts[i].slice(1)] = slug[i];
    else if (parts[i] !== slug[i]) return null;
  }
  return params;
}

function session(r: { user: DemoUser; token: string }) {
  const { user } = r;
  return ok({
    token: r.token,
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isEmailVerified: user.isEmailVerified,
  });
}

async function handle(req: NextRequest, slug: string[]) {
  const method = req.method;
  const q = req.nextUrl.searchParams;
  const raw: unknown = method === "POST" || method === "PUT" ? await req.json().catch(() => null) : null;
  const body = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const is = (verb: string, pattern: string) => (method === verb ? match(slug, pattern) : null);
  let m: Params | null;

  // ---- Herkese açık uçlar ----

  if (is("POST", "auth/login")) {
    const r = db.login(String(body.email ?? ""), String(body.password ?? ""));
    return r ? session(r) : fail("UNAUTHORIZED", 401, "E-posta veya şifre hatalı.");
  }

  if (is("POST", "auth/register")) {
    const email = text(body.email, 120) ?? "";
    const password = String(body.password ?? "");
    const firstName = text(body.firstName, 60);
    const lastName = text(body.lastName, 60);
    if (!/^\S+@\S+\.\S+$/.test(email)) return invalid("Geçerli bir e-posta girin.");
    if (password.length < 6) return invalid("Şifre en az 6 karakter olmalı.");
    if (!firstName || !lastName) return invalid("Ad ve soyad gerekli.");
    const r = db.register({
      email,
      password,
      firstName,
      lastName,
      address: text(body.address),
      city: text(body.city, 60),
      postalCode: text(body.postalCode, 10),
      phoneNumber: text(body.phoneNumber, 20),
    });
    return r.error ? fail(r.error) : session(r);
  }

  if (is("GET", "category")) return ok(db.categories());
  if (is("GET", "campaign/active")) return ok(db.campaigns());
  if (is("GET", "product/featured")) return ok(db.featured());
  if (is("GET", "product/discounted")) return ok(db.discounted());
  if ((m = is("GET", "product/category/:categoryId"))) return ok(db.byCategory(Number(m.categoryId)));

  if ((m = is("GET", "product/:id"))) {
    const p = db.product(Number(m.id));
    return p ? ok(p) : fail("PRODUCT_NOT_FOUND", 404);
  }

  if (is("GET", "product")) {
    const num = (k: string) => {
      const n = Number(q.get(k) || NaN);
      return Number.isFinite(n) ? n : undefined;
    };
    return ok(
      db.productsPage({
        pageNumber: posInt(q.get("pageNumber")) ?? 1,
        pageSize: Math.min(posInt(q.get("pageSize")) ?? 24, 100),
        sortBy: q.get("sortBy") || "id",
        sortOrder: q.get("sortOrder") || "asc",
        categoryId: posInt(q.get("categoryId")) ?? undefined,
        searchTerm: q.get("searchTerm") || undefined,
        minPrice: num("minPrice"),
        maxPrice: num("maxPrice"),
      }),
    );
  }

  if ((m = is("GET", "review/product/:productId/summary"))) return ok(db.reviewSummary(Number(m.productId)));
  if ((m = is("GET", "review/product/:productId"))) return ok(db.reviews(Number(m.productId)));

  // ---- Buradan sonrası oturum ister ----

  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const u = db.userByToken(token);
  if (!u || !token) return fail("UNAUTHORIZED", 401);
  const forbidden = (userId: string) => Number(userId) !== u.id;

  if (is("POST", "auth/logout")) {
    db.logout(token);
    return ok(null);
  }

  if (is("POST", "review")) {
    const productId = Number(body.productId);
    const rating = Number(body.rating);
    if (!db.product(productId)) return fail("PRODUCT_NOT_FOUND", 404);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return invalid("Puan 1 ile 5 arasında olmalı.");
    return ok(
      db.addReview({
        productId,
        rating,
        title: text(body.title, 120),
        comment: text(body.comment, 1000),
        userName: `${u.firstName} ${u.lastName[0]}.`,
      }),
    );
  }

  if (is("GET", "cart")) return ok(db.cart(u.id));

  if (is("POST", "cart/add")) {
    const quantity = body.quantity === undefined ? 1 : posInt(body.quantity);
    if (!quantity) return invalid("Adet pozitif bir tamsayı olmalı.");
    const r = db.cartAdd(u.id, Number(body.productId), quantity);
    return r.error ? fail(r.error) : ok(r.cart);
  }

  if (is("PUT", "cart/update")) {
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) return invalid("Adet 0 veya pozitif bir tamsayı olmalı.");
    const r = db.cartUpdate(u.id, Number(body.productId), quantity);
    return r.error ? fail(r.error) : ok(r.cart);
  }

  if ((m = is("DELETE", "cart/remove/:productId"))) return ok(db.cartRemove(u.id, Number(m.productId)));

  if (is("DELETE", "cart/clear")) {
    db.cartClear(u.id);
    return ok(null);
  }

  if (is("GET", "order")) return ok(db.orders(u.id));

  if (is("POST", "order")) {
    const r = db.createOrder(
      u.id,
      {
        shippingAddressId: Number(body.shippingAddressId),
        paymentMethodId: Number(body.paymentMethodId),
        notes: text(body.notes),
      },
      text(req.headers.get("idempotency-key"), 64) ?? null,
    );
    return r.error ? fail(r.error) : ok(r.order);
  }

  if ((m = is("PUT", "order/:id/cancel"))) {
    const r = db.cancelOrder(u.id, Number(m.id), text(body.reason));
    return r.error ? fail(r.error) : ok(r.order);
  }

  if ((m = is("POST", "order/:id/return-request"))) {
    const reason = text(body.reason);
    if (!reason) return invalid("İade nedeni gerekli.");
    const r = db.returnRequest(u.id, Number(m.id), reason);
    return r.error ? fail(r.error) : ok(r.order);
  }

  if ((m = is("POST", "order/:id/demo/advance-fulfillment"))) {
    const r = db.demoAdvance(u.id, Number(m.id));
    return r.error ? fail(r.error) : ok(r.order);
  }

  if ((m = is("GET", "order/:id"))) {
    const o = db.order(u.id, Number(m.id));
    return o ? ok(o) : fail("ORDER_NOT_FOUND", 404);
  }

  if ((m = is("GET", "address/user/:userId"))) {
    return forbidden(m.userId) ? fail("FORBIDDEN", 403) : ok(db.addresses(u.id));
  }

  if (is("POST", "address")) {
    const fullAddress = text(body.fullAddress);
    const city = text(body.city, 60);
    if (!fullAddress || !city) return invalid("Açık adres ve şehir gerekli.");
    return ok(
      db.addAddress(u.id, {
        title: text(body.title, 40) ?? "Adres",
        fullAddress,
        city,
        district: text(body.district, 60) ?? "",
        postalCode: text(body.postalCode, 10) ?? "",
        country: text(body.country, 60) ?? "Turkey",
        isDefault: body.isDefault === true,
        phoneNumber: text(body.phoneNumber, 20),
      }),
    );
  }

  if ((m = is("DELETE", "address/:id"))) {
    db.deleteAddress(u.id, Number(m.id));
    return ok(null);
  }

  if ((m = is("GET", "payment-method/user/:userId"))) {
    return forbidden(m.userId) ? fail("FORBIDDEN", 403) : ok(db.payments(u.id));
  }

  if (is("POST", "payment-method")) {
    const digits = String(body.cardNumber ?? "").replace(/\D/g, "");
    const expiryMonth = posInt(body.expiryMonth);
    if (digits.length < 12 || digits.length > 19) return invalid("Geçerli bir kart numarası girin.");
    if (!expiryMonth || expiryMonth > 12) return invalid("Son kullanma ayı 1-12 olmalı.");
    return ok(
      db.addPayment(u.id, {
        cardHolderName: text(body.cardHolderName, 80),
        cardNumber: digits,
        expiryMonth,
        expiryYear: posInt(body.expiryYear) ?? undefined,
        isDefault: body.isDefault === true,
      }),
    );
  }

  if ((m = is("DELETE", "payment-method/:id"))) {
    db.deletePayment(u.id, Number(m.id));
    return ok(null);
  }

  if (is("GET", "favorite")) return ok(db.favorites(u.id));

  if (is("POST", "favorite/add")) {
    const productId = Number(body.productId);
    if (!db.product(productId)) return fail("PRODUCT_NOT_FOUND", 404);
    return ok(db.favAdd(u.id, productId));
  }

  if ((m = is("DELETE", "favorite/remove/:productId"))) {
    db.favRemove(u.id, Number(m.productId));
    return ok(null);
  }

  if ((m = is("GET", "favorite/check/:productId"))) return ok(db.favCheck(u.id, Number(m.productId)));

  if ((m = is("GET", "settings/user/:userId"))) {
    return forbidden(m.userId) ? fail("FORBIDDEN", 403) : ok(db.settings(u.id));
  }

  if ((m = is("PUT", "settings/user/:userId"))) {
    if (forbidden(m.userId)) return fail("FORBIDDEN", 403);
    const patch = Object.fromEntries(
      Object.entries(body).filter(
        ([k, v]) => SETTINGS_KEYS.includes(k) && (typeof v === "boolean" || (typeof v === "string" && v.length <= 10)),
      ),
    );
    return ok(db.putSettings(u.id, patch));
  }

  if ((m = is("GET", "notification/user/:userId"))) {
    return forbidden(m.userId) ? fail("FORBIDDEN", 403) : ok(db.notifications(u.id));
  }

  if (is("PUT", "notification/mark-all-read")) {
    db.markAllRead(u.id);
    return ok(null);
  }

  if ((m = is("PUT", "notification/:id"))) {
    const n = db.markRead(u.id, Number(m.id));
    return n ? ok(n) : fail("NOTIFICATION_NOT_FOUND", 404);
  }

  if (is("POST", "security/change-password")) {
    const err = db.changePassword(
      u,
      String(body.currentPassword ?? ""),
      String(body.newPassword ?? ""),
      String(body.confirmPassword ?? ""),
    );
    return err ? invalid(err) : ok(null);
  }

  return fail("NOT_FOUND", 404);
}

async function handler(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  return handle(req, (await ctx.params).slug);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
