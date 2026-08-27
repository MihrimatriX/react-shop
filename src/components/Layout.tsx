"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { cartTotalQty } from "../store/cartStore";

export function Layout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const qc = useQueryClient();

  const cartQ = useQuery({
    queryKey: ["cart", user?.token ?? ""],
    queryFn: async () => {
      const r = await api.cart.get(user!.token);
      if (!r.success || !r.data) throw new Error(r.message);
      return r.data;
    },
    enabled: !!user?.token,
  });
  const n = user?.token ? cartTotalQty(cartQ.data?.items ?? []) : 0;

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await api.categories.all();
      if (!r.success) throw new Error(r.message);
      return r.data || [];
    },
  });

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const q = String(fd.get("q") || "").trim();
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    p.set("page", "1");
    router.push(`/shop?${p.toString()}`);
  }

  return (
    <>
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/shop">Kampanyalar</Link>
            <Link href="/shop?sortBy=discount&sortOrder=desc">
              Flaş indirimler
            </Link>
            <span>Satıcı olun</span>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <span>Müşteri hizmetleri: 0850 000 00 00</span>
            <Link href="/account">Yardım</Link>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-main">
          <Link href="/" className="logo-block">
            <div className="logo-mark">K</div>
            <div className="logo-text">
              <span className="logo-name">KapıdaMart</span>
              <span className="logo-tag">Uygun fiyat · Hızlı teslimat</span>
            </div>
          </Link>

          <div className="search-shell">
            <form className="search-form" onSubmit={onSearch}>
              <input
                name="q"
                type="search"
                placeholder="Ürün, kategori veya marka ara"
                autoComplete="off"
              />
              <button type="submit">Ara</button>
            </form>
          </div>

          <div className="header-actions">
            {user ? (
              <>
                <Link href="/account" className="header-link">
                  <span aria-hidden>👤</span>
                  <span>
                    Hesabım
                    <br />
                    <small style={{ fontWeight: 500, opacity: 0.85 }}>
                      {user.firstName}
                    </small>
                  </span>
                </Link>
                <Link href="/orders" className="header-link header-hide-sm">
                  Siparişler
                </Link>
                <button
                  type="button"
                  className="header-link header-hide-sm"
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    logout();
                    qc.removeQueries({ queryKey: ["cart"] });
                    router.push("/");
                  }}
                >
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="header-link">
                  Giriş yap
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary"
                  style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
                >
                  Üye ol
                </Link>
              </>
            )}
            <Link
              href="/cart"
              className="header-link"
              style={{ fontWeight: 800 }}
            >
              <span aria-hidden>🛒</span> Sepet
              {n > 0 ? (
                <span className="cart-badge">{n > 99 ? "99+" : n}</span>
              ) : null}
            </Link>
          </div>
        </div>

        <div className="category-strip-wrap">
          <div className="container">
            <nav className="category-strip" aria-label="Kategoriler">
              <Link href="/shop" className="category-chip category-chip--all">
                Tümü
              </Link>
              {(categories.data || []).map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?categoryId=${c.id}`}
                  className="category-chip"
                >
                  {c.categoryName}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3>Kurumsal</h3>
            <Link href="/shop">Hakkımızda</Link>
            <Link href="/shop">Kariyer</Link>
            <Link href="/shop">İletişim</Link>
          </div>
          <div>
            <h3>Yardım</h3>
            <Link href="/account">Sıkça sorulanlar</Link>
            <Link href="/account/addresses">Teslimat</Link>
            <Link href="/account/security">Güvenli alışveriş</Link>
          </div>
          <div>
            <h3>Popüler kategoriler</h3>
            <Link href="/shop?categoryId=1">Elektronik</Link>
            <Link href="/shop?categoryId=2">Moda</Link>
            <Link href="/shop?categoryId=11">Ev &amp; yaşam</Link>
            <Link href="/shop?categoryId=15">Süpermarket</Link>
          </div>
          <div>
            <h3>Uygulama</h3>
            <span style={{ color: "#888", fontSize: "0.8rem" }}>
              Demo vitrin — Next.js App Router ve dahili dummy API.
            </span>
          </div>
        </div>
        <div className="container footer-bottom">
          © {new Date().getFullYear()} KapıdaMart — Tüm hakları saklıdır.
          Markalar örnek amaçlıdır.
        </div>
      </footer>
    </>
  );
}
