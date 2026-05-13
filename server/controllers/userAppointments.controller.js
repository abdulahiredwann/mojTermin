const path = require("path");
const fs = require("fs/promises");
const prisma = require("../prisma/prisma");
const { uploadsRoot } = require("../middleware/referralUpload.middleware");

/** Resolve stored path like referrals/uuid.jpg under uploads root only (no traversal). */
function resolveSafeUploadPath(storedRelative) {
  if (!storedRelative || typeof storedRelative !== "string") return null;
  const root = path.resolve(uploadsRoot);
  const normalized = storedRelative.replace(/\\/g, "/");
  const parts = normalized.split("/").filter((p) => p && p !== ".");
  if (parts.some((p) => p === "..")) return null;
  const target = path.resolve(root, ...parts);
  const rel = path.relative(root, target);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return target;
}

async function unlinkReferralIfPresent(storedRelative) {
  const abs = resolveSafeUploadPath(storedRelative);
  if (!abs) return;
  try {
    await fs.unlink(abs);
  } catch (e) {
    if (e && e.code !== "ENOENT") {
      console.warn("[userAppointments] unlink referral:", e.message);
    }
  }
}

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
        referralAnalysis: true,
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
      referralImagePaths: r.referralImagePaths ?? [],
      status: r.status,
      createdAt: r.createdAt,
      referralAnalysis: r.referralAnalysis
        ? {
            headline: r.referralAnalysis.headline,
            detailsMarkdown: r.referralAnalysis.detailsMarkdown,
            specialtyHints: r.referralAnalysis.specialtyHints ?? [],
            procedureHints: r.referralAnalysis.procedureHints ?? [],
            rawEntities: r.referralAnalysis.rawEntities ?? [],
            extractionError: r.referralAnalysis.extractionError,
          }
        : null,
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

    const existing = await prisma.appointmentRequest.findFirst({
      where: { id, userId: req.user.id },
      select: { id: true, referralImagePaths: true },
    });

    if (!existing) {
      return res.status(404).json({ error: "Request not found." });
    }

    await prisma.appointmentRequest.delete({ where: { id: existing.id } });

    for (const rel of existing.referralImagePaths ?? []) {
      await unlinkReferralIfPresent(rel);
    }

    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

async function deleteMyAppointmentReferralImage(req, res, next) {
  try {
    const id = typeof req.params?.id === "string" ? req.params.id.trim() : "";
    const storedPath =
      typeof req.body?.path === "string" ? req.body.path.trim().replace(/\\/g, "/") : "";
    if (!id) {
      return res.status(400).json({ error: "Invalid request id." });
    }
    if (!storedPath) {
      return res.status(400).json({ error: "path is required." });
    }

    const existing = await prisma.appointmentRequest.findFirst({
      where: { id, userId: req.user.id },
      select: { id: true, status: true, referralImagePaths: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "Request not found." });
    }
    if (existing.status !== "pending") {
      return res.status(400).json({ error: "Only pending requests can be updated." });
    }

    const paths = existing.referralImagePaths ?? [];
    if (!paths.includes(storedPath)) {
      return res.status(400).json({ error: "That image is not attached to this request." });
    }

    const nextPaths = paths.filter((p) => p !== storedPath);

    await prisma.appointmentRequest.update({
      where: { id: existing.id },
      data: { referralImagePaths: nextPaths },
      select: { id: true, referralImagePaths: true },
    });

    await unlinkReferralIfPresent(storedPath);

    return res.json({
      request: {
        id: existing.id,
        referralImagePaths: nextPaths,
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listMyAppointmentRequests,
  updateMyAppointmentRequest,
  deleteMyAppointmentRequest,
  deleteMyAppointmentReferralImage,
};
