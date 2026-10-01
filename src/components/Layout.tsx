"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { useCart } from "../store/cartStore";
import type { Category } from "../types/api";

export function Layout({ categories, children }: { categories: Category[]; children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const n = useCart().data?.totalItems ?? 0;

  function onSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") || "").trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  function onLogout() {
    if (user) void api.auth.logout(user.token);
    logout();
    router.push("/");
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <div className="container top-bar-inner">
          <div className="top-bar-links">
            <Link href="/#kampanyalar">Kampanyalar</Link>
            <Link href="/shop?sortBy=discount&sortOrder=desc">Flaş indirimler</Link>
          </div>
          <span>Müşteri hizmetleri: 0850 000 00 00</span>
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

          <form className="search-form" role="search" onSubmit={onSearch}>
            <input
              name="q"
              type="search"
              placeholder="Ürün, kategori veya marka ara"
              aria-label="Ürün ara"
              autoComplete="off"
            />
            <button type="submit">Ara</button>
          </form>

          <div className="header-actions">
            {user ? (
              <>
                <Link href="/account" className="header-link">
                  <span aria-hidden>👤</span>
                  <span>
                    Hesabım
                    <small className="header-link__sub">{user.firstName}</small>
                  </span>
                </Link>
                <Link href="/orders" className="header-link header-hide-sm">
                  Siparişler
                </Link>
                <button type="button" className="header-link header-hide-sm" onClick={onLogout}>
                  Çıkış
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="header-link">
                  Giriş yap
                </Link>
                <Link href="/register" className="btn btn-primary btn-sm">
                  Üye ol
                </Link>
              </>
            )}
            <Link href="/cart" className="header-link header-link--cart">
              <span aria-hidden>🛒</span> Sepet
              {n > 0 ? <span className="cart-badge">{n > 99 ? "99+" : n}</span> : null}
            </Link>
          </div>
        </div>

        <nav className="container category-strip" aria-label="Kategoriler">
          <Link href="/shop" className="category-chip category-chip--all">
            Tümü
          </Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/shop?categoryId=${c.id}`} className="category-chip">
              {c.categoryName}
            </Link>
          ))}
        </nav>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <h3>Popüler kategoriler</h3>
            {categories.slice(0, 5).map((c) => (
              <Link key={c.id} href={`/shop?categoryId=${c.id}`}>
                {c.categoryName}
              </Link>
            ))}
          </div>
          <div>
            <h3>Hesabım</h3>
            <Link href="/orders">Siparişlerim</Link>
            <Link href="/account/favorites">Favorilerim</Link>
            <Link href="/account/addresses">Adreslerim</Link>
            <Link href="/cart">Sepetim</Link>
          </div>
          <div>
            <h3>Hakkında</h3>
            <p>
              Demo vitrin — Next.js App Router ve aynı uygulamada çalışan bellek içi API. Markalar örnek amaçlıdır.
            </p>
          </div>
        </div>
        <div className="container footer-bottom">© {new Date().getFullYear()} KapıdaMart</div>
      </footer>
    </div>
  );
}
