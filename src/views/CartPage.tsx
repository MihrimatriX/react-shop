"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { api, unwrap } from "../lib/api";
import { formatTry } from "../lib/format";
import { useAuthStore } from "../store/authStore";
import { useCart, useSetCart } from "../store/cartStore";

export function CartPage() {
  const token = useAuthStore((s) => s.user?.token);
  const cart = useCart();
  const setCart = useSetCart();

  const update = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) =>
      (quantity > 0 ? api.cart.update(token!, productId, quantity) : api.cart.remove(token!, productId)).then(unwrap),
    onSuccess: setCart,
  });

  if (!token) {
    return (
      <div className="container empty">
        <h1 className="page-title">Sepet</h1>
        <p className="muted">Sepetiniz hesabınıza bağlıdır. Ürün eklemek ve görmek için giriş yapın.</p>
        <Link href="/login?from=%2Fcart" className="btn btn-primary">
          Giriş yap
        </Link>
      </div>
    );
  }

  if (cart.isError) return <p className="container page error">{cart.error.message}</p>;
  if (!cart.data) return <p className="container page muted">Sepet yükleniyor…</p>;

  const { items, totalAmount, totalItems } = cart.data;

  if (items.length === 0) {
    return (
      <div className="container empty">
        <h1 className="page-title">Sepetin boş</h1>
        <p className="muted">Mağazadan ürün ekleyerek başlayın.</p>
        <Link href="/shop" className="btn btn-primary">
          Mağazaya git
        </Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1 className="page-title">Sepet ({totalItems} ürün)</h1>
      <div className="cart-layout">
        <ul className="list-plain">
          {items.map((it) => (
            <li key={it.productId} className="card cart-line">
              <Link href={`/product/${it.productId}`}>
                <img className="cart-line__img" src={it.productImageUrl} alt="" width={100} height={80} />
              </Link>
              <div>
                <Link href={`/product/${it.productId}`} className="cart-line__name">
                  {it.productName}
                </Link>
                <div className="muted small">{formatTry(it.unitPrice)} / adet</div>
                <input
                  key={it.quantity}
                  type="number"
                  className="input cart-line__qty"
                  aria-label="Adet"
                  min={1}
                  max={it.unitInStock}
                  defaultValue={it.quantity}
                  disabled={update.isPending}
                  onBlur={(e) => {
                    const quantity = Math.floor(Number(e.target.value));
                    if (quantity >= 0 && quantity !== it.quantity) update.mutate({ productId: it.productId, quantity });
                  }}
                />
              </div>
              <div className="cart-line__total">
                <strong>{formatTry(it.totalPrice)}</strong>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={update.isPending}
                  onClick={() => update.mutate({ productId: it.productId, quantity: 0 })}
                >
                  Kaldır
                </button>
              </div>
            </li>
          ))}
        </ul>

        <aside className="card panel cart-summary">
          <div className="row-between">
            <span>Ara toplam</span>
            <strong>{formatTry(totalAmount)}</strong>
          </div>
          {update.isError ? <p className="error">{update.error.message}</p> : null}
          <Link href="/checkout" className="btn btn-primary btn-block">
            Ödemeye geç
          </Link>
        </aside>
      </div>
    </div>
  );
}
