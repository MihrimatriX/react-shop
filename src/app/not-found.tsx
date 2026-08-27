import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Sayfa bulunamadı",
  description: "Aradığınız sayfa yok veya taşınmış olabilir.",
  path: "/",
  index: false,
});

export default function NotFound() {
  return (
    <div className="container" style={{ paddingBlock: "3rem", textAlign: "center" }}>
      <h1 className="brand-display">Sayfa bulunamadı</h1>
      <p style={{ color: "var(--muted)" }}>Aradığınız adres yok.</p>
      <Link href="/" className="btn btn-primary">
        Anasayfa
      </Link>
    </div>
  );
}
