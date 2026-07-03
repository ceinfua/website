import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/app/generated/prisma/enums";
import { NewsAdminTable } from "./news-admin-table";

export async function AdminNewsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== Role.ADMIN) {
    redirect("/");
  }

  const news = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="px-6 py-16">
      <h1 className="text-2xl font-bold">Gestión de noticias</h1>
      <NewsAdminTable initialNews={news} />
    </div>
  );
}

export default AdminNewsPage;
