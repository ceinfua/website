import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeStudentForRole } from "@/lib/authz";
import { Role } from "@/app/generated/prisma/enums";
import { ProfileForm } from "./profile-form";

export async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { email: true, emailVerifiedAt: true } } },
  });

  if (!student) {
    return (
      <div className="mx-auto max-w-md px-6 py-16">
        <h1 className="text-2xl font-bold">Perfil</h1>
        <p className="mt-4 text-neutral-600">No se encontro un registro de estudiante para tu cuenta.</p>
      </div>
    );
  }

  const view = serializeStudentForRole(student, Role.STUDENT);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-2xl font-bold">Mi perfil</h1>
      <ProfileForm student={view} studentId={student.id} />
    </div>
  );
}

export default ProfilePage;
