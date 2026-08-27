"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AccountLayout } from "@/views/account/AccountLayout";

export function AccountShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AccountLayout>{children}</AccountLayout>
    </ProtectedRoute>
  );
}
