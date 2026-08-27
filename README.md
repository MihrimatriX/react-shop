# KapıdaMart — React vitrin

Bu depo, **Spring Boot 3 (Java) REST API** arka ucuna bağlanan demo bir **pazaryeri vitrinidir** (arka uç bu depoda değildir; ayrı çalıştırmanız gerekir). Kimlik doğrulama (JWT), sepet, sipariş, ödeme ve hesap uçları sunucu tarafında Spring ile sağlanır; ön yüz bu API’ye `/api` üzerinden (geliştirmede Vite proxy ile) erişir. Ürün listeleme, arama, kategori, kampanya alanları, giriş/kayıt, ödeme akışı ve hesap sayfalarını içerir. Üretim kalitesinde bir mağaza değil; REST API’yi uçtan uca denemek ve modern bir React örneği görmek içindir.

**Backend:** Spring Boot uygulamasını ayrı depo veya kurulumunuzdan çalıştırın; API taban adresini aşağıdaki ortam değişkenleriyle bu vitrine bağlayın.

### GitHub için kısa metin (tek cümle)

> **KapıdaMart vitrin:** React 19 + TypeScript + Vite ile yazılmış e‑ticaret ön yüzü; Spring Boot REST API (JWT, vb.) ayrı sunucuda çalışır.

**Önerilen repository topics (anahtar kelimeler):** `react`, `typescript`, `vite`, `ecommerce`, `rest-api`, `jwt`, `spring-boot` (ilgili backend deposu için), `tanstack-query`, `zustand`

## Marka ve arayüz

| | |
|---|---|
| **İsim** | KapıdaMart (demo) |
| **Görünüm** | Trendyol / Hepsiburada tarzı turuncu vurgu (`#f27a1a`), DM Sans, geniş grid |
| **Slogan** | *Uygun fiyat · Hızlı teslimat* |

## Teknoloji yığını

**Ön yüz (bu depo)**

- **React 19** + **TypeScript**
- **Vite 8** (geliştirme sunucusu ve derleme)
- **React Router 7** (sayfa yönlendirme)
- **TanStack Query (React Query)** (sunucu durumu ve önbellek)
- **Zustand** (istemci tarafı durum: örneğin kimlik ve sepet senkronu)

**Arka uç (ayrı proje)**

- **Spring Boot 3** · **Spring Security (JWT)** · **Spring Data JPA** · REST API — kurulum ve uç listesi için backend projenizin dokümantasyonuna bakın.

Kaynak kod `src/` altında; API çağrıları `src/lib/api.ts` üzerinden gider ve her istekte **`X-Correlation-ID`** üretilir (backend loglarıyla eşleştirmek için).

## Ne yapabilirsiniz? (Özellikler)

- **Ana sayfa** (`/`): Öne çıkan / indirimli ürünler, kampanya ve kategori girişleri.
- **Mağaza** (`/shop`): Sayfalı ürün listesi, arama ve filtre parametreleri API ile uyumlu.
- **Ürün detay** (`/product/:id`): Açıklama, yorum özeti; sepete ekleme **giriş yapmış** kullanıcı için sunucu sepetine gider.
- **Sepet** (`/cart`): Oturum açıkken `/api/cart` ile senkron; misafir kullanıcıya giriş yönlendirmesi.
- **Ödeme** (`/checkout`): Korumalı rota; sipariş oluştururken **`Idempotency-Key`** kullanılır (çift tıklama / yeniden denemede tekrar sipariş oluşmaması için).
- **Siparişler** (`/orders`, `/orders/:id`): Geçmiş siparişler ve detay.
- **Hesap** (`/account/...`): Özet, adresler, ödeme yöntemleri, favoriler, ayarlar, bildirimler, güvenlik — ilgili API uçlarına bağlı.

Korumalı sayfalar `ProtectedRoute` ile sarılır; JWT yoksa giriş sayfasına yönlendirilirsiniz.

## Ön koşullar

- **Node.js** (LTS önerilir).
- Ayakta ve bu vitrinin beklediği sözleşmeyle uyumlu **Spring Boot API** (varsayılan proxy hedefi `.env.development` / `vite.config.ts` ile uyumlu olmalı; tipik olarak `http://127.0.0.1:8082` veya kendi portunuz).

