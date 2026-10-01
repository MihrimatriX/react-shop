import type { Campaign, Category, Product, Review } from "../types/api";

export const CATEGORIES: Category[] = [
  { id: 1, categoryName: "Elektronik", description: "TV, ses, şarj ve aksesuar", imageUrl: "https://picsum.photos/seed/cat1/400/280", isActive: true },
  { id: 2, categoryName: "Moda", description: "Giyim ve aksesuar", imageUrl: "https://picsum.photos/seed/cat2/400/280", isActive: true },
  { id: 3, categoryName: "Kitap", description: "Roman, kişisel gelişim, çocuk", imageUrl: "https://picsum.photos/seed/cat3/400/280", isActive: true },
  { id: 4, categoryName: "Oyuncak", description: "Eğitici ve eğlenceli oyuncaklar", imageUrl: "https://picsum.photos/seed/cat4/400/280", isActive: true },
  { id: 5, categoryName: "Bahçe", description: "Bitki, saksı, bahçe aletleri", imageUrl: "https://picsum.photos/seed/cat5/400/280", isActive: true },
  { id: 6, categoryName: "Petshop", description: "Mama, kum, aksesuar", imageUrl: "https://picsum.photos/seed/cat6/400/280", isActive: true },
  { id: 7, categoryName: "Müzik", description: "Enstrüman ve ekipman", imageUrl: "https://picsum.photos/seed/cat7/400/280", isActive: true },
  { id: 8, categoryName: "Ofis", description: "Kırtasiye ve ofis teknolojisi", imageUrl: "https://picsum.photos/seed/cat8/400/280", isActive: true },
  { id: 9, categoryName: "Telefon", description: "Akıllı telefon ve aksesuar", imageUrl: "https://picsum.photos/seed/cat9/400/280", isActive: true },
  { id: 10, categoryName: "Ayakkabı", description: "Spor, klasik, terlik", imageUrl: "https://picsum.photos/seed/cat10/400/280", isActive: true },
  { id: 11, categoryName: "Ev & Yaşam", description: "Mobilya, tekstil, mutfak", imageUrl: "https://picsum.photos/seed/cat11/400/280", isActive: true },
  { id: 12, categoryName: "Spor", description: "Fitness, outdoor, takım sporları", imageUrl: "https://picsum.photos/seed/cat12/400/280", isActive: true },
  { id: 13, categoryName: "Anne & Bebek", description: "Bebek bakımı ve giyim", imageUrl: "https://picsum.photos/seed/cat13/400/280", isActive: true },
  { id: 14, categoryName: "Kozmetik", description: "Cilt bakımı, makyaj, parfüm", imageUrl: "https://picsum.photos/seed/cat14/400/280", isActive: true },
  { id: 15, categoryName: "Süpermarket", description: "Gıda, içecek, temizlik", imageUrl: "https://picsum.photos/seed/cat15/400/280", isActive: true },
  { id: 16, categoryName: "Yapı Market", description: "El aleti, boya, hırdavat", imageUrl: "https://picsum.photos/seed/cat16/400/280", isActive: true },
  { id: 17, categoryName: "Oto", description: "Araç bakım ve aksesuar", imageUrl: "https://picsum.photos/seed/cat17/400/280", isActive: true },
];

