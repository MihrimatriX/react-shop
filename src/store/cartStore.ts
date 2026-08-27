import type { CartDto, CartItemDto, Product } from "../types/api";

export function unitPriceAfterDiscount(p: Product): number {
  const base = Number(p.unitPrice);
  const d = p.discount && p.discount > 0 ? (base * p.discount) / 100 : 0;
  return Math.round((base - d) * 100) / 100;
}

export interface CartLineView {
  productId: number;
  quantity: number;
  product: Product;
}

export function cartItemDtoToProduct(row: CartItemDto): Product {
  return {
    id: row.productId,
    productName: row.productName || "",
    unitPrice: Number(row.unitPrice ?? 0),
    unitInStock: row.unitInStock ?? 0,
    quantityPerUnit: row.quantityPerUnit || "1 adet",
    categoryId: 0,
    imageUrl: row.productImageUrl,
    discount: row.discount ?? 0,
  };
}

export function cartLinesFromDto(d: CartDto | undefined): CartLineView[] {
  if (!d?.items?.length) return [];
  return d.items.map((row) => ({
    productId: row.productId,
    quantity: row.quantity,
    product: cartItemDtoToProduct(row),
  }));
}

export function cartTotalQty(items: { quantity: number }[]): number {
  return items.reduce((a, l) => a + l.quantity, 0);
}

export function cartSubtotal(lines: CartLineView[]): number {
  return (
    Math.round(
      lines.reduce(
        (a, l) => a + unitPriceAfterDiscount(l.product) * l.quantity,
        0,
      ) * 100,
    ) / 100
  );
}
