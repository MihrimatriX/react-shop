"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

export function AddressesPage() {
  const user = useAuthStore((s) => s.user)!;
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "Ev",
    fullAddress: "",
    city: "",
    district: "",
    postalCode: "",
    country: "Turkey",
    phoneNumber: "",
    isDefault: false,
  });

  const q = useQuery({
    queryKey: ["addresses", user.userId],
    queryFn: async () => {
      const r = await api.addresses.list(user.token, user.userId);
      if (!r.success) throw new Error(r.message);
      return r.data || [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const r = await api.addresses.create(user.token, form);
      if (!r.success) throw new Error(r.message || r.error);
      return r.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["addresses", user.userId] });
      setForm((f) => ({
        ...f,
        fullAddress: "",
        city: "",
        district: "",
        postalCode: "",
      }));
    },
  });

  const del = useMutation({
    mutationFn: (id: number) => api.addresses.delete(user.token, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["addresses", user.userId] }),
  });

  return (
    <div>
      <h1 className="brand-serif" style={{ fontSize: "1.5rem" }}>
        Adresler
      </h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {(q.data || []).map((a) => (
          <li
            key={a.id}
            className="card"
            style={{ padding: "1rem", marginBottom: "0.75rem" }}
          >
            <strong>{a.title}</strong>{" "}
            {a.isDefault ? <span className="badge">varsayılan</span> : null}
            <div style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              {a.fullAddress}, {a.district}/{a.city} {a.postalCode}
            </div>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginTop: 8, fontSize: "0.8rem" }}
              onClick={() => del.mutate(a.id)}
            >
              Sil
            </button>
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: "1.1rem" }}>Yeni adres</h2>
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
          placeholder="Başlık (Ev, Ofis)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="input"
          required
          placeholder="Açık adres"
          rows={2}
          value={form.fullAddress}
          onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
        />
        <input
          className="input"
          required
          placeholder="İlçe"
          value={form.district}
          onChange={(e) => setForm({ ...form, district: e.target.value })}
        />
        <input
          className="input"
          required
          placeholder="Şehir"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />
        <input
          className="input"
          required
          placeholder="Posta kodu"
          value={form.postalCode}
          onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
        />
        <input
          className="input"
          placeholder="Telefon"
          value={form.phoneNumber}
          onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
        />
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
          />
          Varsayılan adres
        </label>
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
