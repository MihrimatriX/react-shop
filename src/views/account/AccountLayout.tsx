"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

function navClass(active: boolean) {
  return {
    display: "block",
    padding: "0.5rem 0.75rem",
    borderRadius: 8,
    textDecoration: "none",
    color: active ? "#fff" : "var(--ink)",
    background: active ? "var(--primary)" : "transparent",
    fontWeight: 500,
  } as const;
}

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  return (
    <div className="container account-shell" style={{ paddingBlock: "2rem 3rem" }}>
      <aside
        className="card"
        style={{ padding: "1rem", height: "fit-content" }}
      >
        <div
          style={{
            marginBottom: "1rem",
            fontSize: "0.9rem",
            color: "var(--muted)",
          }}
        >
          {user?.firstName} {user?.lastName}
          <div style={{ wordBreak: "break-all" }}>{user?.email}</div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Link href="/account" style={navClass(pathname === "/account")}>
            Özet
          </Link>
          <Link
            href="/account/addresses"
            style={navClass(pathname === "/account/addresses")}
          >
            Adresler
          </Link>
          <Link
            href="/account/payments"
            style={navClass(pathname === "/account/payments")}
          >
            Ödeme yöntemleri
          </Link>
          <Link
            href="/account/favorites"
            style={navClass(pathname === "/account/favorites")}
          >
            Favoriler
          </Link>
          <Link
            href="/account/settings"
            style={navClass(pathname === "/account/settings")}
          >
            Tercihler
          </Link>
          <Link
            href="/account/notifications"
            style={navClass(pathname === "/account/notifications")}
          >
            Bildirimler
          </Link>
          <Link
            href="/account/security"
            style={navClass(pathname === "/account/security")}
          >
            Güvenlik
          </Link>
        </nav>
      </aside>
      <div className="account-outlet">{children}</div>
      <style>{`
        .account-shell { display: grid; grid-template-columns: 200px 1fr; gap: 1.5rem; }
        @media (max-width: 720px) {
          .account-shell { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
