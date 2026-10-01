"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, unwrap } from "../../lib/api";
import { formatDate } from "../../lib/format";
import { useAuthStore } from "../../store/authStore";

export function NotificationsPage() {
  const user = useAuthStore((s) => s.user)!;
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.notifications.list(user.token, user.userId).then(unwrap),
  });

  const mark = useMutation({
    mutationFn: (id?: number) =>
      (id === undefined ? api.notifications.markAllRead(user.token) : api.notifications.markRead(user.token, id)).then(unwrap),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return (
    <div>
      <div className="row-between">
        <h1 className="page-title">Bildirimler</h1>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => mark.mutate(undefined)} disabled={mark.isPending}>
          Tümünü okundu işaretle
        </button>
      </div>
      {q.data?.length === 0 ? <p className="muted">Bildirim yok.</p> : null}
      <ul className="list-plain">
        {q.data?.map((n) => (
          <li key={n.id} className={`card panel notification${n.isRead ? " is-read" : ""}`}>
            <strong>{n.title}</strong>
            <p>{n.message}</p>
            <div className="row-between">
              <span className="muted small">{formatDate(n.createdAt)}</span>
              {!n.isRead ? (
                <button type="button" className="btn btn-ghost btn-sm" disabled={mark.isPending} onClick={() => mark.mutate(n.id)}>
                  Okundu
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
