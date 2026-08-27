import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { RegisterPage } from "@/views/RegisterPage";

export const metadata: Metadata = pageMeta({
  title: "Kayıt ol",
  description: "KapıdaMart’a üye olun, sipariş ve favorilerinizi yönetin.",
  path: "/register",
  index: false,
});

export default function Page() {
  return <RegisterPage />;
}
