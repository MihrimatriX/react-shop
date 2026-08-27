"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../lib/api";
import { useAuthStore } from "../../store/authStore";

export function SecurityPage() {
  const user = useAuthStore((s) => s.user)!;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");

  const m = useMutation({
    mutationFn: async () => {
      const r = await api.security.changePassword(
        user.token,
        currentPassword,
        newPassword,
        confirmPassword,
      );
      if (!r.success) throw new Error(r.message || r.error);
      return r.data;
    },
    onSuccess: () => {
      setMsg("Şifre güncellendi.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (e: Error) => setMsg(e.message),
  });

  return (
    <div>
      <h1 className="brand-serif" style={{ fontSize: "1.5rem" }}>
        Güvenlik
      </h1>
      <form
        className="card"
        style={{
          padding: "1rem",
          display: "grid",
          gap: "0.65rem",
          maxWidth: 400,
        }}
        onSubmit={(e) => {
          e.preventDefault();
          setMsg("");
          m.mutate();
        }}
      >
        <input
          className="input"
          type="password"
          required
          placeholder="Mevcut şifre"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          className="input"
          type="password"
          required
          placeholder="Yeni şifre"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          className="input"
          type="password"
          required
          placeholder="Yeni şifre tekrar"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {msg ? (
          <p
            style={{
              margin: 0,
              color: msg.includes("güncellendi")
                ? "var(--primary)"
                : "var(--danger)",
            }}
          >
            {msg}
          </p>
        ) : null}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={m.isPending}
        >
          Şifreyi değiştir
        </button>
      </form>
      <p style={{ fontSize: "0.85rem", color: "var(--muted)", maxWidth: 400 }}>
        Oturum: {user.email}
      </p>
    </div>
  );
}
