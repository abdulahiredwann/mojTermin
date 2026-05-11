const prisma = require("../prisma/prisma");

function parseDateOnly(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const d = new Date(`${trimmed}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

async function listMyAppointmentRequests(req, res, next) {
  try {
    const rows = await prisma.appointmentRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        hospital: {
          select: { id: true, name: true, city: true, country: true },
        },
      },
    });

    const requests = rows.map((r) => ({
      id: r.id,
      email: r.email,
      query: r.query,
      intent: r.intent,
      city: r.city,
      hospitalId: r.hospitalId,
      hospitalName: r.hospitalName ?? r.hospital?.name ?? null,
      preferredDate: r.preferredDate,
      notifyWhenAvailable: r.notifyWhenAvailable,
      status: r.status,
      createdAt: r.createdAt,
    }));

    const byStatus = requests.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    }, {});

    return res.json({
      stats: {
        total: requests.length,
        byStatus,
      },
      requests,
    });
  } catch (error) {
    return next(error);
  }
}

async function updateMyAppointmentRequest(req, res, next) {
  try {
    const id = typeof req.params?.id === "string" ? req.params.id.trim() : "";
    if (!id) {
      return res.status(400).json({ error: "Invalid request id." });
    }
    const preferredDate = parseDateOnly(req.body?.preferredDate);
    if (!preferredDate) {
      return res.status(400).json({ error: "Preferred date must be YYYY-MM-DD." });
    }

    const existing = await prisma.appointmentRequest.findFirst({
      where: { id, userId: req.user.id },
      select: { id: true, status: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "Request not found." });
    }
    if (existing.status !== "pending") {
      return res.status(400).json({ error: "Only pending requests can be updated." });
    }

    const updated = await prisma.appointmentRequest.update({
      where: { id: existing.id },
      data: { preferredDate },
      select: { id: true, preferredDate: true },
    });

    return res.json({
      request: {
        id: updated.id,
        preferredDate: updated.preferredDate,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteMyAppointmentRequest(req, res, next) {
  try {
    const id = typeof req.params?.id === "string" ? req.params.id.trim() : "";
    if (!id) {
      return res.status(400).json({ error: "Invalid request id." });
    }

    const result = await prisma.appointmentRequest.deleteMany({
      where: { id, userId: req.user.id },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Request not found." });
    }

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listMyAppointmentRequests,
  updateMyAppointmentRequest,
  deleteMyAppointmentRequest,
};