const CATALOG: { brands: string[]; items: string[]; qty: string[]; min: number; max: number }[] = [
  { brands: ["Philips", "Sony", "JBL", "Anker", "Xiaomi", "Samsung"], items: ["4K Smart TV 55\"", "Soundbar 3.1", "Bluetooth Hoparlör", "Powerbank 20000mAh", "USB-C Şarj Aleti 65W", "Webcam Full HD", "HDMI Kablo 2m", "Kablosuz Mouse"], qty: ["1 adet"], min: 249, max: 28999 },
  { brands: ["Mavi", "LC Waikiki", "Defacto", "Koton", "H&M", "Pull&Bear"], items: ["Slim Fit Jean", "Basic Tişört 3'lü", "Oversize Sweatshirt", "Pamuklu Gömlek", "Yazlık Elbise", "Trençkot", "Polo Yaka Tişört", "Eşofman Takımı"], qty: ["1 adet"], min: 149, max: 2499 },
  { brands: ["Can Yayınları", "İş Bankası", "Doğan Kitap", "Yapı Kredi", "Everest"], items: ["Kırmızı Pazartesi", "Simyacı", "Suç ve Ceza", "1984", "Şeker Portakalı", "İçimizdeki Şeytan", "Tutunamayanlar", "Kürk Mantolu Madonna"], qty: ["1 kitap"], min: 69, max: 389 },
  { brands: ["LEGO", "Playmobil", "Fisher-Price", "Hasbro", "Ravensburger"], items: ["Şehir Seti 754 parça", "Ahşap Blok 100'lü", "Puzzle 1000 parça", "Uzaktan Kumandalı Araba", "Bebek Beşiği Seti", "STEM Robot Kit", "Peluş Ayı 45cm", "Kart Oyunu"], qty: ["1 kutu"], min: 89, max: 3499 },
  { brands: ["Gardena", "Fiskars", "IKEA", "Bosch", "Aloé"], items: ["Bahçe Makası", "Saksı Seti 3'lü", "Sulama Hortumu 20m", "Çim Biçme Makinesi", "Orkide Toprağı 10L", "Bahçe Eldiveni", "Solar Bahçe Lambası", "Kompost Kovası"], qty: ["1 adet"], min: 79, max: 7999 },
  { brands: ["Royal Canin", "Pro Plan", "Whiskas", "Pedigree", "Felix"], items: ["Kuru Mama 3kg", "Yaş Mama 12'li", "Kedi Kumu 10L", "Köpek Tasması", "Tırmalama Tahtası", "Otomatik Mama Kabı", "Oyuncak Top Seti", "Tüy Toplama Rulosu"], qty: ["1 paket"], min: 49, max: 1299 },
  { brands: ["Yamaha", "Fender", "Casio", "Roland", "Ibanez"], items: ["Akustik Gitar", "Dijital Piyano 88 Tuş", "Ukulele Seti", "Elektronik Davul", "Mikrofon USB", "Gitar Teli Seti", "Metronom", "Amfi 20W"], qty: ["1 adet"], min: 199, max: 18999 },
  { brands: ["HP", "Canon", "Faber-Castell", "Stabilo", "Epson"], items: ["Lazer Yazıcı", "A4 Kağıt 500'lü", "Mürekkep Kartuşu", "Masaüstü Düzenleyici", "Ergonomik Ofis Koltuğu", "Laminasyon Makinesi", "Zımba Seti", "Notebook 80yp"], qty: ["1 adet"], min: 29, max: 8999 },
  { brands: ["Apple", "Samsung", "Xiaomi", "Oppo", "Huawei", "Realme"], items: ["Akıllı Telefon 128GB", "Kılıf Şeffaf", "Ekran Koruyucu 2'li", "Kablosuz Kulaklık", "Hızlı Şarj Adaptörü", "Akıllı Saat", "Selfie Çubuğu", "Araç Telefon Tutucu"], qty: ["1 adet"], min: 79, max: 54999 },
  { brands: ["Nike", "Adidas", "Puma", "Skechers", "New Balance", "Kinetix"], items: ["Koşu Ayakkabısı", "Günlük Sneaker", "Klasik Deri Ayakkabı", "Terlik Eva", "Bot Su Geçirmez", "Halı Saha Kramponu", "Çocuk Spor Ayakkabı", "Sandalet"], qty: ["1 çift"], min: 299, max: 4999 },
  { brands: ["IKEA", "English Home", "Karaca", "Madame Coco", "Taç", "Bellona"], items: ["Çift Kişilik Nevresim", "Yemek Takımı 24 Parça", "Tencere Seti 7'li", "Çalışma Masası", "LED Masa Lambası", "Halı 160x230", "Banyo Seti", "Katlanır Sandalye"], qty: ["1 adet"], min: 129, max: 12999 },
  { brands: ["Nike", "Adidas", "Decathlon", "Under Armour", "Puma"], items: ["Yoga Matı 8mm", "Dambıl 5kg Çift", "Koşu Bandı Katlanır", "Futbol Topu", "Termos 1L", "Spor Çantası", "Direnç Bandı Seti", "Bisiklet Kaskı"], qty: ["1 adet"], min: 99, max: 15999 },
  { brands: ["Pampers", "Prima", "Johnson's", "Chicco", "Mothercare"], items: ["Bebek Bezi 4 Beden 50'li", "Islak Mendil 3'lü", "Biberon 250ml", "Bebek Şampuanı", "Emzirme Yastığı", "Bebek Arabası", "Oyun Halısı", "Emzik 2'li"], qty: ["1 paket"], min: 59, max: 8999 },
  { brands: ["L'Oréal", "Nivea", "The Ordinary", "Maybelline", "Garnier", "Bioderma"], items: ["Nemlendirici Krem 50ml", "Güneş Kremi SPF50", "Rimel Siyah", "Yüz Temizleme Jeli", "Saç Bakım Yağı", "Parfüm 50ml", "Dudak Balmı", "Cilt Serumu"], qty: ["1 adet"], min: 49, max: 2499 },
  { brands: ["Ülker", "Pınar", "Sütaş", "Eti", "Torku", "Migros"], items: ["Zeytinyağı 1L", "Filtre Kahve 250g", "Makarna 5'li Paket", "Süt 1L 6'lı", "Çikolata 80g", "Tuvalet Kağıdı 32'li", "Bulaşık Deterjanı", "Pirinç 2.5kg"], qty: ["1 paket"], min: 19, max: 349 },
  { brands: ["Bosch", "Makita", "Dewalt", "Stanley", "Dremel"], items: ["Akülü Matkap 18V", "Tornavida Seti 32'li", "Boya Rulosu Seti", "Su Terazisi 60cm", "İş Eldiveni", "Kablo 3x1.5 10m", "LED Ampul 9W 4'lü", "Silikon Tabancası"], qty: ["1 adet"], min: 39, max: 7999 },
  { brands: ["Michelin", "Castrol", "Bosch", "Mobil", "Shell"], items: ["Motor Yağı 5W-30 4L", "Silecek Takımı", "Lastik Tamir Kiti", "Araç Şampuanı", "Telefon Tutucu Mıknatıslı", "Jump Starter", "Koltuk Kılıfı", "Bagaj Organizer"], qty: ["1 adet"], min: 89, max: 3499 },
];

