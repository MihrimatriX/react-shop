"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "../lib/api";
import { ProductCard } from "../components/ProductCard";

const HERO = [
  {
    title: "Elektronikte süper fiyatlar",
    sub: "Telefon, bilgisayar ve aksesuarlarda seçili ürünlerde ekstra indirim.",
    href: "/shop?categoryId=9",
    bg: "https://picsum.photos/seed/heroel/1200/400",
  },
  {
    title: "Ev & yaşam haftası",
    sub: "Mobilya, tekstil ve mutfak ürünlerinde kampanyalı fiyatlar.",
    href: "/shop?categoryId=11",
    bg: "https://picsum.photos/seed/herohome/1200/400",
  },
  {
    title: "Kozmetik ve kişisel bakım",
    sub: "Yüz bakımı, saç ürünleri ve daha fazlası — hızlı kargo.",
    href: "/shop?categoryId=14",
    bg: "https://picsum.photos/seed/herobeauty/1200/400",
  },
];

const QUICK_CATS = [
  { emoji: "📱", label: "Telefon", href: "/shop?q=telefon" },
  { emoji: "💻", label: "Bilgisayar", href: "/shop?q=laptop" },
  { emoji: "👟", label: "Ayakkabı", href: "/shop?categoryId=10" },
  { emoji: "🏠", label: "Ev", href: "/shop?categoryId=11" },
  { emoji: "🍼", label: "Anne & bebek", href: "/shop?categoryId=13" },
  { emoji: "🛒", label: "Süpermarket", href: "/shop?categoryId=15" },
  { emoji: "🚗", label: "Oto", href: "/shop?categoryId=17" },
  { emoji: "⚽", label: "Spor", href: "/shop?categoryId=12" },
];

export function HomePage() {
  const campaigns = useQuery({
    queryKey: ["campaigns", "active"],
    queryFn: async () => {
      const r = await api.campaigns.active();
      if (!r.success) throw new Error(r.message);
      return r.data || [];
    },
  });
  const featured = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const r = await api.products.featured();
      if (!r.success) throw new Error(r.message);
      return r.data || [];
    },
  });
  const discounted = useQuery({
    queryKey: ["products", "discounted"],
    queryFn: async () => {
      const r = await api.products.discounted();
      if (!r.success) throw new Error(r.message);
      return r.data || [];
    },
  });

  return (
    <div>
      <div className="container">
        <div className="trust-strip">
          <div className="trust-item">
            <span className="trust-icon">🚚</span>
            <span>250 ₺ üzeri kargo bedava*</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            <span>256 bit SSL güvenli ödeme</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">↩️</span>
            <span>14 gün içinde kolay iade*</span>
          </div>
          <div className="trust-item">
            <span className="trust-icon">⭐</span>
            <span>Onaylı müşteri yorumları</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="hero-carousel">
          {HERO.map((h) => (
            <Link key={h.title} href={h.href} className="hero-slide">
              <div
                className="hero-slide__bg"
                style={{ backgroundImage: `url(${h.bg})` }}
              />
              <div className="hero-slide__overlay" />
              <div className="hero-slide__content">
                <h2>{h.title}</h2>
                <p>{h.sub}</p>
                <span className="btn btn-primary">Ürünleri incele</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <section className="container section" style={{ paddingTop: "0.5rem" }}>
        <div className="section-head">
          <h2 className="section-title">Popüler kategoriler</h2>
          <Link href="/shop" className="section-link">
            Tümünü gör
          </Link>
        </div>
        <div className="h-scroll" style={{ gap: "0.85rem" }}>
          {QUICK_CATS.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="card"
              style={{
                flex: "0 0 auto",
                width: 96,
                padding: "0.85rem 0.5rem",
                textAlign: "center",
                textDecoration: "none",
                color: "inherit",
                border: "1px solid var(--line)",
              }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: 6 }}>
                {c.emoji}
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {c.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {campaigns.data && campaigns.data.length > 0 ? (
        <section className="container section">
          <div className="section-head">
            <h2 className="section-title">Kampanyalar</h2>
            <Link
              href="/shop?sortBy=discount&sortOrder=desc"
              className="section-link"
            >
              Tüm fırsatlar
            </Link>
          </div>
          <div className="h-scroll">
            {campaigns.data.map((c) => (
              <Link
                key={c.id}
                href={c.buttonHref?.startsWith("/") ? c.buttonHref : "/shop"}
                className="campaign-card"
              >
                <div
                  className="campaign-card__img"
                  style={{ backgroundImage: `url(${c.imageUrl || ""})` }}
                />
                <div className="campaign-card__body">
                  {c.discount != null ? (
                    <span
                      className="badge"
                      style={{ marginBottom: 6, display: "inline-block" }}
                    >
                      %{c.discount} indirim
                    </span>
                  ) : null}
                  <h3>{c.title}</h3>
                  <p>{c.subtitle || c.description?.slice(0, 80)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="container section">
        <div className="section-head">
          <h2 className="section-title">Sizin için seçtiklerimiz</h2>
          <Link href="/shop" className="section-link">
            Daha fazla ürün
          </Link>
        </div>
        <p
          style={{
            color: "var(--ink-muted)",
            fontSize: "0.85rem",
            margin: "-0.5rem 0 1rem",
          }}
        >
          Yüksek puanlı ve indirimli ürünler — öne çıkan raf.
        </p>
        {featured.isLoading ? (
          <div className="grid-products">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="skeleton" style={{ height: 340 }} />
            ))}
          </div>
        ) : (
          <div className="grid-products">
            {(featured.data || []).slice(0, 12).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <section
        className="container section"
        style={{
          background: "var(--market-soft)",
          marginBottom: "2rem",
          paddingBlock: "2rem",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div className="section-head">
          <h2 className="section-title">🔥 Flaş indirimler</h2>
          <Link
            href="/shop?sortBy=discount&sortOrder=desc"
            className="section-link"
          >
            Tümünü gör
          </Link>
        </div>
        {discounted.isLoading ? (
          <div className="grid-products">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton" style={{ height: 320 }} />
            ))}
          </div>
        ) : (
          <div className="grid-products">
            {(discounted.data || []).slice(0, 10).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <p
        className="container"
        style={{
          fontSize: "0.7rem",
          color: "var(--ink-muted)",
          marginBottom: "2rem",
        }}
      >
        * Kampanya ve kargo koşulları satıcı / demo ortamına göre değişebilir.
      </p>
    </div>
  );
}
