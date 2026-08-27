"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "../../lib/api";
import { formatTry } from "../../lib/format";
import { useAuthStore } from "../../store/authStore";

export function FavoritesPage() {
  const user = useAuthStore((s) => s.user)!;
  const q = useQuery({
    queryKey: ["favorites"],
    queryFn: async () => {
      const r = await api.favorites.list(user.token);
      if (!r.success) throw new Error(r.message);
      return r.data || [];
    },
  });

  return (
    <div>
      <h1 className="brand-serif" style={{ fontSize: "1.5rem" }}>
        Favoriler
      </h1>
      {q.isLoading ? <p>Yükleniyor…</p> : null}
      <div className="grid-products">
        {(q.data || []).map((f) => (
          <div key={f.id} className="card" style={{ padding: "1rem" }}>
            <Link
              href={`/product/${f.productId}`}
              style={{ fontWeight: 600, color: "inherit" }}
            >
              {f.productName}
            </Link>
            <div style={{ marginTop: 8 }}>
              {formatTry(Number(f.productPrice))}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              {f.productCategory}
            </div>
          </div>
        ))}
      </div>
      {q.data && q.data.length === 0 ? <p>Henüz favori yok.</p> : null}
    </div>
  );
}
