import { auth } from "@/lib/auth";
import { Role } from "@/app/generated/prisma/enums";
import type { Student, User } from "@/app/generated/prisma/client";

export type SessionUser = {
  id: string;
  role: Role;
};

/** Returns the current session's user (id + role), or null if unauthenticated. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  return { id: session.user.id, role: session.user.role };
}

export type RequireRoleResult =
  | { ok: true; user: SessionUser }
  | { ok: false; status: 401 | 403 };

/**
 * Ensures the current session belongs to one of the allowed roles.
 * Returns a discriminated result instead of throwing so routes can
 * translate it directly into an HTTP status code.
 */
export async function requireRole(allowedRoles: Role[]): Promise<RequireRoleResult> {
  const user = await getSessionUser();

  if (!user) {
    return { ok: false, status: 401 };
  }

  if (!allowedRoles.includes(user.role)) {
    return { ok: false, status: 403 };
  }

  return { ok: true, user };
}

const EXTERNAL_PARTNER_FIELDS = ["nombre", "apellido", "cedula", "telefono"] as const;

export type StudentWithUser = Student & { user: Pick<User, "email" | "emailVerifiedAt"> };

export type FullStudentView = {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string;
  carrera: Student["carrera"];
  anioIngreso: number;
  estado: Student["estado"];
  correo: string;
  correoVerificadoEn: Date | null;
  creadoEn: Date;
  actualizadoEn: Date;
};

export type LimitedStudentView = Pick<Student, "nombre" | "apellido" | "cedula" | "telefono">;

/**
 * Field-filters a Student (+ related User) record based on the requesting
 * role. EXTERNAL_PARTNER only ever sees nombre/apellido/cedula/telefono.
 */
export function serializeStudentForRole(
  student: StudentWithUser,
  role: typeof Role.EXTERNAL_PARTNER,
): LimitedStudentView;
export function serializeStudentForRole(
  student: StudentWithUser,
  role: Exclude<Role, typeof Role.EXTERNAL_PARTNER>,
): FullStudentView;
export function serializeStudentForRole(
  student: StudentWithUser,
  role: Role,
): FullStudentView | LimitedStudentView;
export function serializeStudentForRole(
  student: StudentWithUser,
  role: Role,
): FullStudentView | LimitedStudentView {
  if (role === Role.EXTERNAL_PARTNER) {
    return {
      nombre: student.nombre,
      apellido: student.apellido,
      cedula: student.cedula,
      telefono: student.telefono,
    };
  }

  return {
    id: student.id,
    nombre: student.nombre,
    apellido: student.apellido,
    cedula: student.cedula,
    telefono: student.telefono,
    carrera: student.carrera,
    anioIngreso: student.anioIngreso,
    estado: student.estado,
    correo: student.user.email,
    correoVerificadoEn: student.user.emailVerifiedAt,
    creadoEn: student.creadoEn,
    actualizadoEn: student.actualizadoEn,
  };
}

export { EXTERNAL_PARTNER_FIELDS };
