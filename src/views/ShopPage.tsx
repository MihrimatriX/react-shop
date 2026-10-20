"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { ProductCard } from "../components/ProductCard";
import { api, unwrap } from "../lib/api";
import type { Category } from "../types/api";

const SORTS = [
  ["id:asc", "Önerilen"],
  ["price:asc", "En düşük fiyat"],
  ["price:desc", "En yüksek fiyat"],
  ["discount:desc", "En yüksek indirim"],
  ["productName:asc", "İsim (A-Z)"],
];

export function ShopPage({ categories }: { categories: Category[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const page = Number(sp.get("page")) || 1;
  const categoryId = sp.get("categoryId") ?? "";
  const searchTerm = sp.get("q") ?? "";
  const sort = `${sp.get("sortBy") || "id"}:${sp.get("sortOrder") || "asc"}`;

  const params = new URLSearchParams({
    pageNumber: String(page),
    pageSize: "24",
    sortBy: sort.split(":")[0],
    sortOrder: sort.split(":")[1],
  });
  for (const [from, to] of [["categoryId", "categoryId"], ["q", "searchTerm"], ["minPrice", "minPrice"], ["maxPrice", "maxPrice"]]) {
    const v = sp.get(from);
    if (v) params.set(to, v);
  }

  const products = useQuery({
    queryKey: ["products", params.toString()],
    queryFn: () => api.products.page(params).then(unwrap),
    placeholderData: (prev) => prev,
  });

  /** Verilen alanları URL'e yazar (boş değer siler); sayfa dışındaki her değişiklik 1. sayfaya döner. */
  function update(patch: Record<string, string>) {
    const next = new URLSearchParams(sp);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in patch)) next.delete("page");
    router.push(`/shop?${next}`);
  }

  function onFilter(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    update({
      q: String(fd.get("q") ?? "").trim(),
      minPrice: String(fd.get("minPrice") ?? ""),
      maxPrice: String(fd.get("maxPrice") ?? ""),
    });
  }

  const catName = categories.find((c) => String(c.id) === categoryId)?.categoryName;
  const data = products.data;

  return (
    <div className="container page">
      <nav className="breadcrumb">
        <Link href="/">Anasayfa</Link> / <Link href="/shop">Ürünler</Link>
        {catName ? <> / {catName}</> : null}
      </nav>

      <h1 className="page-title">{searchTerm ? `“${searchTerm}” için sonuçlar` : catName || "Tüm ürünler"}</h1>

      <div className="shop-layout">
        {/* key: header'dan yeni arama gelince defaultValue'lar URL ile yeniden eşlensin */}
        <form key={sp.toString()} className="card filter-panel form-grid" onSubmit={onFilter}>
          <div className="filter-panel__title">Filtreler</div>
          <label>
            Kelime ara
            <input className="input" name="q" type="search" defaultValue={searchTerm} placeholder="Ürün adı..." />
          </label>
          <label>
            Kategori
            <select className="input" value={categoryId} onChange={(e) => update({ categoryId: e.target.value })}>
              <option value="">Tüm kategoriler</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="price-range">
            <legend>Fiyat aralığı (₺)</legend>
            <input className="input" name="minPrice" type="number" min={0} placeholder="En az" defaultValue={sp.get("minPrice") ?? ""} />
            <input className="input" name="maxPrice" type="number" min={0} placeholder="En çok" defaultValue={sp.get("maxPrice") ?? ""} />
          </fieldset>
          <button type="submit" className="btn btn-primary">
            Uygula
          </button>
        </form>

        <div>
          <div className="toolbar">
            <label className="toolbar__sort">
              Sıralama
              <select
                className="input"
                value={sort}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split(":");
                  update({ sortBy, sortOrder });
                }}
              >
                {SORTS.map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {data ? <span className="toolbar__count">{data.totalElements.toLocaleString("tr-TR")} ürün</span> : null}
          </div>

          {products.isError ? (
            <p className="error">{products.error.message}</p>
          ) : !data ? (
            <div className="grid-products">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="skeleton skeleton--tile" />
              ))}
            </div>
          ) : data.content.length === 0 ? (
            <p className="empty">Aramanıza uygun ürün bulunamadı.</p>
          ) : (
            <>
              <div className="grid-products">
                {data.content.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div className="pager">
                <button type="button" className="btn btn-ghost" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
                  ← Önceki
                </button>
                <span>
                  Sayfa {page} / {data.totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-ghost"
                  disabled={page >= data.totalPages}
                  onClick={() => update({ page: String(page + 1) })}
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
