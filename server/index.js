const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const prisma = require("./prisma/prisma");
const adminAuthRoutes = require("./routes/adminAuth.routes");
const adminHospitalsRoutes = require("./routes/adminHospitals.routes");
const patientSearchRoutes = require("./routes/patientSearch.routes");
const appointmentsRoutes = require("./routes/appointments.routes");

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const SEARCH_COOKIE_NAME = "mojtermin_search_id";

function normalizeOrigin(value) {
  if (!value || typeof value !== "string") return "";
  let u = value.trim();
  if (!u) return "";
  // Strip trailing slash so https://a.com and https://a.com/ match
  return u.replace(/\/+$/, "");
}

const corsMiddleware = cors({
  origin: (origin, callback) => {
    const raw = process.env.CORS_ORIGINS;
    // If no allowlist provided, reflect origin (dev-friendly).
    if (!raw || !raw.trim()) return callback(null, true);

    const allowlist = raw
      .split(",")
      .map((v) => normalizeOrigin(v))
      .filter(Boolean);

    // Allow non-browser requests (no Origin header)
    if (!origin) return callback(null, true);

    const reqOrigin = normalizeOrigin(origin);
    if (allowlist.includes(reqOrigin)) return callback(null, true);

    // Deny without throwing — Error() bubbles to Express as 500 / log spam
    return callback(null, false);
  },
  credentials: true,
});

app.use(corsMiddleware);

// Handle preflight requests for all routes (Express 5 + path-to-regexp doesn't like "*")
app.options(/.*/, corsMiddleware);

// Cookie parser
app.use(cookieParser());

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/hospitals", adminHospitalsRoutes);
app.use("/api/search", patientSearchRoutes);
app.use("/api/appointments", appointmentsRoutes);

app.post("/api/availability", async (req, res, next) => {
  try {
    const { need, imageUrl, locale } = req.body ?? {};
    const cookieSearchId = req.cookies?.[SEARCH_COOKIE_NAME];

    if (
      (!need || typeof need !== "string" || !need.trim()) &&
      (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim())
    ) {
      return res
        .status(400)
        .json({ error: "Provide at least one of: need or imageUrl." });
    }

    const saved = await prisma.availabilityRequest.create({
      data: {
        need: typeof need === "string" ? need.trim() : null,
        imageUrl: typeof imageUrl === "string" ? imageUrl.trim() : null,
        locale: typeof locale === "string" ? locale : null,
        sessionToken:
          typeof cookieSearchId === "string" && cookieSearchId.trim()
            ? cookieSearchId
            : null,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    res.cookie(SEARCH_COOKIE_NAME, saved.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 365,
    });

    res.status(201).json({
      requestId: saved.id,
      createdAt: saved.createdAt,
      availability: [
        {
          provider: "UKC Ljubljana",
          estimatedWait: "~6 tednov",
          earliestOption: "12. maj 2026",
        },
        {
          provider: "SB Celje - radiologija",
          estimatedWait: "~4 tedni",
          earliestOption: "28. apr 2026",
        },
      ],
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

const server = app.listen(port, () => {
  console.log(`[SERVER] API listening on port ${port}`);
});

async function ensureBootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name = process.env.ADMIN_NAME?.trim() || "Admin";

  if (!email || !password) {
    console.log("[SERVER] ADMIN_EMAIL/ADMIN_PASSWORD not set; bootstrap skipped.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.admin.upsert({
    where: { email },
    update: { name, password: passwordHash },
    create: { name, email, password: passwordHash },
  });

  console.log(`[SERVER] Bootstrap admin ready for ${email}`);
}

ensureBootstrapAdmin().catch((error) => {
  console.error("[SERVER] Failed to bootstrap admin:", error);
});

async function shutdown() {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
