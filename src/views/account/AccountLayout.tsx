"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

const NAV = [
  ["/account", "Özet"],
  ["/account/addresses", "Adresler"],
  ["/account/payments", "Ödeme yöntemleri"],
  ["/account/favorites", "Favoriler"],
  ["/account/settings", "Tercihler"],
  ["/account/notifications", "Bildirimler"],
  ["/account/security", "Güvenlik"],
];

export function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const pathname = usePathname();

  return (
    <div className="container page account-shell">
      <aside className="card panel account-nav">
        <div className="account-nav__user">
          <strong>
            {user?.firstName} {user?.lastName}
          </strong>
          <span className="muted small">{user?.email}</span>
        </div>
        <nav>
          {NAV.map(([href, label]) => (
            <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined}>
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
