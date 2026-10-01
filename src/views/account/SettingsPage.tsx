"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, unwrap } from "../../lib/api";
import type { UserSettings } from "../../types/api";
import { useAuthStore } from "../../store/authStore";

const TOGGLES: [keyof UserSettings, string][] = [
  ["emailNotifications", "E-posta bildirimleri"],
  ["smsNotifications", "SMS bildirimleri"],
  ["marketingEmails", "Kampanya e-postaları"],
];

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)!;
  const qc = useQueryClient();
  // Kullanıcı bir şey değiştirene kadar sunucu verisi gösterilir; effect ile kopyalamaya gerek yok.
  const [draft, setDraft] = useState<UserSettings | null>(null);

  const q = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.settings.get(user.token, user.userId).then(unwrap),
  });
  const value = draft ?? q.data ?? {};
  const edit = (patch: UserSettings) => setDraft({ ...value, ...patch });

  const save = useMutation({
    mutationFn: () => api.settings.put(user.token, user.userId, value).then(unwrap),
    onSuccess: (s) => {
      qc.setQueryData(["settings"], s);
      setDraft(null);
    },
  });

  return (
    <div>
      <h1 className="page-title">Tercihler</h1>
      <form
        className="card panel form-grid narrow-form"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <label>
          Dil
          <select className="input" value={value.language ?? "tr"} onChange={(e) => edit({ language: e.target.value })}>
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
        </label>
        {TOGGLES.map(([key, label]) => (
          <label key={key} className="check">
            <input type="checkbox" checked={!!value[key]} onChange={(e) => edit({ [key]: e.target.checked })} />
            {label}
          </label>
        ))}
        {save.isError ? <p className="error">{save.error.message}</p> : null}
        {save.isSuccess && !draft ? <p className="success">Kaydedildi.</p> : null}
        <button type="submit" className="btn btn-primary" disabled={save.isPending || !q.data}>
          Kaydet
        </button>
      </form>
    </div>
  );
}
