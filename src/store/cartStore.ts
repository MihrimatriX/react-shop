import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../lib/api";
import type { CartDto } from "../types/api";
import { useAuthStore } from "./authStore";

/** Sunucudaki sepet; header rozeti, sepet ve ödeme sayfası aynı önbelleği paylaşır. */
export function useCart() {
  const token = useAuthStore((s) => s.user?.token);
  return useQuery({
    queryKey: ["cart", token],
    queryFn: () => api.cart.get(token!).then(unwrap),
    enabled: !!token,
  });
}

/** Sepet uçları güncel sepeti döndürür; yeniden çekmek yerine önbelleğe doğrudan yazılır. */
export function useSetCart() {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.user?.token);
  return (cart: CartDto) => qc.setQueryData(["cart", token], cart);
}
