const prisma = require("../prisma/prisma");
const { analyzeReferralImagesFromFiles } = require("../services/referralVisionOpenAI");

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
    const notifyEmail = parseBooleanFlag(
      req.body?.notifyEmail !== undefined ? req.body.notifyEmail : true,
    );
    const notifyFasterRefresh = parseBooleanFlag(req.body?.notifyFasterRefresh);
    const notifySms =
      req.body?.notifySms !== undefined
        ? parseBooleanFlag(req.body.notifySms)
        : parseBooleanFlag(req.body?.notifyWhenAvailable);
    const notifyWhenAvailable = notifySms;
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

    let resolvedHospitalId = null;
    let resolvedHospitalName = hospitalName;
    let resolvedCity = city;

    if (hospitalId) {
      const hospitalRow = await prisma.hospital.findUnique({
        where: { id: hospitalId },
        select: { id: true, name: true, city: true },
      });
      if (hospitalRow) {
        resolvedHospitalId = hospitalRow.id;
        resolvedHospitalName = resolvedHospitalName || hospitalRow.name;
        resolvedCity = resolvedCity || hospitalRow.city;
      } else {
        const listing = await prisma.ezdravListing.findUnique({
          where: { id: hospitalId },
          select: { provider: true, city: true },
        });
        if (listing) {
          resolvedHospitalName = resolvedHospitalName || listing.provider || null;
          resolvedCity = resolvedCity || listing.city || null;
        } else if (!resolvedHospitalName) {
          return res.status(404).json({
            error: "Selected hospital not found. Please search again and retry.",
          });
        }
      }
    }

    if (!resolvedHospitalName && !resolvedHospitalId) {
      return res.status(400).json({ error: "Hospital name is required." });
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
        city: resolvedCity,
        hospitalId: resolvedHospitalId,
        hospitalName: resolvedHospitalName,
        preferredDate,
        notifyWhenAvailable,
        notifyEmail,
        notifyFasterRefresh,
        notifySms,
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

    if (files.length > 0) {
      try {
        const vision = await analyzeReferralImagesFromFiles(files);
        await prisma.appointmentReferralAnalysis.create({
          data: {
            appointmentRequestId: saved.id,
            headline: vision.headline,
            detailsMarkdown: vision.detailsMarkdown,
            specialtyHints: vision.specialtyHints,
            procedureHints: vision.procedureHints,
            rawEntities: vision.rawEntities,
          },
        });
      } catch (e) {
        const msg =
          e?.code === "OPENAI_NOT_CONFIGURED"
            ? "AI service is not configured."
            : typeof e?.message === "string"
              ? e.message
              : "Extraction failed.";
        try {
          await prisma.appointmentReferralAnalysis.create({
            data: {
              appointmentRequestId: saved.id,
              extractionError: msg,
            },
          });
        } catch {
          // ignore duplicate / race
        }
      }
    }

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
        notifyEmail: r.notifyEmail,
        notifyFasterRefresh: r.notifyFasterRefresh,
        notifySms: r.notifySms,
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

async function updateAppointmentRequestStatus(req, res, next) {
  try {
    const { id } = req.params;
    const raw = req.body?.status;
    const status = typeof raw === "string" ? raw.trim().toLowerCase() : "";

    if (status !== "pending" && status !== "done") {
      return res.status(400).json({ error: 'Status must be "pending" or "done".' });
    }

    const existing = await prisma.appointmentRequest.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "Appointment request not found." });
    }

    const updated = await prisma.appointmentRequest.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        status: true,
        email: true,
        hospitalName: true,
        preferredDate: true,
        createdAt: true,
      },
    });

    return res.json({ request: updated });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createAppointmentRequest,
  listAppointmentRequests,
  updateAppointmentRequestStatus,
};

