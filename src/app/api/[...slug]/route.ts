import { type NextRequest } from "next/server";
import { db } from "@/server/store";
import { fail, ok } from "@/server/respond";

export const dynamic = "force-dynamic";

function bearer(req: NextRequest) {
  const h = req.headers.get("authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

function auth(req: NextRequest) {
  const user = db.userByToken(bearer(req));
  if (!user) return null;
  return user;
}

function match(slug: string[], pattern: string) {
  const parts = pattern.split("/").filter(Boolean);
  if (parts.length !== slug.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith(":")) params[parts[i].slice(1)] = slug[i];
    else if (parts[i] !== slug[i]) return null;
  }
  return params;
}

async function readJson(req: NextRequest) {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function handle(req: NextRequest, slug: string[]) {
  const method = req.method;
  const url = new URL(req.url);
  const q = url.searchParams;

  let m: Record<string, string> | null;

  if (method === "POST" && match(slug, "auth/login")) {
    const body = await readJson(req);
    const email = String(body?.email || "");
    const password = String(body?.password || "");
    const u = db.login(email, password);
    if (!u) return fail("E-posta veya şifre hatalı.", 401, { code: "UNAUTHORIZED" });
    return ok({
      token: u.token,
      userId: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      isEmailVerified: u.isEmailVerified,
    });
  }

  if (method === "POST" && match(slug, "auth/register")) {
    const body = (await readJson(req)) || {};
    const email = String(body.email || "");
    const password = String(body.password || "");
    const firstName = String(body.firstName || "");
    const lastName = String(body.lastName || "");
    const fieldErrors: Record<string, string> = {};
    if (!email) fieldErrors.email = "E-posta gerekli.";
    if (password.length < 6) fieldErrors.password = "Şifre en az 6 karakter.";
    if (!firstName) fieldErrors.firstName = "Ad gerekli.";
    if (!lastName) fieldErrors.lastName = "Soyad gerekli.";
    if (Object.keys(fieldErrors).length) {
      return fail("Girdiğiniz bilgileri kontrol edin.", 400, {
        code: "VALIDATION_ERROR",
        fieldErrors,
      });
    }
    const r = db.register({
      email,
      password,
      firstName,
      lastName,
      address: body.address ? String(body.address) : undefined,
      city: body.city ? String(body.city) : undefined,
      postalCode: body.postalCode ? String(body.postalCode) : undefined,
      phoneNumber: body.phoneNumber ? String(body.phoneNumber) : undefined,
    });
    if ("error" in r) return fail(r.error ?? "Hata", 409, { code: "CONFLICT" });
    const u = r.user;
    return ok({
      token: u.token,
      userId: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
    });
  }

  if (method === "POST" && match(slug, "auth/logout")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    db.logout(u.token);
    return ok("Çıkış yapıldı");
  }

  if (method === "GET" && match(slug, "category")) {
    return ok(db.categories());
  }

  if (method === "GET" && match(slug, "campaign/active")) {
    return ok(db.campaigns());
  }

  if (method === "GET" && match(slug, "product/featured")) {
    return ok(db.featured());
  }

  if (method === "GET" && match(slug, "product/discounted")) {
    return ok(db.discounted());
  }

  m = match(slug, "product/category/:categoryId");
  if (method === "GET" && m) {
    return ok(db.byCategory(Number(m.categoryId)));
  }

  m = match(slug, "product/:id");
  if (method === "GET" && m) {
    const p = db.product(Number(m.id));
    if (!p) return fail("Ürün bulunamadı.", 404);
    return ok(p);
  }

  if (method === "GET" && match(slug, "product")) {
    const pageNumber = Number(q.get("pageNumber") || "1") || 1;
    const pageSize = Number(q.get("pageSize") || "24") || 24;
    const categoryId = q.get("categoryId") ? Number(q.get("categoryId")) : undefined;
    const minPrice = q.get("minPrice") ? Number(q.get("minPrice")) : undefined;
    const maxPrice = q.get("maxPrice") ? Number(q.get("maxPrice")) : undefined;
    return ok(
      db.productsPage({
        pageNumber,
        pageSize,
        sortBy: q.get("sortBy") || "id",
        sortOrder: q.get("sortOrder") || "asc",
        categoryId: Number.isFinite(categoryId) ? categoryId : undefined,
        searchTerm: q.get("searchTerm") || undefined,
        minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
        maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      }),
    );
  }

  m = match(slug, "review/product/:productId/summary");
  if (method === "GET" && m) {
    return ok(db.reviewSummary(Number(m.productId)));
  }

  m = match(slug, "review/product/:productId");
  if (method === "GET" && m) {
    return ok(db.reviews(Number(m.productId)));
  }

  if (method === "POST" && match(slug, "review")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const body = (await readJson(req)) || {};
    const productId = Number(body.productId);
    const rating = Number(body.rating);
    if (!db.product(productId)) return fail("Ürün bulunamadı.", 404);
    if (rating < 1 || rating > 5) return fail("Puan 1-5 olmalı.", 400);
    return ok(
      db.addReview({
        productId,
        userId: u.id,
        rating,
        title: body.title ? String(body.title) : undefined,
        comment: body.comment ? String(body.comment) : undefined,
        userName: `${u.firstName} ${u.lastName[0]}.`,
      }),
    );
  }

  if (method === "GET" && match(slug, "cart")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    return ok(db.cart(u.id));
  }

  if (method === "POST" && match(slug, "cart/add")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const body = (await readJson(req)) || {};
    const r = db.cartAdd(u.id, Number(body.productId), Number(body.quantity) || 1);
    if ("error" in r) return fail(r.error ?? "Hata", 409, { code: r.error });
    return ok(r.cart);
  }

  if (method === "PUT" && match(slug, "cart/update")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const body = (await readJson(req)) || {};
    const r = db.cartUpdate(u.id, Number(body.productId), Number(body.quantity));
    if (typeof r === "object" && "error" in r) {
      return fail(r.error ?? "Hata", 409, { code: r.error });
    }
    return ok(r.cart);
  }

  m = match(slug, "cart/remove/:productId");
  if (method === "DELETE" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    return ok(db.cartRemove(u.id, Number(m.productId)));
  }

  if (method === "DELETE" && match(slug, "cart/clear")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    db.cartClear(u.id);
    return ok("Sepet temizlendi");
  }

  if (method === "GET" && match(slug, "order")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    return ok(db.orders(u.id));
  }

  if (method === "POST" && match(slug, "order")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const body = (await readJson(req)) || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const r = db.createOrder(
      u.id,
      {
        shippingAddressId: Number(body.shippingAddressId),
        paymentMethodId: Number(body.paymentMethodId),
        notes: body.notes ? String(body.notes) : undefined,
        items: items.map((i: { productId: number; quantity: number }) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
        })),
      },
      req.headers.get("idempotency-key"),
    );
    if ("error" in r) return fail(r.error ?? "Hata", 409, { code: r.error });
    return ok(r.order);
  }

  m = match(slug, "order/:id/cancel");
  if (method === "PUT" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const body = (await readJson(req)) || {};
    const r = db.cancelOrder(u.id, Number(m.id), body.reason ? String(body.reason) : undefined);
    if ("error" in r) return fail(r.error ?? "Hata", 409, { code: r.error });
    return ok("Sipariş iptal edildi");
  }

  m = match(slug, "order/:id/return-request");
  if (method === "POST" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const body = (await readJson(req)) || {};
    const reason = String(body.reason || "").trim();
    if (!reason) return fail("İade nedeni gerekli.", 400);
    const r = db.returnRequest(u.id, Number(m.id), reason);
    if ("error" in r) return fail(r.error ?? "Hata", 409, { code: r.error });
    return ok(r.order);
  }

  m = match(slug, "order/:id/demo/advance-fulfillment");
  if (method === "POST" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const r = db.demoAdvance(u.id, Number(m.id));
    if ("error" in r) return fail(r.error ?? "Hata", 409, { code: r.error });
    return ok(r.order);
  }

  m = match(slug, "order/:id");
  if (method === "GET" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const o = db.order(u.id, Number(m.id));
    if (!o) return fail("Sipariş bulunamadı.", 404, { code: "ORDER_NOT_FOUND" });
    return ok(o);
  }

  m = match(slug, "address/user/:userId");
  if (method === "GET" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    if (u.id !== Number(m.userId)) return fail("Yetkisiz.", 403, { code: "FORBIDDEN" });
    return ok(db.addresses(u.id));
  }

  if (method === "POST" && match(slug, "address")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const body = (await readJson(req)) || {};
    return ok(
      db.addAddress(u.id, {
        title: String(body.title || "Adres"),
        fullAddress: String(body.fullAddress || ""),
        city: String(body.city || ""),
        district: String(body.district || ""),
        postalCode: String(body.postalCode || ""),
        country: body.country ? String(body.country) : "Turkey",
        isDefault: Boolean(body.isDefault),
        phoneNumber: body.phoneNumber ? String(body.phoneNumber) : undefined,
      }),
    );
  }

  m = match(slug, "address/:id");
  if (method === "DELETE" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    db.deleteAddress(u.id, Number(m.id));
    return ok("Silindi");
  }

  m = match(slug, "payment-method/user/:userId");
  if (method === "GET" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    if (u.id !== Number(m.userId)) return fail("Yetkisiz.", 403, { code: "FORBIDDEN" });
    return ok(db.payments(u.id));
  }

  if (method === "POST" && match(slug, "payment-method")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const body = (await readJson(req)) || {};
    return ok(
      db.addPayment(u.id, {
        type: String(body.type || "CREDIT_CARD"),
        cardHolderName: body.cardHolderName ? String(body.cardHolderName) : undefined,
        cardNumber: body.cardNumber ? String(body.cardNumber) : undefined,
        expiryMonth: body.expiryMonth != null ? Number(body.expiryMonth) : undefined,
        expiryYear: body.expiryYear != null ? Number(body.expiryYear) : undefined,
        isDefault: Boolean(body.isDefault),
      }),
    );
  }

  m = match(slug, "payment-method/:id");
  if (method === "DELETE" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    db.deletePayment(u.id, Number(m.id));
    return ok("Silindi");
  }

  if (method === "GET" && match(slug, "favorite")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    return ok(db.favorites(u.id));
  }

  if (method === "POST" && match(slug, "favorite/add")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const body = (await readJson(req)) || {};
    return ok(db.favAdd(u.id, Number(body.productId)));
  }

  m = match(slug, "favorite/remove/:productId");
  if (method === "DELETE" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    db.favRemove(u.id, Number(m.productId));
    return ok("Kaldırıldı");
  }

  m = match(slug, "favorite/check/:productId");
  if (method === "GET" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    return ok(db.favCheck(u.id, Number(m.productId)));
  }

  m = match(slug, "settings/user/:userId");
  if (method === "GET" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    if (u.id !== Number(m.userId)) return fail("Yetkisiz.", 403, { code: "FORBIDDEN" });
    return ok(db.settings(u.id));
  }

  m = match(slug, "settings/user/:userId");
  if (method === "PUT" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    if (u.id !== Number(m.userId)) return fail("Yetkisiz.", 403, { code: "FORBIDDEN" });
    const body = (await readJson(req)) || {};
    return ok(db.putSettings(u.id, body));
  }

  m = match(slug, "notification/user/:userId");
  if (method === "GET" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    if (u.id !== Number(m.userId)) return fail("Yetkisiz.", 403, { code: "FORBIDDEN" });
    return ok(db.notifications(u.id));
  }

  if (method === "PUT" && match(slug, "notification/mark-all-read")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    db.markAllRead(u.id);
    return ok("Tamamı okundu");
  }

  m = match(slug, "notification/:id");
  if (method === "PUT" && m) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const n = db.markRead(u.id, Number(m.id));
    if (!n) return fail("Bildirim bulunamadı.", 404);
    return ok(n);
  }

  if (method === "POST" && match(slug, "security/change-password")) {
    const u = auth(req);
    if (!u) return fail("Giriş gerekli.", 401, { code: "UNAUTHORIZED" });
    const body = (await readJson(req)) || {};
    const err = db.changePassword(
      u,
      String(body.currentPassword || ""),
      String(body.newPassword || ""),
      String(body.confirmPassword || ""),
    );
    if (err) return fail(err, 400, { code: "VALIDATION_ERROR" });
    return ok("Şifre güncellendi");
  }

  return fail("Bu işlem bu adreste desteklenmiyor.", 404, { code: "METHOD_NOT_ALLOWED" });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await ctx.params;
  return handle(req, slug);
}
export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await ctx.params;
  return handle(req, slug);
}
export async function PUT(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await ctx.params;
  return handle(req, slug);
}
export async function DELETE(req: NextRequest, ctx: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await ctx.params;
  return handle(req, slug);
}
