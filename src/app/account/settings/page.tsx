import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { SettingsPage } from "@/views/account/SettingsPage";

export const metadata: Metadata = pageMeta({
  title: "Tercihler",
  path: "/account/settings",
  index: false,
});

export default function Page() {
  return <SettingsPage />;
}
