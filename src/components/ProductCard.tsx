"use client";

import Link from "next/link";
import type { Product } from "../types/api";
import { formatTry } from "../lib/format";
import { unitPriceAfterDiscount } from "../store/cartStore";

function demoRating(productId: number): {
  stars: string;
  count: number;
  value: number;
} {
  const seed = (productId * 9301 + 49297) % 10000;
  const value = Math.round(((35 + (seed % 15)) / 10) * 10) / 10;
  const full = Math.round(value);
  const stars =
    "★".repeat(Math.min(5, full)) +
    "☆".repeat(Math.max(0, 5 - Math.min(5, full)));
  const count = 12 + (seed % 880);
  return { stars, count, value };
}

export function ProductCard({ product }: { product: Product }) {
  const price = unitPriceAfterDiscount(product);
  const base = Number(product.unitPrice);
  const d = product.discount && product.discount > 0 ? product.discount : 0;
  const hasDisc = d > 0;
  const img = product.imageUrl || "/placeholder-product.svg";
  const { stars, count, value } = demoRating(product.id);
  const flash = hasDisc && d >= 25;

  return (
    <article className="product-tile">
      <Link
        href={`/product/${product.id}`}
        style={{
          textDecoration: "none",
          color: "inherit",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <div className="product-tile__img-wrap">
          <div className="product-tile__badges">
            {flash ? <span className="badge-flash">Flaş</span> : null}
            {hasDisc ? <span className="badge-discount">%{d}</span> : null}
          </div>
          {product.unitInStock > 0 ? (
            <div className="badge-cargo">Kargo bedava*</div>
          ) : null}
          <img
            className="product-tile__img"
            src={img}
            alt=""
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "data:image/svg+xml," +
                encodeURIComponent(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="#f0f0f0" width="100%" height="100%"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="14">ürün</text></svg>',
                );
            }}
          />
        </div>
        <div className="product-tile__body">
          <p className="product-tile__title">{product.productName}</p>
          <div className="product-tile__rating">
            <span className="product-tile__stars" aria-hidden>
              {stars}
            </span>
            <span>
              {value.toFixed(1)} ({count})
            </span>
          </div>
          <div className="product-tile__price-row">
            {hasDisc ? (
              <div className="product-tile__old">{formatTry(base)}</div>
            ) : null}
            <div className="product-tile__price">{formatTry(price)}</div>
          </div>
          {product.unitInStock <= 0 ? (
            <span className="product-tile__stock product-tile__stock--out">
              Tükendi
            </span>
          ) : (
            <span className="product-tile__stock">Stokta var</span>
          )}
        </div>
      </Link>
    </article>
  );
}
