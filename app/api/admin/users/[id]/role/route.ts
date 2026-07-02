import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { Role } from "@/app/generated/prisma/enums";

const ROLE_VALUES = Object.values(Role);

type RouteParams = { params: Promise<{ id: string }> };

type RoleBody = { role?: unknown };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const result = await requireRole([Role.ADMIN]);

  if (!result.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: result.status });
  }

  let body: RoleBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON invalido" }, { status: 400 });
  }

  const { role } = body;

  if (typeof role !== "string" || !ROLE_VALUES.includes(role as Role)) {
    return NextResponse.json({ error: "Rol invalido" }, { status: 400 });
  }

  const targetUser = await prisma.user.findUnique({ where: { id } });

  if (!targetUser) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const isDemotingFromAdmin = targetUser.role === Role.ADMIN && role !== Role.ADMIN;

  if (isDemotingFromAdmin) {
    if (targetUser.id === result.user.id) {
      return NextResponse.json(
        { error: "No podes quitarte tu propio rol de admin" },
        { status: 400 },
      );
    }

    const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });

    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "No se puede degradar al ultimo admin restante" },
        { status: 400 },
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role: role as Role },
    select: { id: true, email: true, role: true },
  });

  return NextResponse.json({ user: updated });
}
