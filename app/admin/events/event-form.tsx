"use client";

import { useState } from "react";

import type { Event } from "@/app/generated/prisma/client";

function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function EventForm({
  event,
  onDone,
  onCancel,
}: {
  event?: Event;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(e.currentTarget);
    if (removeImage) {
      formData.set("removeImage", "true");
    }

    try {
      const res = await fetch(event ? `/api/admin/events/${event.id}` : "/api/admin/events", {
        method: event ? "PATCH" : "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al guardar el evento");
        return;
      }

      onDone();
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-3 rounded border border-neutral-200 p-4"
    >
      <label className="flex flex-col gap-1 text-sm">
        Título
        <input
          name="title"
          defaultValue={event?.title}
          required
          className="rounded border border-neutral-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Descripción
        <textarea
          name="description"
          defaultValue={event?.description}
          required
          rows={4}
          className="rounded border border-neutral-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Fecha
        <input
          name="date"
          type="datetime-local"
          defaultValue={event ? toDatetimeLocal(event.date) : undefined}
          required
          className="rounded border border-neutral-300 px-2 py-1"
        />
      </label>

      {event?.imageUrl && !removeImage && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.imageUrl} alt="" className="h-16 w-16 rounded object-cover" />
          <button
            type="button"
            onClick={() => setRemoveImage(true)}
            className="text-xs text-red-600"
          >
            Quitar imagen
          </button>
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm">
        Imagen (opcional)
        <input name="image" type="file" accept="image/png,image/jpeg,image/webp" />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-neutral-900 px-3 py-1 text-sm text-white disabled:opacity-50"
        >
          {event ? "Guardar" : "Publicar"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-neutral-600">
          Cancelar
        </button>
      </div>
    </form>
  );
}
