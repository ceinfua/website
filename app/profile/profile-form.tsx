"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import type { FullStudentView } from "@/lib/authz";

const ESTADOS = ["ACTIVO", "EGRESADO", "INACTIVO"];

export function ProfileForm({
  student,
  studentId,
}: {
  student: FullStudentView;
  studentId: string;
}) {
  const router = useRouter();
  const [telefono, setTelefono] = useState(student.telefono);
  const [estado, setEstado] = useState(student.estado);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono, estado }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo actualizar el perfil");
        return;
      }

      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      <dl className="grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-neutral-500">Nombre</dt>
        <dd>{student.nombre} {student.apellido}</dd>
        <dt className="text-neutral-500">Cedula</dt>
        <dd>{student.cedula}</dd>
        <dt className="text-neutral-500">Correo</dt>
        <dd>{student.correo}</dd>
        <dt className="text-neutral-500">Carrera</dt>
        <dd>{student.carrera}</dd>
        <dt className="text-neutral-500">Ano de ingreso</dt>
        <dd>{student.anioIngreso}</dd>
      </dl>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="text-sm text-neutral-500">
          Telefono
          <input
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />
        </label>
        <label className="text-sm text-neutral-500">
          Estado
          <select
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
            value={estado}
            onChange={(e) => setEstado(e.target.value as typeof estado)}
          >
            {ESTADOS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </form>
    </div>
  );
}
