import { prisma } from "@/lib/prisma";
import { NewsList } from "./news-list";

const PAGE_SIZE = 10;

export async function NewsPage() {
  const items = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
  });

  const nextCursor = items.length === PAGE_SIZE ? items[items.length - 1].id : null;

  return (
    <div className="px-6 py-16">
      <h1 className="text-3xl font-bold">Novedades</h1>

      {items.length === 0 ? (
        <p className="mt-4 text-neutral-600">Todavía no hay novedades.</p>
      ) : (
        <NewsList initialItems={items} initialNextCursor={nextCursor} />
      )}
    </div>
  );
}

export default NewsPage;
