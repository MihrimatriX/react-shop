export const SITE_NAME = "KapıdaMart";
export const SITE_TAGLINE = "Online Alışveriş";
export const SITE_DESCRIPTION =
  "KapıdaMart — binlerce ürün, kampanyalı fiyatlar, güvenli alışveriş. Elektronik, moda, ev & yaşam ve daha fazlası.";
export const SITE_LOCALE = "tr_TR";
export const SITE_PHONE = "+90-850-000-00-00";

export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
