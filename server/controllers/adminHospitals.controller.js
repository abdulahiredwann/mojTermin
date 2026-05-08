const prisma = require("../prisma/prisma");
const { runHospitalAssistantModel } = require("../services/hospitalChatOpenAI");

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

async function createHospitalChatSession(req, res, next) {
  try {
    const session = await prisma.adminHospitalChatSession.create({
      data: { adminId: req.admin.id },
    });
    return res.status(201).json({ contextId: session.id });
  } catch (error) {
    return next(error);
  }
}

async function listHospitalChatMessages(req, res, next) {
  try {
    const contextId = req.params.contextId;
    const session = await prisma.adminHospitalChatSession.findFirst({
      where: { id: contextId, adminId: req.admin.id },
      select: { id: true },
    });
    if (!session) {
      return res.status(404).json({ error: "Chat not found." });
    }
    const messages = await prisma.adminHospitalChatMessage.findMany({
      where: { sessionId: contextId },
      orderBy: { createdAt: "asc" },
      select: { id: true, role: true, content: true, createdAt: true },
    });
    return res.json({ contextId, messages });
  } catch (error) {
    return next(error);
  }
}

async function listHospitalChatSessions(req, res, next) {
  try {
    const sessions = await prisma.adminHospitalChatSession.findMany({
      where: { adminId: req.admin.id },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { role: true, content: true, createdAt: true },
        },
      },
    });

    return res.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        title: s.title,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        lastMessage: s.messages[0]
          ? {
              role: s.messages[0].role,
              content: s.messages[0].content,
              createdAt: s.messages[0].createdAt,
            }
          : null,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

async function chatSimulateHospitals(req, res, next) {
  try {
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message) {
      return res.status(400).json({ error: "message is required." });
    }

    const contextIdRaw = typeof req.body?.contextId === "string" ? req.body.contextId.trim() : "";

    let session;
    if (contextIdRaw) {
      session = await prisma.adminHospitalChatSession.findFirst({
        where: { id: contextIdRaw, adminId: req.admin.id },
      });
      if (!session) {
        return res.status(404).json({ error: "Chat session not found." });
      }
    } else {
      session = await prisma.adminHospitalChatSession.create({
        data: { adminId: req.admin.id },
      });
    }

    await prisma.adminHospitalChatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: message,
      },
    });

    if (!session.title) {
      await prisma.adminHospitalChatSession.update({
        where: { id: session.id },
        data: { title: message.slice(0, 120) },
      });
    }

    const dbMessages = await prisma.adminHospitalChatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
      select: { role: true, content: true },
    });

    const history = dbMessages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    let summary;
    let proposedHospitals;

    try {
      const result = await runHospitalAssistantModel(history);
      summary = result.summary;
      proposedHospitals = result.proposedHospitals;
    } catch (err) {
      if (err.code === "OPENAI_NOT_CONFIGURED") {
        return res.status(503).json({
          error: "OpenAI is not configured. Set OPENAI_API_KEY on the server.",
        });
      }
      throw err;
    }

    await prisma.adminHospitalChatMessage.create({
      data: {
        sessionId: session.id,
        role: "assistant",
        content: summary,
      },
    });

    return res.json({
      summary,
      proposedHospitals,
      contextId: session.id,
    });
  } catch (error) {
    return next(error);
  }
}

async function bulkCreateHospitals(req, res, next) {
  try {
    const hospitals = Array.isArray(req.body?.hospitals) ? req.body.hospitals : [];
    if (!hospitals.length) {
      return res.status(400).json({ error: "hospitals must be a non-empty array." });
    }

    for (const item of hospitals) {
      const name = toNullableString(item?.name);
      if (!name) {
        return res.status(400).json({ error: "Each hospital needs a name." });
      }
    }

    let created = 0;
    await prisma.$transaction(async (tx) => {
      for (const item of hospitals) {
        const name = toNullableString(item?.name);
        const services = Array.isArray(item?.services) ? item.services : [];
        await tx.hospital.create({
          data: {
            name,
            city: toNullableString(item?.city),
            country: toNullableString(item?.country) ?? "Slovenia",
            averageWaitDays: toNullableInt(item?.averageWaitDays),
            services: {
              create: services.map((s) => ({
                specialty: toNullableString(s?.specialty),
                procedureName: toNullableString(s?.procedureName),
                estimatedWaitDays: toNullableInt(s?.estimatedWaitDays),
              })),
            },
          },
        });
        created += 1;
      }
    });

    return res.status(201).json({ createdCount: created });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "A hospital name already exists." });
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
  createHospitalChatSession,
  listHospitalChatSessions,
  listHospitalChatMessages,
  chatSimulateHospitals,
  bulkCreateHospitals,
};
