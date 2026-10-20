"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { api, unwrap } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

export function AddressesPage() {
  const user = useAuthStore((s) => s.user)!;
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["addresses"] });

  const q = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.addresses.list(user.token, user.userId).then(unwrap),
  });

  const create = useMutation({
    mutationFn: (fd: FormData) =>
      api.addresses
        .create(user.token, {
          title: String(fd.get("title")),
          fullAddress: String(fd.get("fullAddress")),
          district: String(fd.get("district")),
          city: String(fd.get("city")),
          postalCode: String(fd.get("postalCode")),
          phoneNumber: String(fd.get("phoneNumber")),
          isDefault: fd.get("isDefault") === "on",
        })
        .then(unwrap),
    onSuccess: refresh,
  });

  const del = useMutation({
    mutationFn: (id: number) => api.addresses.delete(user.token, id).then(unwrap),
    onSuccess: refresh,
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    create.mutate(new FormData(form), { onSuccess: () => form.reset() });
  }

  return (
    <div>
      <h1 className="page-title">Adresler</h1>
      <ul className="list-plain">
        {q.data?.map((a) => (
          <li key={a.id} className="card panel row-between">
            <span>
              <strong>{a.title}</strong> {a.isDefault ? <span className="badge">varsayılan</span> : null}
              <span className="muted small block">
                {a.fullAddress}, {a.district}/{a.city} {a.postalCode}
              </span>
            </span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={del.isPending} onClick={() => del.mutate(a.id)}>
              Sil
            </button>
          </li>
        ))}
      </ul>

      <h2>Yeni adres</h2>
      <form className="card panel form-grid narrow-form" onSubmit={onSubmit}>
        <input className="input" name="title" placeholder="Başlık (Ev, Ofis)" defaultValue="Ev" aria-label="Başlık" />
        <textarea className="input" name="fullAddress" required placeholder="Açık adres" rows={2} aria-label="Açık adres" />
        <div className="form-2col">
          <input className="input" name="district" required placeholder="İlçe" aria-label="İlçe" />
          <input className="input" name="city" required placeholder="Şehir" aria-label="Şehir" />
        </div>
        <div className="form-2col">
          <input className="input" name="postalCode" required placeholder="Posta kodu" aria-label="Posta kodu" />
          <input className="input" name="phoneNumber" type="tel" placeholder="Telefon" aria-label="Telefon" />
        </div>
        <label className="check">
          <input type="checkbox" name="isDefault" />
          Varsayılan adres
        </label>
        {create.isError ? <p className="error">{create.error.message}</p> : null}
        <button type="submit" className="btn btn-primary" disabled={create.isPending}>
          Kaydet
        </button>
      </form>
    </div>
  );
}
