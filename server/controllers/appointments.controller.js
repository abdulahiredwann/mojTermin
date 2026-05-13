const prisma = require("../prisma/prisma");

function toNullableString(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  // Simple email validation for MVP
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function parseDateOnly(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  // Expect YYYY-MM-DD from <input type="date" />
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  const d = new Date(`${trimmed}T00:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseBooleanFlag(value) {
  if (value === true || value === false) return value;
  if (value === "true" || value === 1 || value === "1") return true;
  if (value === "false" || value === 0 || value === "0") return false;
  return false;
}

async function createAppointmentRequest(req, res, next) {
  try {
    let email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    const query = typeof req.body?.query === "string" ? req.body.query.trim() : "";
    const preferredDate = parseDateOnly(req.body?.preferredDate);
    const hospitalId = toNullableString(req.body?.hospitalId);
    const hospitalName = toNullableString(req.body?.hospitalName);
    const city = toNullableString(req.body?.city);
    const intent = toNullableString(req.body?.intent);
    const notifyWhenAvailable = parseBooleanFlag(req.body?.notifyWhenAvailable);
    const userId = req.user?.id ?? null;
    if (userId && req.user?.email) {
      email = req.user.email.trim();
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Valid email is required." });
    }
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }
    if (!preferredDate) {
      return res.status(400).json({ error: "Preferred date is required." });
    }

    // If hospitalId provided, ensure it exists (optional for now but helps data integrity)
    if (hospitalId) {
      const exists = await prisma.hospital.findUnique({
        where: { id: hospitalId },
        select: { id: true, name: true, city: true },
      });
      if (!exists) {
        return res.status(404).json({ error: "Selected hospital not found." });
      }
    }

    const files = Array.isArray(req.files) ? req.files : [];
    const referralImagePaths = files
      .filter((f) => f && typeof f.filename === "string")
      .map((f) => `referrals/${f.filename}`);

    const saved = await prisma.appointmentRequest.create({
      data: {
        userId,
        email,
        query,
        intent,
        city,
        hospitalId,
        hospitalName,
        preferredDate,
        notifyWhenAvailable,
        referralImagePaths,
        status: "pending",
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        referralImagePaths: true,
      },
    });

    return res.status(201).json({ request: saved });
  } catch (error) {
    return next(error);
  }
}

async function listAppointmentRequests(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limitRaw = Number(req.query.limit) || 20;
    const limit = Math.min(Math.max(limitRaw, 10), 100);

    const [total, rows] = await Promise.all([
      prisma.appointmentRequest.count(),
      prisma.appointmentRequest.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          hospital: {
            select: { id: true, name: true, city: true, country: true },
          },
        },
      }),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.json({
      requests: rows.map((r) => ({
        id: r.id,
        email: r.email,
        query: r.query,
        intent: r.intent,
        city: r.city,
        hospitalId: r.hospitalId,
        hospitalName: r.hospitalName ?? r.hospital?.name ?? null,
        preferredDate: r.preferredDate,
        notifyWhenAvailable: r.notifyWhenAvailable,
        referralImagePaths: r.referralImagePaths,
        status: r.status,
        createdAt: r.createdAt,
      })),
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAppointmentRequest,
  listAppointmentRequests,
};

