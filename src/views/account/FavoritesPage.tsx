"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api, unwrap } from "../../lib/api";
import { formatTry } from "../../lib/format";
import { useAuthStore } from "../../store/authStore";

export function FavoritesPage() {
  const token = useAuthStore((s) => s.user!.token);
  const qc = useQueryClient();
  const q = useQuery({
    queryKey: ["favorites"],
    queryFn: () => api.favorites.list(token).then(unwrap),
  });

  const remove = useMutation({
    mutationFn: (productId: number) => api.favorites.remove(token, productId).then(unwrap),
    onSuccess: (_, productId) => {
      void qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.setQueryData(["fav", productId], false);
    },
  });

  return (
    <div>
      <h1 className="page-title">Favoriler</h1>
      {q.isLoading ? <p className="muted">Yükleniyor…</p> : null}
      {q.data?.length === 0 ? <p className="muted">Henüz favori yok.</p> : null}
      <div className="grid-products">
        {q.data?.map((f) => (
          <div key={f.productId} className="product-tile">
            <Link href={`/product/${f.productId}`} className="product-tile__img-wrap">
              <img className="product-tile__img" src={f.productImageUrl} alt="" loading="lazy" width={600} height={600} />
            </Link>
            <div className="product-tile__body">
              <Link href={`/product/${f.productId}`} className="product-tile__title">
                {f.productName}
              </Link>
              <span className="muted small">{f.productCategory}</span>
              <div className="product-tile__price-row row-between">
                <span className="product-tile__price">{formatTry(f.productPrice)}</span>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={remove.isPending}
                  onClick={() => remove.mutate(f.productId)}
                >
                  Kaldır
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
