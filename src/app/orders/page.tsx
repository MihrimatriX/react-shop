import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OrdersPage } from "@/views/OrdersPage";

export default function Page() {
  return (
    <ProtectedRoute>
      <OrdersPage />
    </ProtectedRoute>
  );
}
