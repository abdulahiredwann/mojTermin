const prisma = require("../prisma/prisma");

const ADMIN_COOKIE_NAME = "mojtermin_admin_token";

async function requireAdminAuth(req, res, next) {
  try {
    const token = req.cookies?.[ADMIN_COOKIE_NAME];
    if (!token || typeof token !== "string") {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const admin = await prisma.admin.findUnique({
      where: { sessionToken: token },
      select: { id: true, name: true, email: true },
    });

    if (!admin) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    req.admin = admin;
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = { requireAdminAuth, ADMIN_COOKIE_NAME };
