import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const DEFAULT_TAKE = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const take = Number(searchParams.get("take")) || DEFAULT_TAKE;

  const items = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const nextCursor = items.length === take ? items[items.length - 1].id : null;

  return NextResponse.json({ items, nextCursor });
}
