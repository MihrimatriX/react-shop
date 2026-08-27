"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "../lib/api";
import { userVisibleError } from "../lib/apiError";
import { formatTry } from "../lib/format";
import { useAuthStore } from "../store/authStore";

function fmtWhen(iso?: string | null) {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16);
}

function statusTone(status: string): string {
  const s = (status || "").toLowerCase();
  if (s.includes("cancel")) return "var(--danger)";
  if (s === "delivered") return "var(--ok, #15803d)";
  if (s === "shipped" || s === "processing" || s === "pending")
    return "var(--accent, #b45309)";
  if (s === "returnrequested" || s.includes("return"))
    return "var(--warning, #a16207)";
  return "var(--muted)";
}

export function OrderDetailPage() {
  const params = useParams();
  const oid = Number(params.id);
  const user = useAuthStore((s) => s.user)!;
  const qc = useQueryClient();
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");

  const q = useQuery({
    queryKey: ["order", oid],
    queryFn: async () => {
      const r = await api.orders.one(user.token, oid);
      if (!r.success || !r.data) throw new Error(userVisibleError(r));
      return r.data;
    },
    enabled: Number.isFinite(oid),
  });

  const cancelM = useMutation({
    mutationFn: async () => {
      const r = await api.orders.cancel(
        user.token,
        oid,
        cancelReason || undefined,
      );
      if (!r.success) throw new Error(userVisibleError(r));
      return r;
    },
    onSuccess: () => {
      setCancelReason("");
      qc.invalidateQueries({ queryKey: ["order", oid] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const returnM = useMutation({
    mutationFn: async () => {
      const r = await api.orders.returnRequest(
        user.token,
        oid,
        returnReason.trim(),
      );
      if (!r.success) throw new Error(userVisibleError(r));
      return r;
    },
    onSuccess: () => {
      setReturnReason("");
      qc.invalidateQueries({ queryKey: ["order", oid] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const demoM = useMutation({
    mutationFn: async () => {
      const r = await api.orders.demoAdvanceFulfillment(user.token, oid);
      if (!r.success) throw new Error(userVisibleError(r));
      return r;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order", oid] });
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  if (!Number.isFinite(oid)) return <p className="container">Geçersiz</p>;
  if (q.isLoading) return <p className="container">Yükleniyor…</p>;
  if (q.isError || !q.data) {
    return (
      <p className="container" style={{ color: "var(--danger)" }}>
        {(q.error as Error)?.message || "Sipariş bulunamadı."}
      </p>
    );
  }

  const o = q.data;
  const stNorm = (o.status || "").toLowerCase();
  const nonCancelable = [
    "shipped",
    "delivered",
    "returnrequested",
    "cancelled",
    "canceled",
  ];
  const canCancel = !nonCancelable.includes(stNorm);
  const canRequestReturn = stNorm === "delivered";
  const showDemoAdvance = o.demoNextAction === "DEMO_ADVANCE_FULFILLMENT";

  return (
    <div className="container" style={{ paddingBlock: "2rem 3rem" }}>
      <Link href="/orders" style={{ fontSize: "0.9rem" }}>
        ← Siparişlere dön
      </Link>
      <h1
        className="brand-serif"
        style={{ fontSize: "1.75rem", marginTop: "0.5rem" }}
      >
        {o.orderNumber}
      </h1>
      <p style={{ color: "var(--muted)" }}>
        Durum:{" "}
        <strong style={{ color: statusTone(o.status) }}>{o.status}</strong>
        {o.createdAt ? (
          <span style={{ marginLeft: "0.5rem" }}>
            · Oluşturulma: {fmtWhen(o.createdAt)}
          </span>
        ) : null}
      </p>

      {(o.trackingNumber ||
        o.carrier ||
        o.shippedAt ||
        o.estimatedDeliveryAt) && (
        <div className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>
            Kargo / teslimat
          </h2>
          <ul
            style={{
              margin: 0,
              paddingLeft: "1.1rem",
              color: "var(--muted)",
              fontSize: "0.95rem",
            }}
          >
            {o.carrier ? <li>Taşıyıcı: {o.carrier}</li> : null}
            {o.trackingNumber ? <li>Takip no: {o.trackingNumber}</li> : null}
            {o.shippedAt ? (
              <li>Kargoya verildi: {fmtWhen(o.shippedAt)}</li>
            ) : null}
            {o.estimatedDeliveryAt ? (
              <li>Tahmini teslim: {fmtWhen(o.estimatedDeliveryAt)}</li>
            ) : null}
          </ul>
        </div>
      )}

      {o.cancelReason ? (
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.9rem",
            marginTop: "0.75rem",
          }}
        >
          İptal notu: {o.cancelReason}
        </p>
      ) : null}
      {(o.returnReason || o.returnRequestedAt) && (
        <p
          style={{
            color: "var(--muted)",
            fontSize: "0.9rem",
            marginTop: "0.25rem",
          }}
        >
          İade talebi
          {o.returnRequestedAt ? ` (${fmtWhen(o.returnRequestedAt)})` : ""}:{" "}
          {o.returnReason || "—"}
        </p>
      )}

      {o.shippingAddress ? (
        <div className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>
            Teslimat adresi
          </h2>
          <div>
            {o.shippingAddress.fullAddress}, {o.shippingAddress.district}/
            {o.shippingAddress.city}
          </div>
        </div>
      ) : null}

      {o.paymentMethod ? (
        <div className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>Ödeme</h2>
          <div style={{ color: "var(--muted)" }}>
            {o.paymentMethod.type} · {o.paymentMethod.cardNumber}
          </div>
        </div>
      ) : null}

      <div className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.05rem" }}>Kalemler</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {o.items.map((it) => (
              <tr
                key={`${it.productId}-${it.quantity}`}
                style={{ borderBottom: "1px solid var(--line)" }}
              >
                <td style={{ padding: "0.5rem 0" }}>{it.productName}</td>
                <td>{it.quantity} ad.</td>
                <td style={{ textAlign: "right" }}>
                  {formatTry(Number(it.totalPrice))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div
          style={{
            textAlign: "right",
            marginTop: "0.75rem",
            fontSize: "1.15rem",
          }}
        >
          <strong>{formatTry(Number(o.totalAmount))}</strong>
        </div>
      </div>

      {showDemoAdvance ? (
        <div className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>
            Demo: lojistik adımı
          </h2>
          <p
            style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 0 }}
          >
            Geliştirme ortamında siparişi bir sonraki aşamaya (hazırlanıyor →
            kargoda → teslim) taşır.
          </p>
          <button
            type="button"
            className="btn btn-accent"
            disabled={demoM.isPending}
            onClick={() => demoM.mutate()}
          >
            {demoM.isPending ? "İşleniyor…" : "Sonraki lojistik adımı"}
          </button>
          {demoM.isError ? (
            <p
              style={{
                color: "var(--danger)",
                marginBottom: 0,
                marginTop: "0.5rem",
              }}
            >
              {(demoM.error as Error).message}
            </p>
          ) : null}
        </div>
      ) : null}

      {canCancel ? (
        <div className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>
            Siparişi iptal et
          </h2>
          <textarea
            className="input"
            rows={2}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="İsteğe bağlı iptal nedeni"
            maxLength={500}
          />
          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginTop: "0.75rem" }}
            disabled={cancelM.isPending}
            onClick={() => {
              if (confirm("Siparişi iptal etmek istiyor musunuz?"))
                cancelM.mutate();
            }}
          >
            {cancelM.isPending ? "İptal ediliyor…" : "İptali onayla"}
          </button>
          {cancelM.isError ? (
            <p
              style={{
                color: "var(--danger)",
                marginBottom: 0,
                marginTop: "0.5rem",
              }}
            >
              {(cancelM.error as Error).message}
            </p>
          ) : null}
        </div>
      ) : null}

      {canRequestReturn ? (
        <div className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.05rem" }}>
            İade talebi
          </h2>
          <p
            style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: 0 }}
          >
            Teslim edilmiş siparişler için iade sürecini başlatır.
          </p>
          <textarea
            className="input"
            rows={3}
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="İade nedeni (zorunlu)"
            maxLength={500}
            required
          />
          <button
            type="button"
            className="btn btn-accent"
            style={{ marginTop: "0.75rem" }}
            disabled={returnM.isPending || returnReason.trim().length === 0}
            onClick={() => {
              if (!returnReason.trim()) return;
              if (confirm("İade talebini göndermek istiyor musunuz?"))
                returnM.mutate();
            }}
          >
            {returnM.isPending ? "Gönderiliyor…" : "İade talebi oluştur"}
          </button>
          {returnM.isError ? (
            <p
              style={{
                color: "var(--danger)",
                marginBottom: 0,
                marginTop: "0.5rem",
              }}
            >
              {(returnM.error as Error).message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
