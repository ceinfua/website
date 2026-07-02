"use client";

import { Suspense, useState, type SubmitEvent } from "react";
import { useSearchParams } from "next/navigation";

function ClaimAccountForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/claim-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo activar la cuenta");
        return;
      }

      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold">Enlace inválido</h1>
        <p className="mt-4 text-neutral-600">Falta el token de activación en el enlace.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold">Cuenta activada</h1>
        <p className="mt-4 text-neutral-600">
          Ya puedes <a href="/login" className="underline">iniciar sesión</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Activa tu cuenta</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          className="rounded border border-neutral-300 px-3 py-2"
          placeholder="Nueva contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Activando..." : "Activar cuenta"}
        </button>
      </form>
    </div>
  );
}

export function ClaimAccountPage() {
  return (
    <Suspense fallback={null}>
      <ClaimAccountForm />
    </Suspense>
  );
}

export default ClaimAccountPage;
