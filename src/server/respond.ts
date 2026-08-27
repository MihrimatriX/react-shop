import { NextResponse } from "next/server";

export function ok<T>(data: T, message = "İşlem başarılı", status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function fail(
  message: string,
  status = 400,
  extra?: { code?: string; fieldErrors?: Record<string, string> },
) {
  return NextResponse.json(
    { success: false, message, error: message, ...extra },
    { status },
  );
}
