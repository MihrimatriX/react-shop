"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import type { UserSettings } from "../../types/api";
import { useAuthStore } from "../../store/authStore";

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)!;
  const qc = useQueryClient();
  const [draft, setDraft] = useState<UserSettings>({});

  const q = useQuery({
    queryKey: ["settings", user.userId],
    queryFn: async () => {
      const r = await api.settings.get(user.token, user.userId);
      if (!r.success) throw new Error(r.message);
      return r.data || {};
    },
  });

  useEffect(() => {
    if (q.data) setDraft(q.data);
  }, [q.data]);

  const save = useMutation({
    mutationFn: async () => {
      const r = await api.settings.put(user.token, user.userId, draft);
      if (!r.success) throw new Error(r.message || r.error);
      return r.data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["settings", user.userId] }),
  });

  return (
    <div>
      <h1 className="brand-serif" style={{ fontSize: "1.5rem" }}>
        Tercihler
      </h1>
      {q.isLoading ? <p>Yükleniyor…</p> : null}
      <form
        className="card"
        style={{
          padding: "1rem",
          display: "grid",
          gap: "0.75rem",
          maxWidth: 440,
        }}
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <label>
          Dil
          <select
            className="input"
            value={draft.language || "tr"}
            onChange={(e) => setDraft({ ...draft, language: e.target.value })}
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          Para birimi
          <input
            className="input"
            value={draft.currency || "TRY"}
            onChange={(e) => setDraft({ ...draft, currency: e.target.value })}
          />
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={!!draft.emailNotifications}
            onChange={(e) =>
              setDraft({ ...draft, emailNotifications: e.target.checked })
            }
          />
          E-posta bildirimleri
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={!!draft.smsNotifications}
            onChange={(e) =>
              setDraft({ ...draft, smsNotifications: e.target.checked })
            }
          />
          SMS
        </label>
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={!!draft.marketingEmails}
            onChange={(e) =>
              setDraft({ ...draft, marketingEmails: e.target.checked })
            }
          />
          Pazarlama e-postaları
        </label>
        {save.isError ? (
          <p style={{ color: "var(--danger)" }}>
            {(save.error as Error).message}
          </p>
        ) : null}
        {save.isSuccess ? (
          <p style={{ color: "var(--primary)", margin: 0 }}>Kaydedildi.</p>
        ) : null}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={save.isPending}
        >
          Kaydet
        </button>
      </form>
    </div>
  );
}
