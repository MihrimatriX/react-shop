"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { api, unwrap } from "../lib/api";
import { useAuthStore } from "../store/authStore";

/** Açık yönlendirmeyi önler: yalnızca site içi yol kabul edilir. */
function safeFrom(from: string | null) {
  return from?.startsWith("/") && !from.startsWith("//") && !from.startsWith("/login") ? from : "/";
}

export function LoginPage() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const from = safeFrom(useSearchParams().get("from"));

  const login = useMutation({
    mutationFn: (fd: FormData) => api.auth.login(String(fd.get("email")), String(fd.get("password"))).then(unwrap),
    onSuccess: (u) => {
      setUser(u);
      router.replace(from);
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    login.mutate(new FormData(e.currentTarget));
  }

  return (
    <div className="container page auth-page">
      <h1 className="page-title">Giriş</h1>
      <form onSubmit={onSubmit} className="card panel form-grid">
        <label>
          E-posta
          <input className="input" name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Şifre
          <input className="input" name="password" type="password" autoComplete="current-password" required />
        </label>
        {login.isError ? <p className="error">{login.error.message}</p> : null}
        <button type="submit" className="btn btn-primary" disabled={login.isPending}>
          Giriş yap
        </button>
        <p className="muted small">
          Hesabın yok mu? <Link href="/register">Kayıt ol</Link>
        </p>
        <p className="muted small">Demo: demo@kapidamart.com / demo123</p>
      </form>
    </div>
  );
}
