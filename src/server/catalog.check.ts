import { strict as assert } from "node:assert";
import { filterProducts, paginate, PRODUCTS } from "./catalog.ts";

assert.ok(PRODUCTS.length >= 400, `expected 400+ products, got ${PRODUCTS.length}`);

const cat1 = filterProducts(PRODUCTS, {
  pageNumber: 1,
  pageSize: 24,
  sortBy: "id",
  sortOrder: "asc",
  categoryId: 1,
});
assert.equal(cat1.length, 24);

const cheap = filterProducts(PRODUCTS, {
  pageNumber: 1,
  pageSize: 24,
  sortBy: "unitPrice",
  sortOrder: "asc",
  maxPrice: 100,
});
assert.ok(cheap.every((p) => p.unitPrice <= 100));

const phone = filterProducts(PRODUCTS, {
  pageNumber: 1,
  pageSize: 50,
  sortBy: "id",
  sortOrder: "asc",
  searchTerm: "telefon",
});
assert.ok(phone.length > 0);
assert.ok(phone.every((p) => p.productName.toLowerCase().includes("telefon") || (p.description || "").toLowerCase().includes("telefon") || (p.categoryName || "").toLowerCase().includes("telefon")));

const page = paginate([1, 2, 3, 4, 5], 2, 2);
assert.deepEqual(page.content, [3, 4]);
assert.equal(page.totalPages, 3);
assert.equal(page.number, 1);

console.log("catalog.check ok", PRODUCTS.length, "products");
