"use client";

import Link from "next/link";
import { useAuthStore } from "../../store/authStore";

export function AccountHome() {
  const firstName = useAuthStore((s) => s.user?.firstName);
  return (
    <div>
      <h1 className="page-title">Hesabım</h1>
      <p className="muted">Merhaba {firstName}. Sipariş ve profil işlemlerini menüden yönetebilirsin.</p>
      <div className="actions">
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
