"use client";

import { useState, type SubmitEvent } from "react";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setError("Las contraseñas nuevas no coinciden");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo actualizar la contraseña");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <label className="text-sm text-neutral-500">
        Contraseña actual
        <input
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </label>
      <label className="text-sm text-neutral-500">
        Contraseña nueva
        <input
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </label>
      <label className="text-sm text-neutral-500">
        Confirmar contraseña nueva
        <input
          className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
          type="password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Contraseña actualizada</p>}
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {submitting ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