function rnd(seed: number): number {
  const t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  return ((t ^ (t + Math.imul(t ^ (t >>> 7), t | 61))) >>> 0) / 4294967296;
}

function money(seed: number, min: number, max: number): number {
  const n = min + rnd(seed) * (max - min);
  return Math.round(n * 100) / 100;
}

const REVIEW_TEXTS = [
  { title: "Beklediğim gibi", comment: "Kargo hızlı geldi, ürün açıklamayla uyumlu." },
  { title: "Fiyat/performans", comment: "Bu fiyata gayet yeterli, tavsiye ederim." },
  { title: "Çok memnunum", comment: "İkinci kez alıyorum, kalite aynı." },
  { title: "İdare eder", comment: "İşini görüyor ama ambalaj biraz özensizdi." },
  { title: "Harika", comment: "Hediye olarak aldım, çok beğenildi." },
  { title: "Eksiksiz", comment: "Faturası ve kargosu sorunsuz." },
];
const REVIEW_NAMES = ["Ayşe K.", "Mehmet T.", "Elif Y.", "Can D.", "Zeynep A.", "Burak S.", "Deniz M.", "Selin R."];

export function reviewsForProduct(productId: number): Review[] {
  const n = 2 + Math.floor(rnd(productId * 17) * 8);
  const out: Review[] = [];
  for (let i = 0; i < n; i++) {
    const seed = productId * 100 + i;
    const t = REVIEW_TEXTS[Math.floor(rnd(seed) * REVIEW_TEXTS.length)];
    out.push({
      id: productId * 100 + i + 1,
      productId,
      rating: 3 + Math.floor(rnd(seed + 1) * 3),
      title: t.title,
      comment: t.comment,
      userName: REVIEW_NAMES[Math.floor(rnd(seed + 2) * REVIEW_NAMES.length)],
      createdAt: new Date(Date.now() - Math.floor(rnd(seed + 3) * 60) * 86400000).toISOString(),
    });
  }
  return out;
}

export function averageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  return Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10;
}

function buildProducts(): Product[] {
  const out: Product[] = [];
  let id = 1;
  for (const cat of CATEGORIES) {
    const def = CATALOG[cat.id - 1];
    for (let i = 0; i < 24; i++) {
      const brand = def.brands[i % def.brands.length];
      const item = def.items[i % def.items.length];
      const variant = i >= def.items.length ? ` ${["Siyah", "Beyaz", "Lacivert", "Gri", "Kırmızı", "Lacivert-2"][i % 6]}` : "";
      const seed = id * 9973 + cat.id * 13;
      const discountRoll = rnd(seed + 3);
      const discount =
        discountRoll > 0.72 ? Math.round(5 + rnd(seed + 4) * 40) : 0;
      const stockRoll = rnd(seed + 5);
      const unitPrice = money(seed, def.min, def.max);
      const reviews = reviewsForProduct(id);
      out.push({
        id,
        productName: `${brand} ${item}${variant}`,
        unitPrice,
        price: Math.round(unitPrice * (100 - discount)) / 100,
        rating: averageRating(reviews),
        reviewCount: reviews.length,
        unitInStock: stockRoll > 0.92 ? 0 : Math.floor(4 + rnd(seed + 6) * 180),
        quantityPerUnit: def.qty[0],
        categoryId: cat.id,
        categoryName: cat.categoryName,
        description: `${brand} ${item} — KapıdaMart seçkisi. Hızlı kargo, 14 gün iade. ${cat.description}.`,
        imageUrl: `https://picsum.photos/seed/p${id}/600/600`,
        discount,
        isActive: true,
      });
      id += 1;
    }
  }
  return out;
}

