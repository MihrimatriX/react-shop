"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";

export function RegisterPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [err, setErr] = useState("");
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const qc = useQueryClient();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await api.auth.register(form);
    if (!r.success || !r.data) {
      setErr(r.message || r.error || "Kayıt başarısız");
      return;
    }
    const d = r.data;
    setUser({
      token: d.token,
      userId: d.userId,
      email: d.email,
      firstName: d.firstName,
      lastName: d.lastName,
    });
    void qc.invalidateQueries({ queryKey: ["cart"] });
    router.replace("/account/addresses");
  }

  return (
    <div className="container" style={{ maxWidth: 480, paddingBlock: "2.5rem 3rem" }}>
      <h1 className="brand-serif" style={{ fontSize: "2rem" }}>
        Kayıt ol
      </h1>
      <form
        onSubmit={onSubmit}
        className="card"
        style={{ padding: "1.5rem", display: "grid", gap: "0.75rem" }}
      >
        <div className="form-2col">
          <label>
            Ad
            <input
              className="input"
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
          </label>
          <label>
            Soyad
            <input
              className="input"
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </label>
        </div>
        <label>
          E-posta
          <input
            className="input"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Şifre (min 6)
          <input
            className="input"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        <label>
          Telefon
          <input
            className="input"
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
        </label>
        <label>
          Adres
          <input
            className="input"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </label>
        <div className="form-2col">
          <label>
            Şehir
            <input
              className="input"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </label>
          <label>
            Posta kodu
            <input
              className="input"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
            />
          </label>
        </div>
        {err ? (
          <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>
            {err}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary">
          Hesap oluştur
        </button>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)" }}>
          Zaten üye misin? <Link href="/login">Giriş</Link>
        </p>
      </form>
    </div>
  );
}
