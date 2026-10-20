import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "../types/api";

interface AuthState {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "react-shop-auth", skipHydration: true },
  ),
);
