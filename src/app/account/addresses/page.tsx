import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { AddressesPage } from "@/views/account/AddressesPage";

export const metadata: Metadata = pageMeta({
  title: "Adreslerim",
  path: "/account/addresses",
  index: false,
});

export default function Page() {
  return <AddressesPage />;
}
