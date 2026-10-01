"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, unwrap } from "../lib/api";
import { formatTry } from "../lib/format";
import { useAuthStore } from "../store/authStore";
import { useCart } from "../store/cartStore";

const newKey = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function CheckoutPage() {
  const user = useAuthStore((s) => s.user)!;
  const router = useRouter();
  const qc = useQueryClient();
  const cart = useCart();
  const [addrPick, setAddrPick] = useState<number>();
  const [payPick, setPayPick] = useState<number>();
  const [notes, setNotes] = useState("");
  // Sayfa başına tek anahtar: ağ hatasında yeniden denemek aynı siparişi döndürür, ikincisini açmaz.
  const [idemKey] = useState(newKey);

  const addresses = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.addresses.list(user.token, user.userId).then(unwrap),
  });
  const payments = useQuery({
    queryKey: ["payments"],
    queryFn: () => api.payments.list(user.token, user.userId).then(unwrap),
  });

  // Kullanıcı seçim yapmadıysa varsayılan adres / kart seçili gelir.
  const addrId = addrPick ?? addresses.data?.find((a) => a.isDefault)?.id;
  const payId = payPick ?? payments.data?.find((p) => p.isDefault)?.id;

  const order = useMutation({
    mutationFn: () =>
      api.orders
        .create(user.token, { shippingAddressId: addrId!, paymentMethodId: payId!, notes: notes || undefined }, idemKey)
        .then(unwrap),
    onSuccess: (o) => {
      void qc.invalidateQueries({ queryKey: ["cart"] });
      void qc.invalidateQueries({ queryKey: ["orders"] });
      router.push(`/orders/${o.id}`);
    },
  });

  if (cart.isError) return <p className="container page error">{cart.error.message}</p>;
  if (!cart.data) return <p className="container page muted">Sepet yükleniyor…</p>;
  if (cart.data.items.length === 0 && !order.isSuccess) {
    return (
      <div className="container empty">
        <p className="muted">Sepetiniz boş.</p>
        <Link href="/shop" className="btn btn-primary">
          Mağazaya git
        </Link>
      </div>
    );
  }

  return (
    <div className="container page narrow">
      <h1 className="page-title">Ödeme</h1>

      <section className="card panel">
        <h2>Teslimat adresi</h2>
        {addresses.isLoading ? (
          <p className="muted">Yükleniyor…</p>
        ) : !addresses.data?.length ? (
          <p>
            Kayıtlı adres yok. <Link href="/account/addresses">Adres ekleyin</Link>
          </p>
        ) : (
          <div className="choices">
            {addresses.data.map((a) => (
              <label key={a.id} className="choice">
                <input type="radio" name="addr" checked={addrId === a.id} onChange={() => setAddrPick(a.id)} />
                <span>
                  <strong>{a.title}</strong> {a.isDefault ? <span className="badge">varsayılan</span> : null}
                  <span className="muted small block">
                    {a.fullAddress}, {a.district}/{a.city} {a.postalCode}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="card panel">
        <h2>Ödeme yöntemi</h2>
        {payments.isLoading ? (
          <p className="muted">Yükleniyor…</p>
        ) : !payments.data?.length ? (
          <p>
            Kayıtlı kart yok. <Link href="/account/payments">Kart ekleyin</Link>
          </p>
        ) : (
          <div className="choices">
            {payments.data.map((p) => (
              <label key={p.id} className="choice">
                <input type="radio" name="pay" checked={payId === p.id} onChange={() => setPayPick(p.id)} />
                <span>
                  {p.cardNumber} {p.isDefault ? <span className="badge">varsayılan</span> : null}
                  <span className="muted small block">{p.cardHolderName}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      <section className="card panel">
        <h2>Sipariş notu</h2>
        <textarea
          className="input"
          rows={2}
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Kapı şifresi, teslimat saati…"
        />
      </section>

      <div className="card panel">
        <div className="row-between total-row">
          <span>Toplam ({cart.data.totalItems} ürün)</span>
          <strong>{formatTry(cart.data.totalAmount)}</strong>
        </div>
        {order.isError ? <p className="error">{order.error.message}</p> : null}
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!addrId || !payId || order.isPending || order.isSuccess}
          onClick={() => order.mutate()}
        >
          {order.isPending ? "Gönderiliyor…" : "Siparişi onayla"}
        </button>
      </div>
    </div>
  );
}
