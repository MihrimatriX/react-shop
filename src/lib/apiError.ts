import type { BaseResponse } from "../types/api";

const CODE_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: "Girdiğiniz bilgileri kontrol edin.",
  STOCK_INSUFFICIENT:
    "Sepetteki bir ürün için yeterli stok yok. Miktarı azaltıp tekrar deneyin.",
  PRODUCT_NOT_AVAILABLE: "Bir ürün artık satışta değil. Sepeti güncelleyin.",
  ADDRESS_NOT_OWNED: "Seçilen adres hesabınıza ait değil.",
  PAYMENT_NOT_OWNED: "Seçilen ödeme yöntemi hesabınıza ait değil.",
  ORDER_NOT_FOUND: "Sipariş bulunamadı.",
  ORDER_NOT_CANCELLABLE:
    "Bu sipariş aşamasında iptal mümkün değil (ör. kargoya verilmiş).",
  ORDER_ALREADY_CANCELLED: "Sipariş zaten iptal edilmiş.",
  RETURN_NOT_ALLOWED:
    "İade talebi yalnızca teslim edilmiş siparişler için oluşturulabilir.",
  DEMO_FULFILLMENT_DISABLED: "Lojistik simülasyonu bu sunucuda kapalı.",
  DEMO_ADVANCE_INVALID_STATE:
    "Bu sipariş için simüle edilecek sonraki adım yok.",
  CONFLICT: "Eşzamanlı işlem: bir an önce tekrar deneyin.",
  IDEMPOTENCY_CONFLICT:
    "Çift gönderim algılandı. Sipariş listesini kontrol edin.",
  INTERNAL_ERROR: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
  IDEMPOTENCY_KEY_INVALID: "Idempotency-Key geçersiz.",
  ORDER_CREATE_FAILED: "Sipariş oluşturulamadı. Bir süre sonra tekrar deneyin.",
  ORDER_CANCEL_FAILED: "İptal işlemi tamamlanamadı.",
  UNAUTHORIZED: "Oturum süresi dolmuş veya giriş gerekli. Tekrar giriş yapın.",
  FORBIDDEN: "Bu işlem için yetkiniz yok.",
  MALFORMED_REQUEST_BODY:
    "Gönderilen veri okunamadı. Sayfayı yenileyip tekrar deneyin.",
  TYPE_MISMATCH: "Geçersiz istek parametresi.",
  MISSING_PARAMETER: "Eksik parametre.",
  MISSING_PATH_VARIABLE: "Geçersiz veya eksik adres bilgisi.",
  METHOD_NOT_ALLOWED: "Bu işlem bu adreste desteklenmiyor.",
  DATA_ACCESS_ERROR:
    "Sunucu veri kaynağına erişirken sorun oluştu. Daha sonra tekrar deneyin.",
  INVALID_ARGUMENT: "Geçersiz değer.",
};

export type WithHttpStatus = BaseResponse<unknown> & { httpStatus: number };

export function userVisibleError(r: WithHttpStatus): string {
  let msg: string;
  if (r.code && CODE_MESSAGES[r.code]) msg = CODE_MESSAGES[r.code];
  else if (r.fieldErrors && Object.keys(r.fieldErrors).length > 0) {
    msg = Object.values(r.fieldErrors).join(" ");
  } else if (r.httpStatus === 0 || r.httpStatus >= 500) {
    msg =
      r.message ||
      "Bağlantı veya sunucu sorunu. Ağınızı kontrol edip tekrar deneyin.";
  } else {
    msg = r.message || r.error || `İstek tamamlanamadı (${r.httpStatus}).`;
  }
  if (r.traceId && (r.httpStatus >= 500 || r.httpStatus === 0)) {
    msg = `${msg} (Destek ref: ${r.traceId})`;
  }
  return msg;
}
