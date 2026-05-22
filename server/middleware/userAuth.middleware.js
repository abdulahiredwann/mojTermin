const prisma = require("../prisma/prisma");
const { sanitizePublicUser } = require("../utils/userPublic");

/** Cookie name for the opaque session id (same pattern as admin — not JWT). */
const USER_COOKIE_NAME = "mojtermin_user_token";

function getCookieSameSiteOptions() {
  const isProd = process.env.NODE_ENV === "production";
  const cookieSameSite = (process.env.USER_COOKIE_SAMESITE || (isProd ? "none" : "lax")).toLowerCase();
  return {
    httpOnly: true,
    sameSite: cookieSameSite,
    secure: cookieSameSite === "none" ? true : isProd,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  };
}

async function optionalUserAuth(req, _res, next) {
  try {
    const token = req.cookies?.[USER_COOKIE_NAME];
    if (!token || typeof token !== "string") {
      req.user = null;
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { sessionToken: token },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subscriptionPlan: true,
        subscriptionStartedAt: true,
        subscriptionEndsAt: true,
        restricted: true,
      },
    });

    if (user?.restricted) {
      req.user = null;
      return next();
    }

    req.user = user ? sanitizePublicUser(user) : null;
    return next();
  } catch (error) {
    return next(error);
  }
}

async function requireUserAuth(req, res, next) {
  try {
    const token = req.cookies?.[USER_COOKIE_NAME];
    if (!token || typeof token !== "string") {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const user = await prisma.user.findUnique({
      where: { sessionToken: token },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subscriptionPlan: true,
        subscriptionStartedAt: true,
        subscriptionEndsAt: true,
        restricted: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    if (user.restricted) {
      return res.status(403).json({ error: "This account has been restricted." });
    }

    req.user = sanitizePublicUser(user);
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  USER_COOKIE_NAME,
  getCookieSameSiteOptions,
  optionalUserAuth,
  requireUserAuth,
};
