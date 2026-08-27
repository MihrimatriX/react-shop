import type { Metadata } from "next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { pageMeta } from "@/lib/seo";
import { OrderDetailPage } from "@/views/OrderDetailPage";

export const metadata: Metadata = pageMeta({
  title: "Sipariş detayı",
  path: "/orders",
  index: false,
});

export default function Page() {
  return (
    <ProtectedRoute>
      <OrderDetailPage />
    </ProtectedRoute>
  );
}
