import { ImageResponse } from "next/og";
import { PRODUCTS } from "@/server/catalog";
import { formatTry } from "@/lib/format";
import { SITE_NAME } from "@/lib/site";
import { unitPriceAfterDiscount } from "@/store/cartStore";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "KapıdaMart ürün";

export default async function ProductOgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = PRODUCTS.find((x) => x.id === Number(id));
  const name = p?.productName ?? "Ürün";
  const cat = p?.categoryName ?? SITE_NAME;
  const price = p ? formatTry(unitPriceAfterDiscount(p)) : "";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#fff5eb",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#f27a1a",
              color: "#fff",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            K
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 800,
              color: "#1a1a1a",
            }}
          >
            {SITE_NAME}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 22,
            fontWeight: 700,
            color: "#f27a1a",
            textTransform: "uppercase",
          }}
        >
          {cat}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 12,
            fontSize: 48,
            fontWeight: 800,
            color: "#1a1a1a",
            lineHeight: 1.2,
          }}
        >
          {name}
        </div>
        {price ? (
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 40,
              fontWeight: 800,
              color: "#f27a1a",
            }}
          >
            {price}
          </div>
        ) : null}
      </div>
    ),
    size,
  );
}
