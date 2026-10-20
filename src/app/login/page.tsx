import type { Metadata } from "next";
import { Suspense } from "react";
import { pageMeta } from "@/lib/seo";
import { LoginPage } from "@/views/LoginPage";

export const metadata: Metadata = pageMeta({
  title: "Giriş",
  description: "KapıdaMart hesabınıza giriş yapın.",
  path: "/login",
  index: false,
});

export default function Page() {
  return (
    <Suspense fallback={<p className="container">Yükleniyor…</p>}>
      <LoginPage />
    </Suspense>
  );
}
