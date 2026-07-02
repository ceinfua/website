import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../app/generated/prisma/client";
import { Carrera, Role } from "../app/generated/prisma/enums";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = "admin@ceinfua.local";
// Local-only bootstrap password. Change it after first login; never used in production.
const ADMIN_PASSWORD = "ChangeMe123!";

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      role: Role.ADMIN,
      emailVerifiedAt: new Date(),
      student: {
        create: {
          nombre: "Admin",
          apellido: "CEINFUA",
          cedula: "0000000",
          telefono: "+595900000000",
          carrera: Carrera.INGENIERIA_INFORMATICA,
          anioIngreso: new Date().getFullYear(),
        },
      },
    },
  });

  console.log(`Seeded admin user: ${admin.email} (password: ${ADMIN_PASSWORD})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
