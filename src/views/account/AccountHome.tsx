"use client";

import Link from "next/link";
import { useAuthStore } from "../../store/authStore";

export function AccountHome() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      <h1 className="brand-serif" style={{ fontSize: "1.75rem" }}>
        Hesabım
      </h1>
      <p style={{ color: "var(--muted)" }}>
        Merhaba {user?.firstName}. Sipariş ve profil işlemlerini soldan yönet.
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          marginTop: "1rem",
        }}
      >
        <Link href="/orders" className="btn btn-primary">
          Siparişlerim
        </Link>
        <Link href="/account/addresses" className="btn btn-ghost">
          Adres ekle
        </Link>
        <Link href="/shop" className="btn btn-ghost">
          Alışverişe devam
        </Link>
      </div>
    </div>
  );
}
