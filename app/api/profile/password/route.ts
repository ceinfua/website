import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/authz";

type PasswordChangeBody = {
  currentPassword?: unknown;
  newPassword?: unknown;
};

export async function PATCH(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: PasswordChangeBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;

  if (typeof currentPassword !== "string" || typeof newPassword !== "string") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });

  if (!dbUser?.passwordHash) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);

  if (!valid) {
    return NextResponse.json({ error: "Contraseña actual incorrecta" }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "La contraseña debe tener al menos 8 caracteres" },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
