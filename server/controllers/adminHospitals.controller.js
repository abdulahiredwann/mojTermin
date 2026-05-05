const prisma = require("../prisma/prisma");

async function listHospitals(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limitRaw = Number(req.query.limit) || 10;
    const limit = Math.min(Math.max(limitRaw, 5), 100);
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { country: { contains: q, mode: "insensitive" } },
            {
              services: {
                some: {
                  OR: [
                    { specialty: { contains: q, mode: "insensitive" } },
                    { procedureName: { contains: q, mode: "insensitive" } },
                  ],
                },
              },
            },
          ],
        }
      : undefined;

    const [total, hospitals] = await Promise.all([
      prisma.hospital.count({ where }),
      prisma.hospital.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ city: "asc" }, { name: "asc" }],
        include: {
          services: {
            where: { isActive: true },
            orderBy: [{ specialty: "asc" }, { procedureName: "asc" }],
          },
        },
      }),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);

    const rows = hospitals.map((hospital) => ({
      id: hospital.id,
      name: hospital.name,
      city: hospital.city,
      country: hospital.country,
      address: hospital.address,
      phone: hospital.phone,
      email: hospital.email,
      website: hospital.website,
      emergency24h: hospital.emergency24h,
      bedCount: hospital.bedCount,
      averageWaitDays: hospital.averageWaitDays,
      isActive: hospital.isActive,
      notes: hospital.notes,
      serviceCount: hospital.services.length,
      services: hospital.services.map((service) => ({
        id: service.id,
        specialty: service.specialty,
        procedureName: service.procedureName,
        estimatedWaitDays: service.estimatedWaitDays,
        earliestDate: service.earliestDate,
        isActive: service.isActive,
        notes: service.notes,
      })),
    }));

    return res.json({
      hospitals: rows,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listHospitals };
