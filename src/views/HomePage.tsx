import Link from "next/link";
import { ProductCard } from "../components/ProductCard";
import { db } from "../server/store";

const HERO = [
  {
    title: "Elektronikte süper fiyatlar",
    sub: "TV, ses sistemi ve aksesuarlarda seçili ürünlerde ekstra indirim.",
    href: "/shop?categoryId=1",
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
  { emoji: "📱", label: "Telefon", id: 9 },
  { emoji: "📺", label: "Elektronik", id: 1 },
  { emoji: "👟", label: "Ayakkabı", id: 10 },
  { emoji: "🏠", label: "Ev", id: 11 },
  { emoji: "🍼", label: "Anne & bebek", id: 13 },
  { emoji: "🛒", label: "Süpermarket", id: 15 },
  { emoji: "🚗", label: "Oto", id: 17 },
  { emoji: "⚽", label: "Spor", id: 12 },
];

const TRUST = [
  ["🚚", "250 ₺ üzeri kargo bedava*"],
  ["🔒", "256 bit SSL güvenli ödeme"],
  ["↩️", "14 gün içinde kolay iade*"],
  ["⭐", "Onaylı müşteri yorumları"],
];

const FLASH = "/shop?sortBy=discount&sortOrder=desc";

export function HomePage() {
  const campaigns = db.campaigns();

  return (
    <>
      <div className="container">
        <div className="trust-strip">
          {TRUST.map(([icon, label]) => (
            <div key={label} className="trust-item">
              <span className="trust-icon">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="hero-carousel">
          {HERO.map((h) => (
            <Link key={h.title} href={h.href} className="hero-slide">
              <div className="hero-slide__bg" style={{ backgroundImage: `url(${h.bg})` }} />
              <div className="hero-slide__content">
                <h2>{h.title}</h2>
                <p>{h.sub}</p>
                <span className="btn btn-primary">Ürünleri incele</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <section className="container section">
        <div className="section-head">
          <h2 className="section-title">Popüler kategoriler</h2>
          <Link href="/shop" className="section-link">
            Tümünü gör
          </Link>
        </div>
        <div className="h-scroll">
          {QUICK_CATS.map((c) => (
            <Link key={c.id} href={`/shop?categoryId=${c.id}`} className="quick-cat">
              <span className="quick-cat__icon">{c.emoji}</span>
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <section id="kampanyalar" className="container section">
        <div className="section-head">
          <h2 className="section-title">Kampanyalar</h2>
          <Link href={FLASH} className="section-link">
            Tüm fırsatlar
          </Link>
        </div>
        <div className="h-scroll">
          {campaigns.map((c) => (
            <Link key={c.id} href={c.buttonHref ?? "/shop"} className="campaign-card">
              <div className="campaign-card__img" style={{ backgroundImage: `url(${c.imageUrl})` }} />
              <div className="campaign-card__body">
                {c.discount ? <span className="badge">%{c.discount} indirim</span> : null}
                <h3>{c.title}</h3>
                <p>{c.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="section-head">
          <h2 className="section-title">Sizin için seçtiklerimiz</h2>
          <Link href="/shop" className="section-link">
            Daha fazla ürün
          </Link>
        </div>
        <div className="grid-products">
          {db.featured().slice(0, 12).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="container">
        <div className="section section--soft">
          <div className="section-head">
            <h2 className="section-title">🔥 Flaş indirimler</h2>
            <Link href={FLASH} className="section-link">
              Tümünü gör
            </Link>
          </div>
          <div className="grid-products">
            {db.discounted().slice(0, 10).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
        <p className="footnote">* Kampanya ve kargo koşulları demo amaçlıdır.</p>
      </section>
    </>
  );
}
