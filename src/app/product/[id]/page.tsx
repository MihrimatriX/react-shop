import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { pageMeta, productJsonLd } from "@/lib/seo";
import { PRODUCTS } from "@/server/catalog";
import { SITE_NAME } from "@/lib/site";
import { ProductPage } from "@/views/ProductPage";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = PRODUCTS.find((x) => x.id === Number(id));
  if (!p) {
    return pageMeta({
      title: "Ürün bulunamadı",
      path: `/product/${id}`,
      index: false,
    });
  }
  return pageMeta({
    title: p.productName,
    description:
      p.description ||
      `${p.productName} — ${SITE_NAME}’ta uygun fiyat, hızlı kargo.`,
    path: `/product/${p.id}`,
    ogImage: false,
  });
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  const p = PRODUCTS.find((x) => x.id === Number(id));
  if (!p) notFound();
  return (
    <>
      <JsonLd data={productJsonLd(p)} />
      <ProductPage />
    </>
  );
}
