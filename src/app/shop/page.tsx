import type { Metadata } from "next";
import { Suspense } from "react";
import { JsonLd } from "@/components/JsonLd";
import { pageMeta, queryStr, shopJsonLd } from "@/lib/seo";
import { CATEGORIES } from "@/server/catalog";
import { ShopPage } from "@/views/ShopPage";

type ShopParams = Promise<{
  q?: string | string[];
  categoryId?: string | string[];
}>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: ShopParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = queryStr(sp.q).trim();
  const cat = CATEGORIES.find((c) => c.id === Number(queryStr(sp.categoryId)));

  if (q && cat) {
    return pageMeta({
      title: `${q} — ${cat.categoryName}`,
      description: `KapıdaMart’ta ${cat.categoryName} kategorisinde “${q}” araması. Kampanyalı fiyatlar, hızlı kargo.`,
      path: `/shop?categoryId=${cat.id}&q=${encodeURIComponent(q)}`,
    });
  }
  if (q) {
    return pageMeta({
      title: `“${q}” araması`,
      description: `KapıdaMart’ta “${q}” için ürünler. Kampanyalı fiyatlar, güvenli alışveriş.`,
      path: `/shop?q=${encodeURIComponent(q)}`,
    });
  }
  if (cat) {
    return pageMeta({
      title: cat.categoryName,
      description:
        cat.description ||
        `${cat.categoryName} ürünleri — KapıdaMart’ta uygun fiyat ve hızlı teslimat.`,
      path: `/shop?categoryId=${cat.id}`,
    });
  }
  return pageMeta({
    title: "Mağaza",
    description:
      "KapıdaMart mağazası — elektronik, moda, ev & yaşam ve daha fazlası. Filtreleyin, karşılaştırın.",
    path: "/shop",
  });
}

export default async function Page({
  searchParams,
}: {
  searchParams: ShopParams;
}) {
  const sp = await searchParams;
  const cat = CATEGORIES.find((c) => c.id === Number(queryStr(sp.categoryId)));
  return (
    <>
      <JsonLd data={shopJsonLd(cat)} />
      <Suspense>
        <ShopPage categories={CATEGORIES} />
      </Suspense>
    </>
  );
}
