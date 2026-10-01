"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api, unwrap } from "../lib/api";
import { formatDate, formatTry } from "../lib/format";
import { useAuthStore } from "../store/authStore";
import type { ApiResponse, Order } from "../types/api";
import { StatusBadge } from "./OrdersPage";

export function OrderDetailPage() {
  const oid = Number(useParams().id);
  const token = useAuthStore((s) => s.user!.token);
  const qc = useQueryClient();
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");

  const q = useQuery({
    queryKey: ["order", oid],
    queryFn: () => api.orders.one(token, oid).then(unwrap),
  });

  // İptal / iade / demo adımı: hepsi güncel siparişi döndürür. Aynı anda tek aksiyon çalışır.
  const action = useMutation({
    mutationFn: (call: () => Promise<ApiResponse<Order>>) => call().then(unwrap),
    onSuccess: (o) => {
      qc.setQueryData(["order", oid], o);
      void qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
  const busy = action.isPending;

  if (q.isLoading) return <p className="container page muted">Yükleniyor…</p>;
  if (!q.data) return <p className="container page error">{q.error?.message ?? "Sipariş bulunamadı."}</p>;

  const o = q.data;
  const canCancel = o.status === "pending" || o.status === "processing";
  const actionError = action.error;

  return (
    <div className="container page narrow">
      <Link href="/orders" className="small">
        ← Siparişlere dön
      </Link>
      <h1 className="page-title">{o.orderNumber}</h1>
      <p className="muted">
        <StatusBadge status={o.status} /> · {formatDate(o.createdAt)}
      </p>
      {actionError ? <p className="error">{actionError.message}</p> : null}

      {o.carrier ? (
        <section className="card panel">
          <h2>Kargo / teslimat</h2>
          <dl className="facts">
            <dt>Taşıyıcı</dt>
            <dd>{o.carrier}</dd>
            <dt>Takip no</dt>
            <dd>{o.trackingNumber ?? "—"}</dd>
            <dt>Kargoya verildi</dt>
            <dd>{formatDate(o.shippedAt)}</dd>
            <dt>Tahmini teslim</dt>
            <dd>{formatDate(o.estimatedDeliveryAt)}</dd>
          </dl>
        </section>
      ) : null}

      {o.cancelReason || o.returnReason || o.notes ? (
        <section className="card panel">
          {o.notes ? <p>Sipariş notu: {o.notes}</p> : null}
          {o.cancelReason ? <p>İptal nedeni: {o.cancelReason}</p> : null}
          {o.returnReason ? (
            <p>
              İade talebi ({formatDate(o.returnRequestedAt)}): {o.returnReason}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="card panel">
        <h2>Kalemler</h2>
        <table className="items-table">
          <tbody>
            {o.items.map((it) => (
              <tr key={it.productId}>
                <td>
                  <Link href={`/product/${it.productId}`}>{it.productName}</Link>
                </td>
                <td>{it.quantity} ad.</td>
                <td>{formatTry(it.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Toplam</td>
              <td>{formatTry(o.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      {o.shippingAddress || o.paymentMethod ? (
        <section className="card panel">
          <h2>Teslimat ve ödeme</h2>
          {o.shippingAddress ? (
            <p>
              {o.shippingAddress.fullAddress}, {o.shippingAddress.district}/{o.shippingAddress.city}
            </p>
          ) : null}
          {o.paymentMethod ? <p className="muted">{o.paymentMethod.cardNumber}</p> : null}
        </section>
      ) : null}

      {o.demoNextAction === "DEMO_ADVANCE_FULFILLMENT" ? (
        <section className="card panel">
          <h2>Demo: lojistik adımı</h2>
          <p className="muted small">Siparişi bir sonraki aşamaya taşır (hazırlanıyor → kargoda → teslim edildi).</p>
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy}
            onClick={() => action.mutate(() => api.orders.demoAdvanceFulfillment(token, oid))}
          >
            Sonraki lojistik adımı
          </button>
        </section>
      ) : null}

      {canCancel ? (
        <section className="card panel form-grid">
          <h2>Siparişi iptal et</h2>
          <textarea
            className="input"
            rows={2}
            maxLength={500}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="İsteğe bağlı iptal nedeni"
          />
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => {
              if (confirm("Siparişi iptal etmek istiyor musunuz?")) {
                action.mutate(() => api.orders.cancel(token, oid, cancelReason.trim() || undefined));
              }
            }}
          >
            İptali onayla
          </button>
        </section>
      ) : null}

      {o.status === "delivered" ? (
        <section className="card panel form-grid">
          <h2>İade talebi</h2>
          <textarea
            className="input"
            rows={3}
            maxLength={500}
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="İade nedeni (zorunlu)"
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy || !returnReason.trim()}
            onClick={() => {
              if (confirm("İade talebini göndermek istiyor musunuz?")) {
                action.mutate(() => api.orders.returnRequest(token, oid, returnReason.trim()));
              }
            }}
          >
            İade talebi oluştur
          </button>
        </section>
      ) : null}
    </div>
  );
}
