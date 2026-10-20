import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { NotificationsPage } from "@/views/account/NotificationsPage";

export const metadata: Metadata = pageMeta({
  title: "Bildirimler",
  path: "/account/notifications",
  index: false,
});

export default function Page() {
  return <NotificationsPage />;
}
