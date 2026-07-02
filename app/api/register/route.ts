import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { Carrera } from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CARRERA_VALUES = Object.values(Carrera);
const VERIFICATION_TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24h

type RegisterBody = {
  nombre?: unknown;
  apellido?: unknown;
  cedula?: unknown;
  correo?: unknown;
  telefono?: unknown;
  carrera?: unknown;
  anioIngreso?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  let body: RegisterBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const { nombre, apellido, cedula, correo, telefono, carrera, anioIngreso, password } = body;

  if (
    typeof nombre !== "string" ||
    nombre.trim().length === 0 ||
    typeof apellido !== "string" ||
    apellido.trim().length === 0 ||
    typeof cedula !== "string" ||
    cedula.trim().length === 0 ||
    typeof telefono !== "string" ||
    telefono.trim().length === 0 ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    return NextResponse.json(
      { error: "Faltan campos obligatorios o son inválidos" },
      { status: 400 },
    );
  }

  if (typeof correo !== "string" || !EMAIL_RE.test(correo)) {
    return NextResponse.json({ error: "Formato de correo inválido" }, { status: 400 });
  }

  if (typeof carrera !== "string" || !CARRERA_VALUES.includes(carrera as Carrera)) {
    return NextResponse.json({ error: "Carrera inválida" }, { status: 400 });
  }

  if (typeof anioIngreso !== "number" || !Number.isInteger(anioIngreso)) {
    return NextResponse.json({ error: "Año de ingreso inválido" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const token = generateToken();
  const tokenExpiresAt = new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS);

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: correo,
          passwordHash,
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
        { error: "Ya existe una cuenta con ese correo o cédula" },
        { status: 409 },
      );
    }
    throw error;
  }

  await sendVerificationEmail(correo, token);

  return NextResponse.json({ ok: true }, { status: 201 });
}
