import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser, serializeStudentForRole } from "@/lib/authz";
import { Carrera, Estado, Role } from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";

const CARRERA_VALUES = Object.values(Carrera);
const ESTADO_VALUES = Object.values(Estado);

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: { select: { email: true, emailVerifiedAt: true } } },
  });

  if (!student) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const isSelf = student.userId === user.id;
  const isStaff = user.role === Role.CEINFUA_MEMBER || user.role === Role.ADMIN;
  const isExternalPartner = user.role === Role.EXTERNAL_PARTNER;

  if (!isSelf && !isStaff && !isExternalPartner) {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }

  return NextResponse.json({
    student: serializeStudentForRole(student, isSelf ? Role.STUDENT : user.role),
  });
}

type PatchBody = {
  nombre?: unknown;
  apellido?: unknown;
  cedula?: unknown;
  telefono?: unknown;
  carrera?: unknown;
  anioIngreso?: unknown;
  estado?: unknown;
};

const SELF_EDITABLE_FIELDS = new Set(["telefono", "estado"]);
const STAFF_EDITABLE_FIELDS = new Set([
  "nombre",
  "apellido",
  "cedula",
  "telefono",
  "carrera",
  "anioIngreso",
  "estado",
]);

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: { select: { email: true, emailVerifiedAt: true } } },
  });

  if (!student) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const isSelf = student.userId === user.id;
  const isStaff = user.role === Role.CEINFUA_MEMBER || user.role === Role.ADMIN;

  if (!isSelf && !isStaff) {
    return NextResponse.json({ error: "Prohibido" }, { status: 403 });
  }

  let body: PatchBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON invalido" }, { status: 400 });
  }

  const allowedFields = isStaff ? STAFF_EDITABLE_FIELDS : SELF_EDITABLE_FIELDS;
  const requestedFields = Object.keys(body);
  const disallowed = requestedFields.filter((field) => !allowedFields.has(field));

  if (disallowed.length > 0) {
    return NextResponse.json(
      { error: `No podes editar el/los campo(s): ${disallowed.join(", ")}` },
      { status: 403 },
    );
  }

  const data: Prisma.StudentUpdateInput = {};

  if (body.nombre !== undefined) {
    if (typeof body.nombre !== "string" || body.nombre.trim().length === 0) {
      return NextResponse.json({ error: "Nombre invalido" }, { status: 400 });
    }
    data.nombre = body.nombre;
  }

  if (body.apellido !== undefined) {
    if (typeof body.apellido !== "string" || body.apellido.trim().length === 0) {
      return NextResponse.json({ error: "Apellido invalido" }, { status: 400 });
    }
    data.apellido = body.apellido;
  }

  if (body.cedula !== undefined) {
    if (typeof body.cedula !== "string" || body.cedula.trim().length === 0) {
      return NextResponse.json({ error: "Cedula invalida" }, { status: 400 });
    }
    data.cedula = body.cedula;
  }

  if (body.telefono !== undefined) {
    if (typeof body.telefono !== "string" || body.telefono.trim().length === 0) {
      return NextResponse.json({ error: "Telefono invalido" }, { status: 400 });
    }
    data.telefono = body.telefono;
  }

  if (body.carrera !== undefined) {
    if (typeof body.carrera !== "string" || !CARRERA_VALUES.includes(body.carrera as Carrera)) {
      return NextResponse.json({ error: "Carrera invalida" }, { status: 400 });
    }
    data.carrera = body.carrera as Carrera;
  }

  if (body.anioIngreso !== undefined) {
    if (typeof body.anioIngreso !== "number" || !Number.isInteger(body.anioIngreso)) {
      return NextResponse.json({ error: "Ano de ingreso invalido" }, { status: 400 });
    }
    data.anioIngreso = body.anioIngreso;
  }

  if (body.estado !== undefined) {
    if (typeof body.estado !== "string" || !ESTADO_VALUES.includes(body.estado as Estado)) {
      return NextResponse.json({ error: "Estado invalido" }, { status: 400 });
    }
    data.estado = body.estado as Estado;
  }

  let updated;

  try {
    updated = await prisma.student.update({
      where: { id },
      data,
      include: { user: { select: { email: true, emailVerifiedAt: true } } },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "La cedula ya esta en uso" }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({
    student: serializeStudentForRole(updated, isSelf ? Role.STUDENT : user.role),
  });
}
