const crypto = require("crypto");
const bcrypt = require("bcrypt");
const prisma = require("../prisma/prisma");
const { ADMIN_COOKIE_NAME } = require("../middleware/adminAuth.middleware");

const isProd = process.env.NODE_ENV === "production";
const cookieSameSite = (process.env.ADMIN_COOKIE_SAMESITE || (isProd ? "none" : "lax")).toLowerCase();
const cookieOptions = {
  httpOnly: true,
  // Cross-site admin login (frontend on one domain, API on another) requires SameSite=None; Secure.
  sameSite: cookieSameSite,
  secure: cookieSameSite === "none" ? true : isProd,
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

async function loginAdmin(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (
      !email ||
      typeof email !== "string" ||
      !password ||
      typeof password !== "string"
    ) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = crypto.randomUUID();
    await prisma.admin.update({
      where: { id: admin.id },
      data: { sessionToken: token },
    });

    res.cookie(ADMIN_COOKIE_NAME, token, cookieOptions);
    return res.json({
      admin: { id: admin.id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    return next(error);
  }
}

function meAdmin(req, res) {
  return res.json({ admin: req.admin });
}

async function logoutAdmin(req, res, next) {
  try {
    await prisma.admin.update({
      where: { id: req.admin.id },
      data: { sessionToken: null },
    });

    res.clearCookie(ADMIN_COOKIE_NAME, {
      httpOnly: true,
      sameSite: cookieSameSite,
      secure: cookieSameSite === "none" ? true : isProd,
    });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

module.exports = { loginAdmin, meAdmin, logoutAdmin };
