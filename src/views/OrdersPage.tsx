"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "../lib/api";
import { userVisibleError } from "../lib/apiError";
import { formatTry } from "../lib/format";
import { useAuthStore } from "../store/authStore";

function statusColor(status: string): string {
  const s = (status || "").toLowerCase();
  if (s.includes("cancel")) return "var(--danger)";
  if (s === "delivered") return "var(--ok, #15803d)";
  if (s === "shipped" || s === "processing" || s === "pending")
    return "var(--accent, #b45309)";
  if (s === "returnrequested" || s.includes("return"))
    return "var(--warning, #a16207)";
  return "var(--muted)";
}

export function OrdersPage() {
  const user = useAuthStore((s) => s.user)!;
  const q = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const r = await api.orders.list(user.token);
      if (!r.success) throw new Error(userVisibleError(r));
      return r.data || [];
    },
  });

  return (
    <div className="container" style={{ paddingBlock: "2rem 3rem" }}>
      <h1 className="brand-serif" style={{ fontSize: "1.75rem" }}>
        Siparişlerim
      </h1>
      {q.isLoading ? <p>Yükleniyor…</p> : null}
      {q.isError ? (
        <p style={{ color: "var(--danger)" }}>{(q.error as Error).message}</p>
      ) : null}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {(q.data || []).map((o) => (
          <li
            key={o.id}
            className="card"
            style={{ padding: "1rem", marginBottom: "0.75rem" }}
          >
            <Link
              href={`/orders/${o.id}`}
              style={{ fontWeight: 600, color: "inherit" }}
            >
              {o.orderNumber}
            </Link>
            <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              <span style={{ color: statusColor(o.status), fontWeight: 600 }}>
                {o.status}
              </span>
              {" · "}
              {o.createdAt?.replace("T", " ").slice(0, 16)}
            </div>
            <div style={{ marginTop: 4 }}>
              {formatTry(Number(o.totalAmount))}
            </div>
          </li>
        ))}
      </ul>
      {q.data && q.data.length === 0 ? <p>Henüz sipariş yok.</p> : null}
    </div>
  );
}
