import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const DEFAULT_TAKE = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const when = searchParams.get("when");
  const cursor = searchParams.get("cursor");
  const take = Number(searchParams.get("take")) || DEFAULT_TAKE;

  if (when !== "upcoming" && when !== "past") {
    return NextResponse.json(
      { error: "El parámetro 'when' debe ser 'upcoming' o 'past'" },
      { status: 400 },
    );
  }

  const now = new Date();

  const items = await prisma.event.findMany({
    where: when === "upcoming" ? { date: { gte: now } } : { date: { lt: now } },
    orderBy: { date: when === "upcoming" ? "asc" : "desc" },
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const nextCursor = items.length === take ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor });
}
