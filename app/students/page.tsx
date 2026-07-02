import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeStudentForRole, type FullStudentView } from "@/lib/authz";
import { Role } from "@/app/generated/prisma/enums";

export async function StudentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const allowedRoles: Role[] = [Role.CEINFUA_MEMBER, Role.ADMIN, Role.EXTERNAL_PARTNER];

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  const students = await prisma.student.findMany({
    include: { user: { select: { email: true, emailVerifiedAt: true } } },
    orderBy: { creadoEn: "desc" },
  });

  const serialized = students.map((student) =>
    serializeStudentForRole(student, session.user.role),
  );

  const isFullView = session.user.role !== Role.EXTERNAL_PARTNER;

  return (
    <div className="px-6 py-16">
      <h1 className="text-2xl font-bold">Estudiantes</h1>
      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            <th className="py-2 pr-4">Nombre</th>
            <th className="py-2 pr-4">Apellido</th>
            <th className="py-2 pr-4">Cédula</th>
            <th className="py-2 pr-4">Teléfono</th>
            {isFullView && (
              <>
                <th className="py-2 pr-4">Correo</th>
                <th className="py-2 pr-4">Carrera</th>
                <th className="py-2 pr-4">Año</th>
                <th className="py-2 pr-4">Estado</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {serialized.map((student, idx) => (
            <tr key={idx} className="border-b border-neutral-100">
              <td className="py-2 pr-4">{student.nombre}</td>
              <td className="py-2 pr-4">{student.apellido}</td>
              <td className="py-2 pr-4">{student.cedula}</td>
              <td className="py-2 pr-4">{student.telefono}</td>
              {isFullView && "correo" in student && (
                <>
                  <td className="py-2 pr-4">{(student as FullStudentView).correo}</td>
                  <td className="py-2 pr-4">{(student as FullStudentView).carrera}</td>
                  <td className="py-2 pr-4">{(student as FullStudentView).anioIngreso}</td>
                  <td className="py-2 pr-4">{(student as FullStudentView).estado}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentsPage;
