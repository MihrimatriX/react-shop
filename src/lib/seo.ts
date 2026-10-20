import type { Metadata } from "next";
import type { Category, Product } from "@/types/api";
import {
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_PHONE,
  absUrl,
  siteUrl,
} from "./site";

export const noIndexRobots = {
  index: false,
  follow: false,
  nocache: true,
} as const;

export function queryStr(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export function pageMeta(opts: {
  title: string;
  description?: string;
  path: string;
  index?: boolean;
  ogImage?: false | string;
}): Metadata {
  const url = absUrl(opts.path);
  const description = opts.description ?? SITE_DESCRIPTION;
  const branded = `${opts.title} | ${SITE_NAME}`;
  const index = opts.index !== false;
  const images =
    opts.ogImage === false
      ? undefined
      : [
          {
            url: opts.ogImage || "/opengraph-image",
            width: 1200,
            height: 630,
            alt: branded,
          },
        ];
  return {
    title: opts.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: branded,
      description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: "website",
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: branded,
      description,
      ...(images ? { images: [images[0].url] } : {}),
    },
    robots: index ? undefined : noIndexRobots,
  };
}

export function websiteJsonLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#org`,
        name: SITE_NAME,
        url,
        logo: absUrl("/favicon.svg"),
        telephone: SITE_PHONE,
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        name: SITE_NAME,
        url,
        inLanguage: "tr-TR",
        publisher: { "@id": `${url}/#org` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${url}/shop?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}

export function productJsonLd(p: Product) {
  const url = absUrl(`/product/${p.id}`);
  const brand = p.productName.split(" ")[0] || SITE_NAME;
  const crumbs: [string, string][] = [
    ["Anasayfa", "/"],
    ["Mağaza", "/shop"],
    ...(p.categoryName ? [[p.categoryName, `/shop?categoryId=${p.categoryId}`] as [string, string]] : []),
    [p.productName, `/product/${p.id}`],
  ];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map(([name, path], i) => ({
          "@type": "ListItem",
          position: i + 1,
          name,
          item: absUrl(path),
        })),
      },
      {
        "@type": "Product",
        name: p.productName,
        description: p.description || p.productName,
        image: p.imageUrl ? [p.imageUrl] : [absUrl("/opengraph-image")],
        sku: `KM-${p.id}`,
        brand: { "@type": "Brand", name: brand },
        category: p.categoryName,
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "TRY",
          price: p.price.toFixed(2),
          availability:
            p.unitInStock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: SITE_NAME },
        },
        ...(p.reviewCount > 0
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: p.rating,
                reviewCount: p.reviewCount,
                bestRating: 5,
                worstRating: 1,
              },
            }
          : {}),
      },
    ],
  };
}

export function shopJsonLd(cat?: Category) {
  const url = cat
    ? absUrl(`/shop?categoryId=${cat.id}`)
    : absUrl("/shop");
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cat ? `${cat.categoryName} | ${SITE_NAME}` : `Mağaza | ${SITE_NAME}`,
    description: cat?.description || SITE_DESCRIPTION,
    url,
    isPartOf: { "@id": `${siteUrl()}/#website` },
  };
}
