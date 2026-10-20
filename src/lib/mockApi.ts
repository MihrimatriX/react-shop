import { handle } from "../server/handle";
import { dump, load } from "../server/store";

// GitHub Pages: backend yok. Sahte API (src/server/handle.ts) tarayıcıda çalışır,
// durum localStorage'da JSON olarak tutulur. Sıfırlamak için bu anahtarı silin.
const KEY = "kapidamart-db";

let restored = false;

export async function mockFetch(path: string, init: RequestInit): Promise<Response> {
  if (!restored) {
    restored = true;
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) load(saved);
    } catch {
      // Bozuk/erişilemeyen kayıt: seed verisiyle devam.
    }
  }
  const url = new URL(path, "http://mock");
  const res = await handle(new Request(url, init), url.pathname.split("/").slice(2));
  if (init.method && init.method !== "GET") {
    try {
      localStorage.setItem(KEY, dump());
    } catch {
      // Gizli sekme / kota: bu oturumda bellekte çalışmaya devam eder.
    }
  }
  return res;
}
