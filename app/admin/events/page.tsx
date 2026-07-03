import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";
import { EventsAdminTable } from "./events-admin-table";

export async function AdminEventsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  const events = await prisma.event.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div className="px-6 py-16">
      <h1 className="text-2xl font-bold">Gestión de eventos</h1>
      <EventsAdminTable initialEvents={events} />
    </div>
  );
}

export default AdminEventsPage;
