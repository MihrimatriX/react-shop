import { strict as assert } from "node:assert";
import { filterProducts, paginate, PRODUCTS, type ProductQuery } from "./catalog.ts";

const q = (over: Partial<ProductQuery>): ProductQuery => ({
  pageNumber: 1,
  pageSize: 24,
  sortBy: "id",
  sortOrder: "asc",
  ...over,
});

assert.ok(PRODUCTS.length >= 400, `expected 400+ products, got ${PRODUCTS.length}`);

// Satış fiyatı indirimden türetilir ve puan/yorum sayısı tutarlıdır.
for (const p of PRODUCTS) {
  const d = p.discount ?? 0;
  assert.ok(Math.abs(p.price - p.unitPrice * (1 - d / 100)) < 0.01, `price mismatch #${p.id}`);
  assert.ok(p.reviewCount >= 2 && p.rating >= 3 && p.rating <= 5, `rating #${p.id}`);
}

assert.equal(filterProducts(PRODUCTS, q({ categoryId: 1 })).length, 24);

// Fiyat filtresi ve sıralaması indirimli fiyata göre.
const cheap = filterProducts(PRODUCTS, q({ sortBy: "price", maxPrice: 100 }));
assert.ok(cheap.length > 0 && cheap.every((p) => p.price <= 100));
assert.ok(cheap.every((p, i) => i === 0 || cheap[i - 1].price <= p.price));

// İsim sıralaması Türkçe alfabeye göre (Ç, C'den sonra; Z'den önce).
const names = filterProducts(PRODUCTS, q({ sortBy: "productName" })).map((p) => p.productName);
assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, "tr")));

const phone = filterProducts(PRODUCTS, q({ pageSize: 50, searchTerm: "telefon" }));
assert.ok(phone.length > 0);

const page = paginate([1, 2, 3, 4, 5], 2, 2);
assert.deepEqual(page.content, [3, 4]);
assert.equal(page.totalPages, 3);
assert.equal(page.number, 1);

console.log("catalog.check ok", PRODUCTS.length, "products");
