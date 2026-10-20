import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { AccountShell } from "./AccountShell";

export const metadata: Metadata = pageMeta({
  title: "Hesabım",
  path: "/account",
  index: false,
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
