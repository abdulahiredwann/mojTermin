const crypto = require("crypto");
const bcrypt = require("bcrypt");
const prisma = require("../prisma/prisma");
const {
  USER_COOKIE_NAME,
  getCookieSameSiteOptions,
} = require("../middleware/userAuth.middleware");
const { sanitizePublicUser } = require("../utils/userPublic");

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

/**
 * Create a new user account (signup). Opens a session the same way as login:
 * random session token stored on the User row + httpOnly cookie (not JWT).
 */
async function createUserAccount(req, res, next) {
  try {
    const raw = req.body ?? {};
    const name = typeof raw.name === "string" ? raw.name.trim() : "";
    const emailRaw = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
    const phone =
      typeof raw.phone === "string" && raw.phone.trim() ? raw.phone.trim() : null;
    const password = typeof raw.password === "string" ? raw.password : "";

    if (!name || name.length < 2) {
      return res.status(400).json({ error: "Please enter your full name." });
    }
    if (!isValidEmail(emailRaw)) {
      return res.status(400).json({ error: "Valid email is required." });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    const existing = await prisma.user.findUnique({
      where: { email: emailRaw },
      select: { id: true },
    });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const sessionToken = crypto.randomUUID();

    const user = await prisma.user.create({
      data: {
        name,
        email: emailRaw,
        phone,
        password: passwordHash,
        sessionToken,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    res.cookie(USER_COOKIE_NAME, sessionToken, getCookieSameSiteOptions());
    return res.status(201).json({ user: sanitizePublicUser(user) });
  } catch (error) {
    return next(error);
  }
}

module.exports = { createUserAccount };
