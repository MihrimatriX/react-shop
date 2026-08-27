import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { pageMeta } from "@/lib/seo";
import { CheckoutPage } from "@/views/CheckoutPage";

export const metadata: Metadata = pageMeta({
  title: "Ödeme",
  description: "Siparişi tamamlayın.",
  path: "/checkout",
  index: false,
});

export default function Page() {
  return (
    <ProtectedRoute>
      <CheckoutPage />
    </ProtectedRoute>
  );
}