export const PRODUCTS: Product[] = buildProducts();

export const CAMPAIGNS: Campaign[] = [
  { id: 1, title: "Elektronikte süper fiyat", subtitle: "Seçili TV ve ses sistemlerinde", discount: 25, imageUrl: "https://picsum.photos/seed/camp1/800/400", buttonText: "İncele", buttonHref: "/shop?categoryId=1", isActive: true, timeLeft: "2 gün" },
  { id: 2, title: "Moda haftası", subtitle: "Giyimde %40'a varan indirim", discount: 40, imageUrl: "https://picsum.photos/seed/camp2/800/400", buttonText: "Alışverişe başla", buttonHref: "/shop?categoryId=2", isActive: true },
  { id: 3, title: "Ev & yaşam", subtitle: "Mutfak ve tekstilde fırsat", discount: 20, imageUrl: "https://picsum.photos/seed/camp3/800/400", buttonText: "Keşfet", buttonHref: "/shop?categoryId=11", isActive: true },
  { id: 4, title: "Kozmetik fest", subtitle: "Cilt bakımında 3 al 2 öde", discount: 30, imageUrl: "https://picsum.photos/seed/camp4/800/400", buttonText: "Ürünleri gör", buttonHref: "/shop?categoryId=14", isActive: true },
  { id: 5, title: "Süpermarket sepeti", subtitle: "250 ₺ üzeri kargo bedava", discount: 15, imageUrl: "https://picsum.photos/seed/camp5/800/400", buttonText: "Doldur", buttonHref: "/shop?categoryId=15", isActive: true },
  { id: 6, title: "Spor & outdoor", subtitle: "Fitness ekipmanlarında indirim", discount: 18, imageUrl: "https://picsum.photos/seed/camp6/800/400", buttonText: "İncele", buttonHref: "/shop?categoryId=12", isActive: true },
  { id: 7, title: "Telefon günleri", subtitle: "Akıllı saat ve kulaklık hediye fırsatı", discount: 12, imageUrl: "https://picsum.photos/seed/camp7/800/400", buttonText: "Telefonlar", buttonHref: "/shop?categoryId=9", isActive: true },
  { id: 8, title: "Anne & bebek", subtitle: "Bebek bezinde koli fiyatı", discount: 22, imageUrl: "https://picsum.photos/seed/camp8/800/400", buttonText: "Alışveriş", buttonHref: "/shop?categoryId=13", isActive: true },
];

export type ProductQuery = {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
  categoryId?: number;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
};

export function filterProducts(all: Product[], q: ProductQuery): Product[] {
  let rows = all.filter((p) => p.isActive !== false);
  if (q.categoryId) rows = rows.filter((p) => p.categoryId === q.categoryId);
  if (q.searchTerm) {
    const s = q.searchTerm.toLowerCase();
    rows = rows.filter(
      (p) =>
        p.productName.toLowerCase().includes(s) ||
        (p.description || "").toLowerCase().includes(s) ||
        (p.categoryName || "").toLowerCase().includes(s),
    );
  }
  // Kullanıcı ekranda indirimli fiyatı görür; filtre ve sıralama da onu kullanır.
  if (q.minPrice != null) rows = rows.filter((p) => p.price >= q.minPrice!);
  if (q.maxPrice != null) rows = rows.filter((p) => p.price <= q.maxPrice!);
  const dir = q.sortOrder === "desc" ? -1 : 1;
  const key = (p: Product): string | number =>
    q.sortBy === "productName" ? p.productName
    : q.sortBy === "price" ? p.price
    : q.sortBy === "discount" ? (p.discount ?? 0)
    : p.id;
  return rows.sort((a, b) => {
    const av = key(a);
    const bv = key(b);
    const c = typeof av === "string" ? av.localeCompare(String(bv), "tr") : av - Number(bv);
    return c * dir;
  });
}

export function paginate<T>(rows: T[], pageNumber: number, pageSize: number) {
  const totalElements = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const page = Math.min(Math.max(1, pageNumber), totalPages);
  const start = (page - 1) * pageSize;
  const content = rows.slice(start, start + pageSize);
  return {
    content,
    totalElements,
    totalPages,
    number: page - 1,
    size: pageSize,
    first: page === 1,
    last: page >= totalPages,
  };
}
