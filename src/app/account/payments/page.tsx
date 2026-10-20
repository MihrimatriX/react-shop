import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { PaymentsPage } from "@/views/account/PaymentsPage";

export const metadata: Metadata = pageMeta({
  title: "Ödeme yöntemleri",
  path: "/account/payments",
  index: false,
});

export default function Page() {
  return <PaymentsPage />;
}