## Hızlı başlangıç

### 1. Bağımlılıklar

```bash
npm install
```

### 2. API’nin ayakta olduğundan emin olun

Spring uygulamasını kendi projenizden (`mvn`, IDE, Docker vb.) başlatın. Vite’ın proxy hedefi, API’nin dinlediği adresle aynı olmalıdır (bkz. ortam değişkenleri). Konsolda `[vite] /api proxy → ...` satırı ile doğrulayın.

### 3. Geliştirme sunucusu

```bash
npm run dev
```

Tarayıcıda **http://localhost:5173** açın.

## Ortam değişkenleri

Geliştirmede istekler göreli yol **`/api/...`** ile gider; Vite bunları geliştirme sunucusunda backend’e **proxy** eder. Hedef adres dosyadan okunur (Windows’ta global `VITE_*` değişkenlerinin `.env` dosyasını ezmesi engellenmiştir).

| Dosya / anahtar | Açıklama |
|-----------------|----------|
| `.env.development` | `DEV_API_PROXY_TARGET` — yerel API tabanı (ör. `http://127.0.0.1:8082`). |
| `.env.development.local` | Yerel makinede üzerine yazma; Git’e genelde eklenmez. Docker veya farklı port kullanıyorsanız burada hedefi güncelleyin. |
| `VITE_DEV_API_PROXY` | Eski uyumluluk; mümkünse `DEV_API_PROXY_TARGET` kullanın. |
| `VITE_API_URL` | **Üretim veya doğrudan tam taban URL** (ör. `https://api.siteniz.com`). Boş bırakılırsa geliştirmede yol `/api` olarak kalır ve proxy devreye girer. |

Üretim derlemesinde API farklı bir origin’deyse `VITE_API_URL` ayarlayın ve backend **CORS** ayarında bu ön yüz origin’ini tanımlayın.

`.env.example` dosyasını kopyalayıp `.env.development` veya `.env.development.local` olarak düzenleyebilirsiniz.

## NPM komutları

| Komut | Ne işe yarar |
|-------|----------------|
| `npm run dev` | Vite geliştirme sunucusu (HMR, proxy). |
| `npm run build` | `tsc` + üretim bundle’ı `dist/`. |
| `npm run preview` | `dist/` önizlemesi (yerel test). |
| `npm run lint` | ESLint. |

## Klasör yapısı (özet)

```text
src/
  App.tsx              # Rota tanımları
  main.tsx             # Giriş noktası
  components/          # Layout, kartlar, korumalı rota
  pages/               # Ana, mağaza, ürün, sepet, ödeme, giriş, siparişler
  pages/account/       # Hesap alt sayfaları
  lib/                 # api.ts, format, hata yardımcıları
  store/               # authStore, cartStore (Zustand)
  types/               # API DTO tipleri
```

## Backend ile uyum (kısa)

- **JWT**: Giriş sonrası token istek başlığında gönderilir; backend `userId` ve e‑posta ile sipariş, adres, ödeme uçlarını kullanıcıya bağlar.
- **Sepet**: Oturumlu kullanıcıda sepet **veritabanında** tutulur; vitrin girişten sonra API ile uyumlu kalır. Sipariş tamamlanınca backend sepeti temizleyebilir.
- **Hata ayıklama**: API yanıtlarında `traceId` / mesaj alanları varsa arayüz bunları kullanıcıya gösterebilir; korelasyon için `X-Correlation-ID` her istekte gider.

## Sorun giderme

| Belirti | Olası neden | Ne yapmalı |
|---------|-------------|------------|
| `ECONNREFUSED` veya “API’ye ulaşılamadı” | Proxy hedefinde API yok veya yanlış port | Konsoldaki `[vite] /api proxy → ...` ile backend adresini eşleştirin; `.env.development` / `.env.development.local` güncelleyip Vite’ı yeniden başlatın. |
| Giriş yokken sepet boş / eklenmiyor | Tasarım gereği | Sepet sunucuda; önce kayıt veya giriş yapın. |

## Üretim

```bash
npm run build
npm run preview
```

Çıktı statik dosyalardır (`dist/`); nginx, CDN veya herhangi bir statik host ile sunulabilir. API için `VITE_API_URL` veya ters proxy (`/api` → backend) kullanın.
