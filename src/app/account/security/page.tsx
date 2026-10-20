import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SecurityPage } from "@/views/account/SecurityPage";

export const metadata: Metadata = pageMeta({
  title: "Güvenlik",
  path: "/account/security",
  index: false,
});

export default function Page() {
  return <SecurityPage />;
}
