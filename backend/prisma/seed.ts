import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const defaultPassword = "stage2020";

const users = [
  "Hauan Felipe",
  "Lucas Gomes",
  "Arielton Fernandes",
  "Kaiky Rogis",
  "Kamila Coffler",
  "Laura Abreu",
];

async function main() {
  for (const name of users) {
    await prisma.user.upsert({
      where: { name },
      update: {
        name,
        passwordHash: defaultPassword,
        active: true,
        role: "Colaborador",
      },
      create: {
        name,
        passwordHash: defaultPassword,
        role: "Colaborador",
        active: true,
      },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
