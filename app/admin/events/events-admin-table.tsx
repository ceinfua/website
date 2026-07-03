"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Event } from "@/app/generated/prisma/client";
import { EventForm } from "./event-form";

export function EventsAdminTable({ initialEvents }: { initialEvents: Event[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setErrors((prev) => ({ ...prev, [id]: "" }));
    setPending(id);

    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrors((prev) => ({ ...prev, [id]: data.error ?? "Error al eliminar" }));
        return;
      }

      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      {creating ? (
        <EventForm
          onDone={() => {
            setCreating(false);
            router.refresh();
          }}
          onCancel={() => setCreating(false)}
        />
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="mt-4 rounded bg-neutral-900 px-3 py-1 text-sm text-white"
        >
          Agregar evento
        </button>
      )}

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="py-2 pr-4">Título</th>
            <th className="py-2 pr-4">Fecha</th>
            <th className="py-2 pr-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {initialEvents.map((item) => (
            <tr key={item.id} className="border-b border-neutral-100 align-top">
              <td className="py-2 pr-4">{item.title}</td>
              <td className="py-2 pr-4">
                {item.date.toLocaleString("es", { dateStyle: "medium", timeStyle: "short" })}
              </td>
              <td className="py-2 pr-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                    className="text-xs text-neutral-700 underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={pending === item.id}
                    className="text-xs text-red-600 underline"
                  >
                    Eliminar
                  </button>
                </div>
                {errors[item.id] && (
                  <p className="mt-1 text-xs text-red-600">{errors[item.id]}</p>
                )}
                {editingId === item.id && (
                  <EventForm
                    event={item}
                    onDone={() => {
                      setEditingId(null);
                      router.refresh();
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
