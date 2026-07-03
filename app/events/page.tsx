import { prisma } from "@/lib/prisma";
import { EventList } from "./event-list";

const PAGE_SIZE = 10;

export async function EventsPage() {
  const now = new Date();

  const [upcoming, past] = await Promise.all([
    prisma.event.findMany({
      where: { date: { gte: now } },
      orderBy: { date: "asc" },
      take: PAGE_SIZE,
    }),
    prisma.event.findMany({
      where: { date: { lt: now } },
      orderBy: { date: "desc" },
      take: PAGE_SIZE,
    }),
  ]);

  const upcomingNextCursor = upcoming.length === PAGE_SIZE ? upcoming[upcoming.length - 1].id : null;
  const pastNextCursor = past.length === PAGE_SIZE ? past[past.length - 1].id : null;

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <div className="px-6 py-16">
        <h1 className="text-3xl font-bold">Eventos</h1>
        <p className="mt-4 text-neutral-600">Todavía no hay eventos.</p>
      </div>
    );
  }

  return (
    <div className="px-6 py-16">
      <h1 className="text-3xl font-bold">Eventos</h1>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Próximos eventos</h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-neutral-600">No hay eventos próximos.</p>
        ) : (
          <EventList when="upcoming" initialItems={upcoming} initialNextCursor={upcomingNextCursor} />
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold">Eventos pasados</h2>
        {past.length === 0 ? (
          <p className="mt-4 text-neutral-600">No hay eventos pasados.</p>
        ) : (
          <EventList when="past" initialItems={past} initialNextCursor={pastNextCursor} />
        )}
      </section>
    </div>
  );
}

export default EventsPage;
