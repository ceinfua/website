import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

type ClaimBody = {
  token?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: ClaimBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const { token, password } = body;

  if (typeof token !== "string" || token.trim().length === 0) {
    return NextResponse.json({ error: "Falta el token" }, { status: 400 });
  }

  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { claimToken: token } });

  if (!user || !user.claimTokenExpiresAt || user.claimTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      claimToken: null,
      claimTokenExpiresAt: null,
    },
  });

  return NextResponse.json({ ok: true });
}
