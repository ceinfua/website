"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const CARRERAS = [
  { value: "INGENIERIA_INFORMATICA", label: "Ingenieria Informatica" },
  { value: "LICENCIATURA_ANALISIS_SISTEMAS", label: "Licenciatura en Analisis de Sistemas" },
];

export function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    correo: "",
    telefono: "+595",
    carrera: CARRERAS[0].value,
    anioIngreso: new Date().getFullYear(),
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo completar el registro");
        return;
      }

      setSuccess(true);
      router.refresh();
    } catch {
      setError("Algo salio mal. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold">Revisa tu correo</h1>
        <p className="mt-4 text-neutral-600">
          Te enviamos un enlace de verificacion. Confirma tu correo para poder iniciar sesion.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Registro de estudiante</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <input
          className="rounded border border-neutral-300 px-3 py-2"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          className="rounded border border-neutral-300 px-3 py-2"
          placeholder="Apellido"
          value={form.apellido}
          onChange={(e) => setForm({ ...form, apellido: e.target.value })}
          required
        />
        <input
          className="rounded border border-neutral-300 px-3 py-2"
          placeholder="Cedula"
          value={form.cedula}
          onChange={(e) => setForm({ ...form, cedula: e.target.value })}
          required
        />
        <input
          className="rounded border border-neutral-300 px-3 py-2"
          placeholder="Correo"
          type="email"
          value={form.correo}
          onChange={(e) => setForm({ ...form, correo: e.target.value })}
          required
        />
        <input
          className="rounded border border-neutral-300 px-3 py-2"
          placeholder="Telefono"
          value={form.telefono}
          onChange={(e) => setForm({ ...form, telefono: e.target.value })}
          required
        />
        <select
          className="rounded border border-neutral-300 px-3 py-2"
          value={form.carrera}
          onChange={(e) => setForm({ ...form, carrera: e.target.value })}
        >
          {CARRERAS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <input
          className="rounded border border-neutral-300 px-3 py-2"
          placeholder="Ano de ingreso"
          type="number"
          value={form.anioIngreso}
          onChange={(e) => setForm({ ...form, anioIngreso: Number(e.target.value) })}
          required
        />
        <input
          className="rounded border border-neutral-300 px-3 py-2"
          placeholder="Contrasena"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          minLength={8}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Registrarme"}
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
