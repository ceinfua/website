"use client";

import { useState } from "react";

import type { News } from "@/app/generated/prisma/client";

export function NewsForm({
  news,
  onDone,
  onCancel,
}: {
  news?: News;
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
      const res = await fetch(news ? `/api/admin/news/${news.id}` : "/api/admin/news", {
        method: news ? "PATCH" : "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Error al guardar la noticia");
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
          defaultValue={news?.title}
          required
          className="rounded border border-neutral-300 px-2 py-1"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cuerpo
        <textarea
          name="body"
          defaultValue={news?.body}
          required
          rows={4}
          className="rounded border border-neutral-300 px-2 py-1"
        />
      </label>

      {news?.imageUrl && !removeImage && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={news.imageUrl} alt="" className="h-16 w-16 rounded object-cover" />
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
          {news ? "Guardar" : "Publicar"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-neutral-600">
          Cancelar
        </button>
      </div>
    </form>
  );
}
