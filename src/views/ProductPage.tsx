"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { api, unwrap } from "../lib/api";
import { formatTry, stars } from "../lib/format";
import { useAuthStore } from "../store/authStore";
import { useSetCart } from "../store/cartStore";
import type { Product } from "../types/api";

export function ProductPage({ initial }: { initial: Product }) {
  const id = initial.id;
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const setCart = useSetCart();
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [added, setAdded] = useState(false);

  // HTML sunucudan dolu gelir; stok build anında donduğu için mount'ta canlı veriyle tazelenir.
  const { data: p } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.products.one(id).then(unwrap),
    initialData: initial,
    initialDataUpdatedAt: 0,
  });

  const reviews = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => api.reviews.byProduct(id).then(unwrap),
  });

  const summary = useQuery({
    queryKey: ["reviewSummary", id],
    queryFn: () => api.reviews.summary(id).then(unwrap),
  });

  const isFav = useQuery({
    queryKey: ["fav", id],
    queryFn: () => api.favorites.check(user!.token, id).then(unwrap),
    enabled: !!user,
  });

  const addToCart = useMutation({
    mutationFn: () => api.cart.add(user!.token, id, qty).then(unwrap),
    onSuccess: (cart) => {
      setCart(cart);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    },
  });

  const toggleFav = useMutation({
    mutationFn: () =>
      (isFav.data ? api.favorites.remove(user!.token, id) : api.favorites.add(user!.token, id)).then(unwrap),
    onSuccess: () => {
      qc.setQueryData(["fav", id], !isFav.data);
      void qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const postReview = useMutation({
    mutationFn: (body: { title?: string; comment?: string }) =>
      api.reviews.create(user!.token, { productId: id, rating, ...body }).then(unwrap),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["reviews", id] });
      void qc.invalidateQueries({ queryKey: ["reviewSummary", id] });
    },
  });

  function onReview(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    postReview.mutate(
      { title: String(fd.get("title") || "") || undefined, comment: String(fd.get("comment") || "") || undefined },
      { onSuccess: () => form.reset() },
    );
  }

  const discount = p.discount ?? 0;
  const inStock = p.unitInStock > 0;
  const lowStock = inStock && p.unitInStock < 15;
  const bump = (d: number) => setQty((q) => Math.max(1, Math.min(p.unitInStock, q + d)));
  const loginHref = `/login?from=${encodeURIComponent(`/product/${id}`)}`;

  return (
    <div className="container pdp">
      <nav className="breadcrumb">
        <Link href="/">Anasayfa</Link> / <Link href="/shop">Ürünler</Link>
        {p.categoryName ? (
          <>
            {" / "}
            <Link href={`/shop?categoryId=${p.categoryId}`}>{p.categoryName}</Link>
          </>
        ) : null}
      </nav>

      <div className="pdp-hero">
        <div className="pdp-gallery">
          {discount > 0 ? <span className="badge-discount pdp-gallery__disc">%{discount}</span> : null}
          {inStock ? <span className="badge-cargo">Bugün kargoda*</span> : null}
          <img className="pdp-gallery__img" src={p.imageUrl} alt={p.productName} width={600} height={600} />
        </div>

        <div className="pdp-buy">
          {p.categoryName ? (
            <Link href={`/shop?categoryId=${p.categoryId}`} className="pdp-cat">
              {p.categoryName}
            </Link>
          ) : null}
          <h1 className="pdp-title">{p.productName}</h1>
          <a href="#yorumlar" className="pdp-rating">
            <span className="stars" aria-hidden>
              {stars(summary.data?.averageRating ?? p.rating)}
            </span>
            {(summary.data?.averageRating ?? p.rating).toFixed(1)} · {summary.data?.totalReviews ?? p.reviewCount}{" "}
            değerlendirme
          </a>

          <div className="pdp-price">
            {discount > 0 ? <span className="pdp-price__old">{formatTry(p.unitPrice)}</span> : null}
            <div className="pdp-price__row">
              <span className="pdp-price__now">{formatTry(p.price)}</span>
              {discount > 0 ? <span className="badge-flash">Sepette %{discount}</span> : null}
            </div>
            <span className="pdp-price__vat">KDV dahil · {p.quantityPerUnit}</span>
          </div>

          <p className="pdp-desc">{p.description}</p>

          <div className={!inStock ? "stock-out" : lowStock ? "stock-low" : "stock-ok"}>
            {!inStock ? "Stokta yok" : lowStock ? `Son ${p.unitInStock} ürün` : "Stokta var"}
          </div>

          <div className="pdp-actions">
            <div className="pdp-qty" role="group" aria-label="Adet">
              <button type="button" onClick={() => bump(-1)} disabled={!inStock || qty <= 1} aria-label="Azalt">
                −
              </button>
              <span>{qty}</span>
              <button type="button" onClick={() => bump(1)} disabled={!inStock || qty >= p.unitInStock} aria-label="Artır">
                +
              </button>
            </div>
            {user ? (
              <button
                type="button"
                className={`btn btn-primary pdp-cart${added ? " is-added" : ""}`}
                disabled={!inStock || addToCart.isPending}
                onClick={() => addToCart.mutate()}
              >
                {addToCart.isPending ? "Ekleniyor…" : added ? "Eklendi ✓" : "Sepete ekle"}
              </button>
            ) : (
              <Link href={loginHref} className="btn btn-primary pdp-cart">
                Sepet için giriş yap
              </Link>
            )}
            {user ? (
              <button
                type="button"
                className={`pdp-fav${isFav.data ? " is-on" : ""}`}
                disabled={toggleFav.isPending}
                onClick={() => toggleFav.mutate()}
                aria-pressed={!!isFav.data}
                aria-label="Favori"
              >
                {isFav.data ? "♥" : "♡"}
              </button>
            ) : (
              <Link href={loginHref} className="pdp-fav" aria-label="Favori için giriş yap">
                ♡
              </Link>
            )}
          </div>
          {addToCart.isError ? <p className="error">{addToCart.error.message}</p> : null}

          <ul className="pdp-trust">
            <li>🚚 250 ₺ üzeri kargo bedava*</li>
            <li>↩️ 14 gün kolay iade</li>
            <li>🔒 Güvenli ödeme</li>
          </ul>
        </div>
      </div>

      <section id="yorumlar" className="pdp-reviews">
        <h2>Müşteri yorumları</h2>
        <div className="pdp-reviews__grid">
          {user ? (
            <form className="card panel form-grid" onSubmit={onReview}>
              <div className="pdp-stars" role="radiogroup" aria-label="Puan">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={n === rating}
                    className={n <= rating ? "is-on" : ""}
                    onClick={() => setRating(n)}
                    aria-label={`${n} yıldız`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input className="input" name="title" placeholder="Başlık (isteğe bağlı)" maxLength={120} />
              <textarea className="input" name="comment" placeholder="Yorumunuz" rows={3} maxLength={1000} />
              <button type="submit" className="btn btn-primary" disabled={postReview.isPending}>
                {postReview.isPending ? "Gönderiliyor…" : "Yorumu gönder"}
              </button>
              {postReview.isError ? <p className="error">{postReview.error.message}</p> : null}
            </form>
          ) : (
            <p className="muted">
              Yorum yazmak için <Link href={loginHref}>giriş yapın</Link>.
            </p>
          )}
          {reviews.isLoading ? (
            <p className="muted">Yorumlar yükleniyor…</p>
          ) : (
            <ul className="list-plain">
              {reviews.data?.map((rv) => (
                <li key={rv.id} className="pdp-review">
                  <div className="pdp-review__meta">
                    <span className="stars">{stars(rv.rating)}</span>
                    {rv.userName}
                  </div>
                  {rv.title ? <strong>{rv.title}</strong> : null}
                  {rv.comment ? <p>{rv.comment}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
