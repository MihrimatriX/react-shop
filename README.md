# KapıdaMart — demo pazaryeri

Next.js 16 (App Router) ile yazılmış, Trendyol/Hepsiburada tarzı bir e-ticaret vitrini. **Arka uç aynı uygulamanın içinde** çalışır: `src/app/api/[...slug]/route.ts` REST uçlarını sunar, veri `src/server/` altında bellekte tutulur. Ayrı bir sunucu veya veritabanı gerekmez.

> Demo amaçlıdır: veriler süreç belleğindedir ve sunucu yeniden başladığında sıfırlanır.

## Hızlı başlangıç

```bash
npm install
npm run dev
```

http://localhost:3000 — demo hesap: `demo@kapidamart.com` / `demo123`

## Komutlar

| Komut | Ne yapar |
|---|---|
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` / `npm start` | Üretim derlemesi / çalıştırma (`output: "standalone"`) |
| `npm run lint` | ESLint |
| `npm test` | Katalog filtre/sıralama/fiyat kontrolleri (`src/server/catalog.check.ts`) |

Docker: `docker compose up --build` (port 5343, harici `proxy-network` ağı gerekir).

## Yapı

```text
src/
  app/                 # Rotalar, metadata, sitemap/robots/OG görselleri
    api/[...slug]/     # Tüm REST uçları (tek dosya, elle eşleşen yollar)
  server/
    catalog.ts         # 17 kategori × 24 = 408 deterministik ürün, kampanyalar, yorumlar
    store.ts           # Kullanıcı, oturum, sepet, sipariş, adres... (bellek içi)
    respond.ts         # { success, data } / { success:false, code, message } yanıtları
  views/               # Sayfa bileşenleri
  components/          # Layout, ProductCard, ProtectedRoute, Providers
  lib/                 # api istemcisi, format, SEO yardımcıları
  store/               # Zustand oturum deposu, sepet sorgu kancası
```

## Önemli davranışlar

- **Oturum:** Girişte opak bir token üretilir (JWT değil), `localStorage`'da saklanır ve `Authorization: Bearer` ile gönderilir. Sunucu 401 dönerse istemci oturumu kapatır.
- **Fiyat:** İndirimli satış fiyatı (`price`) ürün üretilirken bir kez hesaplanır; sepet, sipariş, filtre ve SEO hepsi bu alanı kullanır.
- **Sipariş:** İstemcinin gönderdiği listeden değil, sunucudaki sepetten oluşturulur. `Idempotency-Key` başlığı aynı siparişin tekrar oluşmasını engeller. İptal edilen siparişin stoğu geri döner.
- **SEO:** Ana sayfa ve ürün sayfaları sunucuda veriyle render edilir; ürün sayfaları build sırasında statik üretilir, stok istemcide canlı veriyle tazelenir.

## Ortam değişkenleri

| Anahtar | Açıklama |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Kanonik adres (OG, sitemap, robots). Sonda `/` olmasın. |
| `NEXT_PUBLIC_API_URL` | API başka bir origin'deyse taban adresi; boşsa aynı uygulamadaki `/api` kullanılır. |
