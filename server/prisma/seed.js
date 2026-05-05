const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("../generated/prisma");
const { hospitalsSeed } = require("./seed-hospitals.data");

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

  for (const hospital of hospitalsSeed) {
    const savedHospital = await prisma.hospital.upsert({
      where: { name: hospital.name },
      update: {
        city: hospital.city,
        country: hospital.country,
        website: hospital.website,
        emergency24h: hospital.emergency24h,
        bedCount: hospital.bedCount ?? null,
        averageWaitDays: hospital.averageWaitDays ?? null,
      },
      create: {
        name: hospital.name,
        city: hospital.city,
        country: hospital.country,
        website: hospital.website,
        emergency24h: hospital.emergency24h,
        bedCount: hospital.bedCount ?? null,
        averageWaitDays: hospital.averageWaitDays ?? null,
      },
    });

    await prisma.hospitalService.deleteMany({
      where: { hospitalId: savedHospital.id },
    });

    for (const service of hospital.services) {
      await prisma.hospitalService.create({
        data: {
          hospitalId: savedHospital.id,
          specialty: service.specialty,
          procedureName: service.procedureName,
          estimatedWaitDays: service.estimatedWaitDays,
          earliestDate: new Date(Date.now() + service.estimatedWaitDays * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  console.log("Seeded admin: emailadmin@gmail.com");
  console.log(`Seeded hospitals: ${hospitalsSeed.length}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
