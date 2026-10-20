import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { FavoritesPage } from "@/views/account/FavoritesPage";

export const metadata: Metadata = pageMeta({
  title: "Favorilerim",
  path: "/account/favorites",
  index: false,
});

export default function Page() {
  return <FavoritesPage />;
}
