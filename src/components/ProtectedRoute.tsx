"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";

const subscribe = (cb: () => void) => useAuthStore.persist.onFinishHydration(cb);
const hydrated = () => useAuthStore.persist.hasHydrated();

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.user?.token);
  const ready = useSyncExternalStore(subscribe, hydrated, () => false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !token) router.replace(`/login?from=${encodeURIComponent(pathname)}`);
  }, [ready, token, pathname, router]);

  return ready && token ? children : null;
}
