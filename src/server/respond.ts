import { NextResponse } from "next/server";

const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Oturum süresi dolmuş veya giriş gerekli. Tekrar giriş yapın.",
  FORBIDDEN: "Bu işlem için yetkiniz yok.",
  NOT_FOUND: "Bu işlem bu adreste desteklenmiyor.",
  EMAIL_TAKEN: "Bu e-posta zaten kayıtlı.",
  PRODUCT_NOT_FOUND: "Ürün bulunamadı.",
  PRODUCT_NOT_AVAILABLE: "Bir ürün artık satışta değil. Sepeti güncelleyin.",
  STOCK_INSUFFICIENT: "Yeterli stok yok. Miktarı azaltıp tekrar deneyin.",
  NOT_IN_CART: "Ürün sepette değil.",
  CART_EMPTY: "Sepetiniz boş.",
  ADDRESS_NOT_OWNED: "Seçilen adres hesabınıza ait değil.",
  PAYMENT_NOT_OWNED: "Seçilen ödeme yöntemi hesabınıza ait değil.",
  ORDER_NOT_FOUND: "Sipariş bulunamadı.",
  ORDER_NOT_CANCELLABLE: "Bu aşamada iptal mümkün değil (ör. kargoya verilmiş).",
  RETURN_NOT_ALLOWED: "İade talebi yalnızca teslim edilmiş siparişler için oluşturulabilir.",
  DEMO_ADVANCE_INVALID_STATE: "Bu sipariş için simüle edilecek sonraki adım yok.",
  NOTIFICATION_NOT_FOUND: "Bildirim bulunamadı.",
};

export function ok<T>(data: T) {
  return NextResponse.json({ success: true, data });
}

export function fail(code: string, status = 409, message = MESSAGES[code] ?? code) {
  return NextResponse.json({ success: false, code, message }, { status });
}
