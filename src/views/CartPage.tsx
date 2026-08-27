"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "../lib/api";
import { formatTry } from "../lib/format";
import { useAuthStore } from "../store/authStore";
import {
  cartLinesFromDto,
  cartSubtotal,
  unitPriceAfterDiscount,
} from "../store/cartStore";

export function CartPage() {
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const cartQ = useQuery({
    queryKey: ["cart", user?.token ?? ""],
    queryFn: async () => {
      const r = await api.cart.get(user!.token);
      if (!r.success || !r.data) throw new Error(r.message);
      return r.data;
    },
    enabled: !!user?.token,
  });

  const updateMut = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: number;
      quantity: number;
    }) => {
      const r = await api.cart.update(user!.token, productId, quantity);
      if (!r.success) throw new Error(r.message || r.error || "Güncellenemedi");
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeMut = useMutation({
    mutationFn: async (productId: number) => {
      const r = await api.cart.remove(user!.token, productId);
      if (!r.success) throw new Error(r.message || r.error || "Kaldırılamadı");
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  });

  if (!user?.token) {
    return (
      <div
        className="container"
        style={{ paddingBlock: "3rem", textAlign: "center" }}
      >
        <h1 className="brand-serif">Sepet</h1>
        <p style={{ color: "var(--muted)" }}>
          Sepetiniz hesabınıza bağlıdır. Ürün eklemek ve görmek için giriş
          yapın.
        </p>
        <Link
          href="/login?from=%2Fcart"
          className="btn btn-primary"
          style={{ marginTop: "1rem" }}
        >
          Giriş yap
        </Link>
      </div>
    );
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

  const lines = cartLinesFromDto(cartQ.data);
  const sub = cartSubtotal(lines);

  if (lines.length === 0) {
    return (
      <div
        className="container"
        style={{ paddingBlock: "3rem", textAlign: "center" }}
      >
        <h1 className="brand-serif">Sepetin boş</h1>
        <p style={{ color: "var(--muted)" }}>
          Mağazadan ürün ekleyerek başlayın.
        </p>
        <Link
          href="/shop"
          className="btn btn-primary"
          style={{ marginTop: "1rem" }}
        >
          Mağazaya git
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBlock: "2rem 3rem" }}>
      <h1 className="brand-serif" style={{ fontSize: "1.75rem" }}>
        Sepet
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Sepet sunucuda saklanır; tüm cihazlarınızda aynı ürünleri görürsünüz.
      </p>
      <div
        style={{
          display: "grid",
          gap: "1rem",
          marginTop: "1rem",
          maxWidth: 720,
        }}
      >
        {lines.map((line) => {
          const u = unitPriceAfterDiscount(line.product);
          return (
            <div key={line.productId} className="card cart-line">
              <Link href={`/product/${line.productId}`}>
                <img
                  className="cart-line__img"
                  src={line.product.imageUrl || ""}
                  alt=""
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.visibility = "hidden";
                  }}
                />
              </Link>
              <div>
                <Link
                  href={`/product/${line.productId}`}
                  style={{ fontWeight: 600, color: "inherit" }}
                >
                  {line.product.productName}
                </Link>
                <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
                  {formatTry(u)} ×{" "}
                </div>
                <input
                  key={`${line.productId}-${line.quantity}`}
                  type="number"
                  className="input"
                  style={{ width: 72, marginTop: 6 }}
                  min={1}
                  max={line.product.unitInStock}
                  defaultValue={line.quantity}
                  disabled={updateMut.isPending}
                  onBlur={(e) => {
                    const v = Number(e.target.value) || 0;
                    if (v === line.quantity) return;
                    updateMut.mutate({
                      productId: line.productId,
                      quantity: v,
                    });
                  }}
                />
              </div>
              <div className="cart-line__total">
                <div style={{ fontWeight: 700 }}>
                  {formatTry(u * line.quantity)}
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ marginTop: 8, fontSize: "0.8rem" }}
                  disabled={removeMut.isPending}
                  onClick={() => removeMut.mutate(line.productId)}
                >
                  Kaldır
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="card"
        style={{ padding: "1.25rem", marginTop: "1.5rem", maxWidth: 360 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <span>Ara toplam</span>
          <strong>{formatTry(sub)}</strong>
        </div>
        <Link
          href="/checkout"
          className="btn btn-accent"
          style={{ width: "100%" }}
        >
          Ödemeye geç
        </Link>
      </div>
    </div>
  );
}
