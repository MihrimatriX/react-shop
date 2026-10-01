"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent } from "react";
import { api, unwrap } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

const thisYear = new Date().getFullYear();

export function PaymentsPage() {
  const user = useAuthStore((s) => s.user)!;
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["payments"] });

  const q = useQuery({
    queryKey: ["payments"],
    queryFn: () => api.payments.list(user.token, user.userId).then(unwrap),
  });

  // Kayıtlı kartta CVV tutulmaz; form CVV istemez.
  const create = useMutation({
    mutationFn: (fd: FormData) =>
      api.payments
        .create(user.token, {
          cardHolderName: fd.get("cardHolderName"),
          cardNumber: fd.get("cardNumber"),
          expiryMonth: Number(fd.get("expiryMonth")),
          expiryYear: Number(fd.get("expiryYear")),
          isDefault: fd.get("isDefault") === "on",
        })
        .then(unwrap),
    onSuccess: refresh,
  });

  const del = useMutation({
    mutationFn: (id: number) => api.payments.delete(user.token, id).then(unwrap),
    onSuccess: refresh,
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    create.mutate(new FormData(form), { onSuccess: () => form.reset() });
  }

  return (
    <div>
      <h1 className="page-title">Ödeme yöntemleri</h1>
      <p className="notice">Demo ortamı — gerçek kart bilgisi girmeyin.</p>
      <ul className="list-plain">
        {q.data?.map((p) => (
          <li key={p.id} className="card panel row-between">
            <span>
              {p.cardNumber} {p.isDefault ? <span className="badge">varsayılan</span> : null}
              <span className="muted small block">
                {p.cardHolderName} · {String(p.expiryMonth).padStart(2, "0")}/{p.expiryYear}
              </span>
            </span>
            <button type="button" className="btn btn-ghost btn-sm" disabled={del.isPending} onClick={() => del.mutate(p.id)}>
              Sil
            </button>
          </li>
        ))}
      </ul>

      <h2>Yeni kart</h2>
      <form className="card panel form-grid narrow-form" onSubmit={onSubmit}>
        <label>
          Kart üzerindeki isim
          <input className="input" name="cardHolderName" autoComplete="off" required />
        </label>
        <label>
          Kart numarası
          <input className="input" name="cardNumber" inputMode="numeric" autoComplete="off" minLength={12} maxLength={23} required />
        </label>
        <div className="form-2col">
          <label>
            Ay
            <input className="input" name="expiryMonth" type="number" min={1} max={12} defaultValue={12} required />
          </label>
          <label>
            Yıl
            <input className="input" name="expiryYear" type="number" min={thisYear} max={thisYear + 20} defaultValue={thisYear + 2} required />
          </label>
        </div>
        <label className="check">
          <input type="checkbox" name="isDefault" defaultChecked />
          Varsayılan kart yap
        </label>
        {create.isError ? <p className="error">{create.error.message}</p> : null}
        <button type="submit" className="btn btn-primary" disabled={create.isPending}>
          Kaydet
        </button>
      </form>
    </div>
  );
}
