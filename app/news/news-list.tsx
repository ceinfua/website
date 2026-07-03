"use client";

import { useState } from "react";

import type { News } from "@/app/generated/prisma/client";

export function NewsList({
  initialItems,
  initialNextCursor,
}: {
  initialItems: News[];
  initialNextCursor: string | null;
}) {
  const [items, setItems] = useState(initialItems);
  const [nextCursor, setNextCursor] = useState(initialNextCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!nextCursor) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/news?cursor=${nextCursor}`);
      const data = await res.json();
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.nextCursor);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-8">
      {items.map((item) => (
        <article key={item.id} className="border-b border-neutral-200 pb-8">
          {item.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt=""
              className="mb-4 h-48 w-full rounded object-cover"
            />
          )}
          <h2 className="text-xl font-semibold">{item.title}</h2>
          <p className="mt-2 text-neutral-600">{item.body}</p>
        </article>
      ))}

      {nextCursor && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="self-start rounded border border-neutral-300 px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Cargar más"}
        </button>
      )}
    </div>
  );
}
