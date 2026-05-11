const crypto = require("crypto");
const bcrypt = require("bcrypt");
const prisma = require("../prisma/prisma");
const { sanitizePublicUser } = require("../utils/userPublic");
const {
  USER_COOKIE_NAME,
  getCookieSameSiteOptions,
} = require("../middleware/userAuth.middleware");

async function loginUser(req, res, next) {
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

    const userFull = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!userFull) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const valid = await bcrypt.compare(password, userFull.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const sessionToken = crypto.randomUUID();
    await prisma.user.update({
      where: { id: userFull.id },
      data: { sessionToken },
    });

    res.cookie(USER_COOKIE_NAME, sessionToken, getCookieSameSiteOptions());
    return res.json({
      user: sanitizePublicUser(userFull),
    });
  } catch (error) {
    return next(error);
  }
}

function meUser(req, res) {
  return res.json({ user: req.user });
}

async function logoutUser(req, res, next) {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { sessionToken: null },
    });

    const opts = getCookieSameSiteOptions();
    res.clearCookie(USER_COOKIE_NAME, {
      httpOnly: true,
      sameSite: opts.sameSite,
      secure: opts.secure,
    });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

module.exports = { loginUser, meUser, logoutUser };
