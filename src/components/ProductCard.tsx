import Link from "next/link";
import type { Product } from "../types/api";
import { formatTry, stars } from "../lib/format";

export function ProductCard({ product: p }: { product: Product }) {
  const discount = p.discount ?? 0;
  const inStock = p.unitInStock > 0;

  return (
    <Link href={`/product/${p.id}`} className="product-tile">
      <div className="product-tile__img-wrap">
        <div className="product-tile__badges">
          {discount >= 25 ? <span className="badge-flash">Flaş</span> : null}
          {discount > 0 ? <span className="badge-discount">%{discount}</span> : null}
        </div>
        {inStock ? <div className="badge-cargo">Kargo bedava*</div> : null}
        <img className="product-tile__img" src={p.imageUrl} alt="" loading="lazy" width={600} height={600} />
      </div>
      <div className="product-tile__body">
        <p className="product-tile__title">{p.productName}</p>
        <div className="product-tile__rating">
          <span className="stars" aria-hidden>
            {stars(p.rating)}
          </span>
          <span>
            {p.rating.toFixed(1)} ({p.reviewCount})
          </span>
        </div>
        <div className="product-tile__price-row">
          {discount > 0 ? <div className="product-tile__old">{formatTry(p.unitPrice)}</div> : null}
          <div className="product-tile__price">{formatTry(p.price)}</div>
        </div>
        <span className={inStock ? "stock-ok" : "stock-out"}>{inStock ? "Stokta var" : "Tükendi"}</span>
      </div>
    </Link>
  );
}
