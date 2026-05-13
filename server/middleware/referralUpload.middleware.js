const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const fs = require("fs");

const uploadsRoot = path.join(__dirname, "..", "uploads");
const referralsDir = path.join(uploadsRoot, "referrals");

function ensureReferralsDir() {
  fs.mkdirSync(referralsDir, { recursive: true });
}

const allowedExt = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

function pickExtension(originalName, mimetype) {
  const fromName = path.extname(originalName || "").toLowerCase().slice(0, 8);
  if (allowedExt.has(fromName)) return fromName;
  const map = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
  };
  return map[String(mimetype).toLowerCase()] || ".jpg";
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureReferralsDir();
    cb(null, referralsDir);
  },
  filename: (_req, file, cb) => {
    const ext = pickExtension(file.originalname, file.mimetype);
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const MAX_REFERRAL_IMAGES = 15;
/** Ephemeral uploads for POST /search (vision preview); smaller limit to control cost. */
const MAX_SEARCH_REFERRAL_IMAGES = 8;

const uploadAppointments = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: MAX_REFERRAL_IMAGES,
  },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed."));
  },
});

const uploadSearch = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: MAX_SEARCH_REFERRAL_IMAGES,
  },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed."));
  },
});

/** Only run multer when the client sends multipart/form-data */
function maybeReferralUpload(req, res, next) {
  const ct = req.headers["content-type"];
  if (typeof ct === "string" && ct.includes("multipart/form-data")) {
    return uploadAppointments.array("referralImages", MAX_REFERRAL_IMAGES)(req, res, next);
  }
  next();
}

/** Multipart for POST /api/search — same field name, fewer files, files deleted after analysis. */
function maybeSearchReferralUpload(req, res, next) {
  const ct = req.headers["content-type"];
  if (typeof ct === "string" && ct.includes("multipart/form-data")) {
    return uploadSearch.array("referralImages", MAX_SEARCH_REFERRAL_IMAGES)(req, res, next);
  }
  next();
}

function referralUploadErrorHandler(err, req, res, next) {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({ error: "Too many images for this request." });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Each image must be 10 MB or smaller." });
    }
    return res.status(400).json({ error: err.message || "Upload failed." });
  }

  if (typeof err.message === "string" && err.message.includes("JPEG")) {
    return res.status(400).json({ error: err.message });
  }

  return next(err);
}

/** @deprecated use referralUploadErrorHandler */
const referralMulterErrorHandler = referralUploadErrorHandler;

module.exports = {
  uploadsRoot,
  referralsRelativePrefix: "referrals",
  MAX_REFERRAL_IMAGES,
  MAX_SEARCH_REFERRAL_IMAGES,
  maybeReferralUpload,
  maybeSearchReferralUpload,
  referralUploadErrorHandler,
  referralMulterErrorHandler,
  ensureReferralsDir,
};
