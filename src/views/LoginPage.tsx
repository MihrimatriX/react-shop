"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const setUser = useAuthStore((s) => s.setUser);
  const router = useRouter();
  const qc = useQueryClient();
  const sp = useSearchParams();
  const from = sp.get("from") || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await api.auth.login(email, password);
    if (!r.success || !r.data) {
      setErr(r.message || r.error || "Giriş başarısız");
      return;
    }
    const d = r.data;
    setUser({
      token: d.token,
      userId: d.userId,
      email: d.email,
      firstName: d.firstName,
      lastName: d.lastName,
      isEmailVerified: d.isEmailVerified,
    });
    void qc.invalidateQueries({ queryKey: ["cart"] });
    router.replace(from.startsWith("/login") ? "/" : from);
  }

  return (
    <div className="container" style={{ maxWidth: 420, paddingBlock: "2.5rem 3rem" }}>
      <h1 className="brand-serif" style={{ fontSize: "2rem" }}>
        Giriş
      </h1>
      <form
        onSubmit={onSubmit}
        className="card"
        style={{ padding: "1.5rem", display: "grid", gap: "0.85rem" }}
      >
        <label>
          E-posta
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Şifre
          <input
            className="input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {err ? (
          <p style={{ color: "var(--danger)", margin: 0, fontSize: "0.9rem" }}>
            {err}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary">
          Giriş yap
        </button>
        <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--muted)" }}>
          Hesabın yok mu? <Link href="/register">Kayıt ol</Link>
        </p>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>
          Demo: demo@kapidamart.com / demo123
        </p>
      </form>
    </div>
  );
}
