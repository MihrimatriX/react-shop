const tryFormat = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });
const dateFormat = new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium", timeStyle: "short" });

export const formatTry = (n: number) => tryFormat.format(n);

export const formatDate = (iso?: string | null) => (iso ? dateFormat.format(new Date(iso)) : "—");

export function stars(rating: number) {
  const n = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export type StatusTone = "ok" | "warn" | "danger" | "muted";

/**
 * Sunucudaki sipariş durumunu (pending, processing, shipped, delivered,
 * cancelled, returnRequested) kullanıcıya gösterilecek etiket ve renk tonuna çevirir.
 * Ton, CSS'teki `.status--<tone>` sınıfına karşılık gelir.
 */
export function orderStatus(status: string): { label: string; tone: StatusTone } {
  // TODO(human)
  return { label: status, tone: "muted" };
}
