"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { userVisibleError } from "../lib/apiError";
import { formatTry } from "../lib/format";
import { useAuthStore } from "../store/authStore";
import { cartLinesFromDto, cartSubtotal } from "../store/cartStore";

export function CheckoutPage() {
  const user = useAuthStore((s) => s.user)!;
  const qc = useQueryClient();
  const router = useRouter();
  const [addrId, setAddrId] = useState<number | null>(null);
  const [payId, setPayId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const cartQ = useQuery({
    queryKey: ["cart", user.token],
    queryFn: async () => {
      const r = await api.cart.get(user.token);
      if (!r.success || !r.data) throw new Error(r.message);
      return r.data;
    },
  });

  const addresses = useQuery({
    queryKey: ["addresses", user.userId],
    queryFn: async () => {
      const r = await api.addresses.list(user.token, user.userId);
      if (!r.success) throw new Error(r.message);
      return r.data || [];
    },
  });

  const payments = useQuery({
    queryKey: ["payments", user.userId],
    queryFn: async () => {
      const r = await api.payments.list(user.token, user.userId);
      if (!r.success) throw new Error(r.message);
      return r.data || [];
    },
  });

  const lines = cartLinesFromDto(cartQ.data);
  const sub = cartSubtotal(lines);

  async function submit() {
    setErr("");
    if (!addrId || !payId) {
      setErr("Teslimat adresi ve ödeme yöntemi seçin.");
      return;
    }
    const items = cartQ.data?.items ?? [];
    if (items.length === 0) {
      setErr("Sepet boş.");
      return;
    }
    setBusy(true);
    try {
      const idem = crypto.randomUUID().replace(/-/g, "");
      const body = {
        shippingAddressId: addrId,
        paymentMethodId: payId,
        notes: notes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };
      const r = await api.orders.create(user.token, body, idem);
      if (!r.success || !r.data) {
        setErr(userVisibleError(r));
        return;
      }
      await qc.invalidateQueries({ queryKey: ["cart"] });
      router.push(`/orders/${r.data.id}`);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (cartQ.isLoading) {
    return (
      <div className="container" style={{ paddingBlock: "2rem" }}>
        <p>Sepet yükleniyor…</p>
      </div>
    );
  }

  if (cartQ.isError) {
    return (
      <div className="container" style={{ paddingBlock: "2rem" }}>
        <p style={{ color: "var(--danger)" }}>
          {(cartQ.error as Error).message}
        </p>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container" style={{ paddingBlock: "2rem" }}>
        <p>Sepet boş.</p>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ paddingBlock: "2rem 3rem", maxWidth: 640 }}
    >
      <h1 className="brand-serif" style={{ fontSize: "1.75rem" }}>
        Ödeme
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        İstekte <code>Idempotency-Key</code> kullanılır; çift tıklamada
        yinelenen sipariş oluşmaz. Onay sonrası sepet sunucuda temizlenir.
      </p>

      <section className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.1rem" }}>
          Teslimat adresi
        </h2>
        {addresses.isLoading ? (
          <p>Yükleniyor…</p>
        ) : (addresses.data || []).length === 0 ? (
          <p>
            Kayıtlı adres yok. <a href="/account/addresses">Adres ekleyin</a>
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {addresses.data!.map((a) => (
              <li key={a.id} style={{ marginBottom: "0.5rem" }}>
                <label
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "flex-start",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="addr"
                    checked={addrId === a.id}
                    onChange={() => setAddrId(a.id)}
                  />
                  <span>
                    <strong>{a.title}</strong>{" "}
                    {a.isDefault ? (
                      <span className="badge">varsayılan</span>
                    ) : null}
                    <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                      {a.fullAddress}, {a.district}/{a.city} {a.postalCode}
                    </div>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.1rem" }}>
          Ödeme yöntemi
        </h2>
        {payments.isLoading ? (
          <p>Yükleniyor…</p>
        ) : (payments.data || []).length === 0 ? (
          <p>
            Kayıtlı kart yok. <a href="/account/payments">Kart ekleyin</a>
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {payments.data!.map((p) => (
              <li key={p.id} style={{ marginBottom: "0.5rem" }}>
                <label
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="pay"
                    checked={payId === p.id}
                    onChange={() => setPayId(p.id)}
                  />
                  <span>
                    {p.type} · {p.cardNumber}{" "}
                    {p.isDefault ? (
                      <span className="badge">varsayılan</span>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: "1.1rem" }}>
          Sipariş notu
        </h2>
        <textarea
          className="input"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Kapı şifresi, teslimat saati…"
        />
      </section>

      <div className="card" style={{ padding: "1rem", marginTop: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "1.15rem",
          }}
        >
          <span>Toplam</span>
          <strong>{formatTry(sub)}</strong>
        </div>
        {err ? (
          <p style={{ color: "var(--danger)", marginBottom: 0 }}>{err}</p>
        ) : null}
        <button
          type="button"
          className="btn btn-accent"
          style={{ width: "100%", marginTop: "1rem" }}
          disabled={busy}
          onClick={submit}
        >
          {busy ? "Gönderiliyor…" : "Siparişi onayla"}
        </button>
      </div>
    </div>
  );
}
