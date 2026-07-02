import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireRole, serializeStudentForRole } from "@/lib/authz";
import { generateToken } from "@/lib/tokens";
import { sendClaimInviteEmail } from "@/lib/email";
import { Carrera, Role } from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CARRERA_VALUES = Object.values(Carrera);
const CLAIM_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function GET() {
  const result = await requireRole([Role.CEINFUA_MEMBER, Role.ADMIN, Role.EXTERNAL_PARTNER]);

  if (!result.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: result.status });
  }

  const students = await prisma.student.findMany({
    include: { user: { select: { email: true, emailVerifiedAt: true } } },
    orderBy: { creadoEn: "desc" },
  });

  const serialized = students.map((student) =>
    serializeStudentForRole(student, result.user.role),
  );

  return NextResponse.json({ students: serialized });
}

type CreateStudentBody = {
  nombre?: unknown;
  apellido?: unknown;
  cedula?: unknown;
  correo?: unknown;
  telefono?: unknown;
  carrera?: unknown;
  anioIngreso?: unknown;
};

export async function POST(request: Request) {
  const result = await requireRole([Role.CEINFUA_MEMBER, Role.ADMIN]);

  if (!result.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: result.status });
  }

  let body: CreateStudentBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { nombre, apellido, cedula, correo, telefono, carrera, anioIngreso } = body;

  if (
    typeof nombre !== "string" ||
    nombre.trim().length === 0 ||
    typeof apellido !== "string" ||
    apellido.trim().length === 0 ||
    typeof cedula !== "string" ||
    cedula.trim().length === 0 ||
    typeof telefono !== "string" ||
    telefono.trim().length === 0
  ) {
    return NextResponse.json(
      { error: "Missing or invalid required fields" },
      { status: 400 },
    );
  }

  if (typeof correo !== "string" || !EMAIL_RE.test(correo)) {
    return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
  }

  if (typeof carrera !== "string" || !CARRERA_VALUES.includes(carrera as Carrera)) {
    return NextResponse.json({ error: "Invalid carrera" }, { status: 400 });
  }

  if (typeof anioIngreso !== "number" || !Number.isInteger(anioIngreso)) {
    return NextResponse.json({ error: "Invalid anioIngreso" }, { status: 400 });
  }

  const token = generateToken();
  const tokenExpiresAt = new Date(Date.now() + CLAIM_TOKEN_TTL_MS);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: correo,
          claimToken: token,
          claimTokenExpiresAt: tokenExpiresAt,
        },
      });

      await tx.student.create({
        data: {
          userId: user.id,
          nombre,
          apellido,
          cedula,
          telefono,
          carrera: carrera as Carrera,
          anioIngreso,
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "A student with that email or cedula already exists" },
        { status: 409 },
      );
    }
    throw error;
  }

  await sendClaimInviteEmail(correo, token);

  return NextResponse.json({ ok: true }, { status: 201 });
}
