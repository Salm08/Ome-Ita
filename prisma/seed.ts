import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@omeita.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeThisAdminPassword123!";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        gender: "MALE",
        age: 30,
        region: "Lombardia",
        stato: "online",
        role: UserRole.ADMIN,
        emailVerified: true,
      },
    });
    console.log(`Admin creato: ${adminEmail}`);
  } else {
    console.log("Admin già esistente");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
