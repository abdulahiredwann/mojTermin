const prisma = require("../prisma/prisma");

function toNullableString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toNullableInt(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(Math.trunc(num), 0) : null;
}

function toNullableBool(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

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

async function createHospital(req, res, next) {
  try {
    const name = toNullableString(req.body?.name);
    if (!name) {
      return res.status(400).json({ error: "Hospital name is required." });
    }

    const hospital = await prisma.hospital.create({
      data: {
        name,
        city: toNullableString(req.body?.city),
        country: toNullableString(req.body?.country),
        address: toNullableString(req.body?.address),
        phone: toNullableString(req.body?.phone),
        email: toNullableString(req.body?.email),
        website: toNullableString(req.body?.website),
        emergency24h: toNullableBool(req.body?.emergency24h),
        bedCount: toNullableInt(req.body?.bedCount),
        averageWaitDays: toNullableInt(req.body?.averageWaitDays),
        notes: toNullableString(req.body?.notes),
      },
    });

    return res.status(201).json({ hospital });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Hospital name already exists." });
    }
    return next(error);
  }
}

async function updateHospital(req, res, next) {
  try {
    const hospitalId = req.params.hospitalId;
    const name = toNullableString(req.body?.name);
    if (!name) {
      return res.status(400).json({ error: "Hospital name is required." });
    }

    const hospital = await prisma.hospital.update({
      where: { id: hospitalId },
      data: {
        name,
        city: toNullableString(req.body?.city),
        country: toNullableString(req.body?.country),
        address: toNullableString(req.body?.address),
        phone: toNullableString(req.body?.phone),
        email: toNullableString(req.body?.email),
        website: toNullableString(req.body?.website),
        emergency24h: toNullableBool(req.body?.emergency24h),
        bedCount: toNullableInt(req.body?.bedCount),
        averageWaitDays: toNullableInt(req.body?.averageWaitDays),
        notes: toNullableString(req.body?.notes),
      },
    });

    return res.json({ hospital });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Hospital not found." });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Hospital name already exists." });
    }
    return next(error);
  }
}

async function deleteHospital(req, res, next) {
  try {
    await prisma.hospital.delete({
      where: { id: req.params.hospitalId },
    });
    return res.status(204).end();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Hospital not found." });
    }
    return next(error);
  }
}

async function bulkDeleteHospitals(req, res, next) {
  try {
    const hospitalIds = Array.isArray(req.body?.hospitalIds) ? req.body.hospitalIds : [];
    if (!hospitalIds.length) {
      return res.status(400).json({ error: "hospitalIds must be a non-empty array." });
    }
    const deleted = await prisma.hospital.deleteMany({
      where: { id: { in: hospitalIds } },
    });
    return res.json({ deletedCount: deleted.count });
  } catch (error) {
    return next(error);
  }
}

async function addService(req, res, next) {
  try {
    const hospitalId = req.params.hospitalId;
    const service = await prisma.hospitalService.create({
      data: {
        hospitalId,
        specialty: toNullableString(req.body?.specialty),
        procedureName: toNullableString(req.body?.procedureName),
        estimatedWaitDays: toNullableInt(req.body?.estimatedWaitDays),
        earliestDate: req.body?.earliestDate ? new Date(req.body.earliestDate) : null,
        notes: toNullableString(req.body?.notes),
      },
    });
    return res.status(201).json({ service });
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(404).json({ error: "Hospital not found." });
    }
    return next(error);
  }
}

async function updateService(req, res, next) {
  try {
    const service = await prisma.hospitalService.update({
      where: { id: req.params.serviceId },
      data: {
        specialty: toNullableString(req.body?.specialty),
        procedureName: toNullableString(req.body?.procedureName),
        estimatedWaitDays: toNullableInt(req.body?.estimatedWaitDays),
        earliestDate: req.body?.earliestDate ? new Date(req.body.earliestDate) : null,
        notes: toNullableString(req.body?.notes),
      },
    });
    return res.json({ service });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Service not found." });
    }
    return next(error);
  }
}

async function deleteService(req, res, next) {
  try {
    await prisma.hospitalService.delete({
      where: { id: req.params.serviceId },
    });
    return res.status(204).end();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Service not found." });
    }
    return next(error);
  }
}

module.exports = {
  listHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
  bulkDeleteHospitals,
  addService,
  updateService,
  deleteService,
};
