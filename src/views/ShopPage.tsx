"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { api } from "../lib/api";
import { ProductCard } from "../components/ProductCard";

export function ShopPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  function setSp(next: URLSearchParams) {
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }
  const pageNumber = Number(sp.get("page") || "1") || 1;
  const pageSize = Number(sp.get("size") || "24") || 24;
  const categoryId = sp.get("categoryId") || "";
  const searchTerm = sp.get("q") || "";
  const minPrice = sp.get("minPrice") || "";
  const maxPrice = sp.get("maxPrice") || "";
  const sortBy = sp.get("sortBy") || "id";
  const sortOrder = sp.get("sortOrder") || "asc";

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("pageNumber", String(pageNumber));
    p.set("pageSize", String(pageSize));
    p.set("sortBy", sortBy);
    p.set("sortOrder", sortOrder);
    if (categoryId) p.set("categoryId", categoryId);
    if (searchTerm) p.set("searchTerm", searchTerm);
    if (minPrice) p.set("minPrice", minPrice);
    if (maxPrice) p.set("maxPrice", maxPrice);
    return p;
  }, [
    pageNumber,
    pageSize,
    categoryId,
    searchTerm,
    minPrice,
    maxPrice,
    sortBy,
    sortOrder,
  ]);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await api.categories.all();
      if (!r.success) throw new Error(r.message);
      return r.data || [];
    },
  });

  const products = useQuery({
    queryKey: ["products", "page", params.toString()],
    queryFn: async () => {
      const r = await api.products.page(params);
      if (!r.success) throw new Error(r.message);
      return r.data!;
    },
  });

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(sp);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSp(next);
  }

  const catName = categoryId
    ? categories.data?.find((c) => String(c.id) === categoryId)?.categoryName
    : null;

  return (
    <div
      className="container"
      style={{ paddingTop: "1.75rem", paddingBottom: "3rem" }}
    >
      <nav className="breadcrumb">
        <Link href="/">Anasayfa</Link>
        {" / "}
        <Link href="/shop">Ürünler</Link>
        {catName ? (
          <>
            {" / "}
            <span>{catName}</span>
          </>
        ) : null}
        {searchTerm ? (
          <>
            {" / "}
            <span>&quot;{searchTerm}&quot; araması</span>
          </>
        ) : null}
      </nav>

      <h1
        className="brand-display"
        style={{ fontSize: "1.5rem", margin: "0 0 0.35rem" }}
      >
        {searchTerm
          ? `“${searchTerm}” için sonuçlar`
          : catName || "Tüm ürünler"}
      </h1>
      <p style={{ color: "var(--muted)", marginTop: 0, fontSize: "0.9rem" }}>
        Filtreleyin, karşılaştırın; binlerce ürün arasından seçin.
      </p>

      <div className="shop-layout">
        <aside className="card filter-panel" style={{ padding: "1.35rem" }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: "1rem",
              marginBottom: "1rem",
              paddingBottom: "0.65rem",
              borderBottom: "2px solid var(--market)",
            }}
          >
            Filtreler
          </div>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              marginBottom: "0.35rem",
              fontSize: "0.85rem",
            }}
          >
            Kelime ara
          </label>
          <input
            className="input"
            defaultValue={searchTerm}
            placeholder="Ürün adı..."
            onKeyDown={(e) => {
              if (e.key === "Enter")
                setFilter("q", (e.target as HTMLInputElement).value);
            }}
            style={{ marginBottom: "1rem" }}
          />
          <label
            style={{
              display: "block",
              fontWeight: 700,
              marginBottom: "0.35rem",
              fontSize: "0.85rem",
            }}
          >
            Kategori
          </label>
          <select
            className="input"
            value={categoryId}
            onChange={(e) => setFilter("categoryId", e.target.value)}
            style={{ marginBottom: "1rem" }}
          >
            <option value="">Tüm kategoriler</option>
            {(categories.data || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.categoryName}
              </option>
            ))}
          </select>
          <label
            style={{
              display: "block",
              fontWeight: 700,
              marginBottom: "0.35rem",
              fontSize: "0.85rem",
            }}
          >
            Fiyat aralığı (₺)
          </label>
          <input
            className="input"
            type="number"
            placeholder="En az"
            defaultValue={minPrice}
            id="minP"
            style={{ marginBottom: "0.5rem" }}
          />
          <input
            className="input"
            type="number"
            placeholder="En çok"
            defaultValue={maxPrice}
            id="maxP"
            style={{ marginBottom: "0.75rem" }}
          />
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", marginBottom: "0.5rem" }}
            onClick={() => {
              const min =
                (document.getElementById("minP") as HTMLInputElement)?.value ||
                "";
              const max =
                (document.getElementById("maxP") as HTMLInputElement)?.value ||
                "";
              const next = new URLSearchParams(sp);
              if (min) next.set("minPrice", min);
              else next.delete("minPrice");
              if (max) next.set("maxPrice", max);
              else next.delete("maxPrice");
              next.set("page", "1");
              setSp(next);
            }}
          >
            Uygula
          </button>
        </aside>

        <div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.65rem",
              marginBottom: "1rem",
              alignItems: "center",
              padding: "0.65rem 0.85rem",
              background: "var(--card)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius)",
            }}
          >
            <span
              style={{
                color: "var(--muted)",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              Sıralama
            </span>
            <select
              className="input"
              style={{ width: "auto", minWidth: 140 }}
              value={sortBy}
              onChange={(e) => setFilter("sortBy", e.target.value)}
            >
              <option value="id">Önerilen</option>
              <option value="productName">İsme göre</option>
              <option value="unitPrice">Fiyata göre</option>
              <option value="discount">İndirim oranı</option>
            </select>
            <select
              className="input"
              style={{ width: "auto" }}
              value={sortOrder}
              onChange={(e) => setFilter("sortOrder", e.target.value)}
            >
              <option value="asc">Artan</option>
              <option value="desc">Azalan</option>
            </select>
            {products.data ? (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  color: "var(--market)",
                }}
              >
                {products.data.totalElements.toLocaleString("tr-TR")} ürün
              </span>
            ) : null}
          </div>

          {products.isLoading ? (
            <div className="grid-products">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="skeleton" style={{ height: 360 }} />
              ))}
            </div>
          ) : products.isError ? (
            <p style={{ color: "var(--danger)" }}>
              {(products.error as Error).message}
            </p>
          ) : (
            <>
              <div className="grid-products">
                {products.data!.content.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "center",
                  marginTop: "1.75rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pageNumber <= 1}
                  onClick={() => {
                    const n = new URLSearchParams(sp);
                    n.set("page", String(pageNumber - 1));
                    setSp(n);
                  }}
                >
                  ← Önceki
                </button>
                <span
                  style={{
                    alignSelf: "center",
                    color: "var(--muted)",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Sayfa {pageNumber} / {Math.max(1, products.data!.totalPages)}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={pageNumber >= products.data!.totalPages}
                  onClick={() => {
                    const n = new URLSearchParams(sp);
                    n.set("page", String(pageNumber + 1));
                    setSp(n);
                  }}
                >
                  Sonraki →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
