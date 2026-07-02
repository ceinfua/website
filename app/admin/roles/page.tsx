import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";
import { RolesTable } from "./roles-table";

export async function AdminRolesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true },
    orderBy: { email: "asc" },
  });

  return (
    <div className="px-6 py-16">
      <h1 className="text-2xl font-bold">Gestión de roles</h1>
      <RolesTable users={users} currentUserId={session.user.id} />
    </div>
  );
}

export default AdminRolesPage;
