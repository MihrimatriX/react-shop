import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Siparişlerim",
  path: "/orders",
  index: false,
});

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
