"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api, unwrap } from "../lib/api";
import { formatDate, formatTry, orderStatus } from "../lib/format";
import { useAuthStore } from "../store/authStore";

export function StatusBadge({ status }: { status: string }) {
  const s = orderStatus(status);
  return <span className={`status status--${s.tone}`}>{s.label}</span>;
}

export function OrdersPage() {
  const token = useAuthStore((s) => s.user!.token);
  const q = useQuery({
    queryKey: ["orders"],
    queryFn: () => api.orders.list(token).then(unwrap),
  });

  return (
    <div className="container page narrow">
      <h1 className="page-title">Siparişlerim</h1>
      {q.isLoading ? <p className="muted">Yükleniyor…</p> : null}
      {q.isError ? <p className="error">{q.error.message}</p> : null}
      {q.data?.length === 0 ? (
        <p className="muted">
          Henüz sipariş yok. <Link href="/shop">Alışverişe başla</Link>
        </p>
      ) : null}
      <ul className="list-plain">
        {q.data?.map((o) => (
          <li key={o.id}>
            <Link href={`/orders/${o.id}`} className="card panel order-row">
              <span>
                <strong>{o.orderNumber}</strong>
                <span className="muted small block">
                  {formatDate(o.createdAt)} · {o.items.length} kalem
                </span>
              </span>
              <StatusBadge status={o.status} />
              <strong>{formatTry(o.totalAmount)}</strong>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
