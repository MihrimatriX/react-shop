import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { CartPage } from "@/views/CartPage";

export const metadata: Metadata = pageMeta({
  title: "Sepet",
  description: "Alışveriş sepetiniz.",
  path: "/cart",
  index: false,
});

export default function Page() {
  return <CartPage />;
}
