"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { api, unwrap } from "../lib/api";
import { useAuthStore } from "../store/authStore";

export function RegisterPage() {
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();

  const register = useMutation({
    mutationFn: (body: Record<string, string>) => api.auth.register(body).then(unwrap),
    onSuccess: (u) => {
      setUser(u);
      router.replace("/account/addresses");
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    register.mutate(Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>);
  }

  return (
    <div className="container page auth-page">
      <h1 className="page-title">Kayıt ol</h1>
      <form onSubmit={onSubmit} className="card panel form-grid">
        <div className="form-2col">
          <label>
            Ad
            <input className="input" name="firstName" autoComplete="given-name" required />
          </label>
          <label>
            Soyad
            <input className="input" name="lastName" autoComplete="family-name" required />
          </label>
        </div>
        <label>
          E-posta
          <input className="input" name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Şifre (en az 6 karakter)
          <input className="input" name="password" type="password" autoComplete="new-password" minLength={6} required />
        </label>
        <label>
          Telefon
          <input className="input" name="phoneNumber" type="tel" autoComplete="tel" />
        </label>
        <label>
          Adres
          <input className="input" name="address" autoComplete="street-address" />
        </label>
        <div className="form-2col">
          <label>
            Şehir
            <input className="input" name="city" autoComplete="address-level1" />
          </label>
          <label>
            Posta kodu
            <input className="input" name="postalCode" autoComplete="postal-code" />
          </label>
        </div>
        {register.isError ? <p className="error">{register.error.message}</p> : null}
        <button type="submit" className="btn btn-primary" disabled={register.isPending}>
          Hesap oluştur
        </button>
        <p className="muted small">
          Zaten üye misin? <Link href="/login">Giriş</Link>
        </p>
      </form>
    </div>
  );
}
