"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { useAuthStore } from "../store/authStore";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }),
  );

  useEffect(() => {
    void useAuthStore.persist.rehydrate();
    // Giriş/çıkış/oturum düşmesi: önceki kullanıcının siparişleri, favorileri vb. önbellekte kalmasın.
    return useAuthStore.subscribe((s, prev) => {
      if (s.user?.token !== prev.user?.token) client.clear();
    });
  }, [client]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
