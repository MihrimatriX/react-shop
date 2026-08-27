"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { api } from "../lib/api";
import { formatTry } from "../lib/format";
import { useAuthStore } from "../store/authStore";
import { unitPriceAfterDiscount } from "../store/cartStore";

export function ProductPage() {
  const params = useParams();
  const productId = Number(params.id);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [qty, setQty] = useState(1);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [rating, setRating] = useState(5);
  const [added, setAdded] = useState(false);

  const product = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const r = await api.products.one(productId);
      if (!r.success || !r.data) throw new Error(r.message || "Bulunamadı");
      return r.data;
    },
    enabled: Number.isFinite(productId),
  });

  const reviews = useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      const r = await api.reviews.byProduct(productId);
      if (!r.success) throw new Error(r.message);
      return r.data || [];
    },
    enabled: Number.isFinite(productId),
  });

  const summary = useQuery({
    queryKey: ["reviewSummary", productId],
    queryFn: async () => {
      const r = await api.reviews.summary(productId);
      if (!r.success) return null;
      return r.data || null;
    },
    enabled: Number.isFinite(productId),
  });

  const favCheck = useQuery({
    queryKey: ["fav", productId, user?.userId],
    queryFn: async () => {
      const r = await api.favorites.check(user!.token, productId);
      return r.success && r.data === true;
    },
    enabled: !!user?.token && Number.isFinite(productId),
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!user?.token) throw new Error("login");
      const r = await api.cart.add(user.token, productId, qty);
      if (!r.success)
        throw new Error(r.message || r.error || "Sepete eklenemedi");
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    },
  });

  const toggleFav = useMutation({
    mutationFn: async () => {
      if (!user?.token) throw new Error("login");
      if (favCheck.data) {
        await api.favorites.remove(user.token, productId);
        return false;
      }
      await api.favorites.add(user.token, productId);
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["fav", productId] });
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });

  const postReview = useMutation({
    mutationFn: async () => {
      if (!user?.token) throw new Error("login");
      const r = await api.reviews.create(user.token, {
        productId,
        userId: user.userId,
        rating,
        title: reviewTitle || undefined,
        comment: reviewBody || undefined,
      });
      if (!r.success) throw new Error(r.message || r.error);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
      qc.invalidateQueries({ queryKey: ["reviewSummary", productId] });
      setReviewTitle("");
      setReviewBody("");
    },
  });

  if (!Number.isFinite(productId))
    return <p className="container">Geçersiz ürün</p>;
  if (product.isLoading) {
    return (
      <div className="container pdp">
        <div className="pdp-hero">
          <div className="skeleton pdp-skel-img" />
          <div>
            <div className="skeleton pdp-skel-line" style={{ width: "30%" }} />
            <div className="skeleton pdp-skel-line" style={{ width: "80%" }} />
            <div className="skeleton pdp-skel-line" style={{ width: "50%" }} />
            <div className="skeleton pdp-skel-box" />
          </div>
        </div>
      </div>
    );
  }
  if (product.isError || !product.data)
    return <p className="container">Ürün bulunamadı.</p>;

  const p = product.data;
  const price = unitPriceAfterDiscount(p);
  const listPrice = Number(p.unitPrice);
  const inStock = p.unitInStock > 0;
  const lowStock = inStock && p.unitInStock < 15;

  function bump(delta: number) {
    setQty((q) => Math.max(1, Math.min(p.unitInStock || 1, q + delta)));
  }

  return (
    <div className="container pdp">
      <nav className="breadcrumb">
        <Link href="/">Anasayfa</Link>
        {" / "}
        <Link href="/shop">Ürünler</Link>
        {p.categoryName ? (
          <>
            {" / "}
            <Link href={`/shop?categoryId=${p.categoryId}`}>{p.categoryName}</Link>
          </>
        ) : null}
      </nav>

      <div className="pdp-hero">
        <div className="pdp-gallery">
          {p.discount && p.discount > 0 ? (
            <span className="badge-discount pdp-gallery__disc">%{p.discount}</span>
          ) : null}
          {inStock ? <span className="badge-cargo pdp-gallery__cargo">Bugün kargoda*</span> : null}
          <img
            className="pdp-gallery__img"
            src={p.imageUrl || ""}
            alt={p.productName}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml," +
                encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect fill="#f0f0f0" width="100%" height="100%"/></svg>',
                );
            }}
          />
        </div>

        <div className="pdp-buy">
          {p.categoryName ? (
            <Link href={`/shop?categoryId=${p.categoryId}`} className="pdp-cat">
              {p.categoryName}
            </Link>
          ) : null}
          <h1 className="pdp-title">{p.productName}</h1>
          {summary.data ? (
            <a href="#yorumlar" className="pdp-rating">
              <span className="pdp-rating__stars" aria-hidden>
                {"★".repeat(Math.round(summary.data.averageRating || 0))}
                {"☆".repeat(5 - Math.round(summary.data.averageRating || 0))}
              </span>
              <span>
                {summary.data.averageRating?.toFixed(1)} · {summary.data.totalReviews} değerlendirme
              </span>
            </a>
          ) : null}

          <div className="pdp-price">
            {p.discount && p.discount > 0 ? (
              <span className="pdp-price__old">{formatTry(listPrice)}</span>
            ) : null}
            <div className="pdp-price__row">
              <span className="pdp-price__now">{formatTry(price)}</span>
              {p.discount ? <span className="badge-flash">Sepette %{p.discount}</span> : null}
            </div>
            <span className="pdp-price__vat">KDV dahil · {p.quantityPerUnit}</span>
          </div>

          <p className="pdp-desc">{p.description}</p>

          <div className={`pdp-stock ${inStock ? "" : "is-out"} ${lowStock ? "is-low" : ""}`}>
            {inStock
              ? lowStock
                ? `Son ${p.unitInStock} ürün`
                : "Stokta var"
              : "Stokta yok"}
          </div>

          <div className="pdp-actions">
            <div className="pdp-qty" aria-label="Adet">
              <button type="button" onClick={() => bump(-1)} disabled={!inStock || qty <= 1}>
                −
              </button>
              <span>{qty}</span>
              <button
                type="button"
                onClick={() => bump(1)}
                disabled={!inStock || qty >= p.unitInStock}
              >
                +
              </button>
            </div>
            {user?.token ? (
              <button
                type="button"
                className={`btn btn-primary pdp-cart ${added ? "is-added" : ""}`}
                disabled={!inStock || addToCart.isPending}
                onClick={() => addToCart.mutate()}
              >
                {addToCart.isPending ? "Ekleniyor…" : added ? "Eklendi ✓" : "Sepete ekle"}
              </button>
            ) : (
              <Link
                href={`/login?from=${encodeURIComponent(`/product/${productId}`)}`}
                className="btn btn-primary pdp-cart"
              >
                Sepet için giriş yap
              </Link>
            )}
            {user ? (
              <button
                type="button"
                className={`pdp-fav ${favCheck.data ? "is-on" : ""}`}
                disabled={toggleFav.isPending}
                onClick={() => toggleFav.mutate()}
                aria-label={favCheck.data ? "Favorilerden çıkar" : "Favorilere ekle"}
              >
                {favCheck.data ? "♥" : "♡"}
              </button>
            ) : (
              <Link href="/login" className="pdp-fav" aria-label="Favori için giriş">
                ♡
              </Link>
            )}
          </div>
          {addToCart.isError ? (
            <p className="pdp-err">{(addToCart.error as Error).message}</p>
          ) : null}

          <ul className="pdp-trust">
            <li>🚚 250 ₺ üzeri kargo bedava*</li>
            <li>↩️ 14 gün kolay iade</li>
            <li>🔒 Güvenli ödeme</li>
          </ul>
        </div>
      </div>

      <section id="yorumlar" className="pdp-reviews">
        <h2 className="pdp-reviews__title">Müşteri yorumları</h2>
        <div className="pdp-reviews__grid">
          {user ? (
            <form
              className="pdp-review-form"
              onSubmit={(e) => {
                e.preventDefault();
                postReview.mutate();
              }}
            >
              <div className="pdp-stars" role="radiogroup" aria-label="Puan">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n <= rating ? "is-on" : ""}
                    onClick={() => setRating(n)}
                    aria-label={`${n} yıldız`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input
                className="input"
                placeholder="Başlık (isteğe bağlı)"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
              />
              <textarea
                className="input"
                placeholder="Yorumunuz"
                rows={3}
                value={reviewBody}
                onChange={(e) => setReviewBody(e.target.value)}
              />
              <button type="submit" className="btn btn-accent" disabled={postReview.isPending}>
                {postReview.isPending ? "Gönderiliyor…" : "Yorumu gönder"}
              </button>
              {postReview.isError ? (
                <p className="pdp-err">{(postReview.error as Error).message}</p>
              ) : null}
            </form>
          ) : (
            <p className="pdp-review-hint">
              Yorum yazmak için <Link href="/login">giriş yapın</Link>.
            </p>
          )}
          {reviews.isLoading ? (
            <p>Yorumlar yükleniyor…</p>
          ) : (
            <ul className="pdp-review-list">
              {(reviews.data || []).map((rv) => (
                <li key={rv.id} className="pdp-review">
                  <div className="pdp-review__meta">
                    <span className="pdp-review__stars">
                      {"★".repeat(rv.rating)}
                      {"☆".repeat(5 - rv.rating)}
                    </span>
                    {rv.userName ? <span>{rv.userName}</span> : null}
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
