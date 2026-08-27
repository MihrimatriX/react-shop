"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

export function NotificationsPage() {
  const user = useAuthStore((s) => s.user)!;
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["notifications", user.userId],
    queryFn: async () => {
      const r = await api.notifications.list(user.token, user.userId);
      if (!r.success) throw new Error(r.message);
      return r.data || [];
    },
  });

  const markAll = useMutation({
    mutationFn: () => api.notifications.markAllRead(user.token),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["notifications", user.userId] }),
  });

  const markOne = useMutation({
    mutationFn: (id: number) => api.notifications.markRead(user.token, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["notifications", user.userId] }),
  });

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 className="brand-serif" style={{ fontSize: "1.5rem" }}>
          Bildirimler
        </h1>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ fontSize: "0.85rem" }}
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending}
        >
          Tümünü okundu işaretle
        </button>
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {(q.data || []).map((n) => (
          <li
            key={n.id}
            className="card"
            style={{
              padding: "1rem",
              marginBottom: "0.5rem",
              opacity: n.isRead ? 0.65 : 1,
            }}
          >
            <strong>{n.title}</strong>
            <div style={{ fontSize: "0.9rem", marginTop: 4 }}>{n.message}</div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--muted)",
                marginTop: 4,
              }}
            >
              {n.createdAt?.replace("T", " ").slice(0, 16)}
            </div>
            {!n.isRead ? (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginTop: 8, fontSize: "0.8rem" }}
                onClick={() => markOne.mutate(n.id)}
              >
                Okundu
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {q.data && q.data.length === 0 ? <p>Bildirim yok.</p> : null}
    </div>
  );
}
