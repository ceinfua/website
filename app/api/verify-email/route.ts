import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Falta el token" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { claimToken: token } });

  if (!user || !user.claimTokenExpiresAt || user.claimTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: new Date(),
      claimToken: null,
      claimTokenExpiresAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
