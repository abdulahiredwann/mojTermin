const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("../generated/prisma");

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("12345678", 10);

  await prisma.admin.upsert({
    where: { email: "emailadmin@gmail.com" },
    update: {
      name: "Admin",
      password: passwordHash,
    },
    create: {
      name: "Admin",
      email: "emailadmin@gmail.com",
      password: passwordHash,
    },
  });

  console.log("Seeded admin: emailadmin@gmail.com");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
