"use client";

import { useMutation } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { api, unwrap } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

export function SecurityPage() {
  const user = useAuthStore((s) => s.user)!;

  const change = useMutation({
    mutationFn: (fd: FormData) =>
      api.security
        .changePassword(user.token, {
          currentPassword: String(fd.get("currentPassword")),
          newPassword: String(fd.get("newPassword")),
          confirmPassword: String(fd.get("confirmPassword")),
        })
        .then(unwrap),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    change.mutate(new FormData(form), { onSuccess: () => form.reset() });
  }

  return (
    <div>
      <h1 className="page-title">Güvenlik</h1>
      <form className="card panel form-grid narrow-form" onSubmit={onSubmit}>
        <label>
          Mevcut şifre
          <input className="input" name="currentPassword" type="password" autoComplete="current-password" required />
        </label>
        <label>
          Yeni şifre
          <input className="input" name="newPassword" type="password" autoComplete="new-password" minLength={6} required />
        </label>
        <label>
          Yeni şifre (tekrar)
          <input className="input" name="confirmPassword" type="password" autoComplete="new-password" minLength={6} required />
        </label>
        {change.isError ? <p className="error">{change.error.message}</p> : null}
        {change.isSuccess ? <p className="success">Şifre güncellendi.</p> : null}
        <button type="submit" className="btn btn-primary" disabled={change.isPending}>
          Şifreyi değiştir
        </button>
      </form>
      <p className="muted small">Oturum: {user.email}</p>
    </div>
  );
}
