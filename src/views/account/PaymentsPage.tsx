"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

export function PaymentsPage() {
  const user = useAuthStore((s) => s.user)!;
  const qc = useQueryClient();
  const [form, setForm] = useState({
    type: "CREDIT_CARD",
    cardHolderName: "",
    cardNumber: "",
    expiryMonth: 12,
    expiryYear: 2028,
    cvv: "000",
    isDefault: true,
  });

  const q = useQuery({
    queryKey: ["payments", user.userId],
    queryFn: async () => {
      const r = await api.payments.list(user.token, user.userId);
      if (!r.success) throw new Error(r.message);
      return r.data || [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const r = await api.payments.create(user.token, form);
      if (!r.success) throw new Error(r.message || r.error);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments", user.userId] });
      setForm((f) => ({ ...f, cardNumber: "", cardHolderName: "" }));
    },
  });

  const del = useMutation({
    mutationFn: (id: number) => api.payments.delete(user.token, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["payments", user.userId] }),
  });

  return (
    <div>
      <h1 className="brand-serif" style={{ fontSize: "1.5rem" }}>
        Ödeme yöntemleri
      </h1>
      <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
        Demo ortamı — gerçek kart bilgisi kullanmayın.
      </p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {(q.data || []).map((p) => (
          <li
            key={p.id}
            className="card"
            style={{ padding: "1rem", marginBottom: "0.75rem" }}
          >
            <strong>{p.type}</strong> {p.cardNumber}{" "}
            {p.isDefault ? <span className="badge">varsayılan</span> : null}
            <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
              {p.cardHolderName}
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: 8, fontSize: "0.8rem" }}
              onClick={() => del.mutate(p.id)}
            >
              Sil
            </button>
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: "1.1rem" }}>Yeni kart</h2>
      <form
        className="card"
        style={{
          padding: "1rem",
          display: "grid",
          gap: "0.5rem",
          maxWidth: 480,
        }}
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
      >
        <input
          className="input"
          required
          placeholder="Kart üzerindeki isim"
          value={form.cardHolderName}
          onChange={(e) => setForm({ ...form, cardHolderName: e.target.value })}
        />
        <input
          className="input"
          required
          placeholder="Kart numarası"
          maxLength={20}
          value={form.cardNumber}
          onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
        />
        <div className="form-3col">
          <input
            className="input"
            type="number"
            min={1}
            max={12}
            value={form.expiryMonth}
            onChange={(e) =>
              setForm({ ...form, expiryMonth: Number(e.target.value) })
            }
          />
          <input
            className="input"
            type="number"
            min={2026}
            max={2050}
            value={form.expiryYear}
            onChange={(e) =>
              setForm({ ...form, expiryYear: Number(e.target.value) })
            }
          />
          <input
            className="input"
            placeholder="CVV"
            value={form.cvv}
            onChange={(e) => setForm({ ...form, cvv: e.target.value })}
          />
        </div>
        {create.isError ? (
          <p style={{ color: "var(--danger)", margin: 0 }}>
            {(create.error as Error).message}
          </p>
        ) : null}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={create.isPending}
        >
          Kaydet
        </button>
      </form>
    </div>
  );
}
