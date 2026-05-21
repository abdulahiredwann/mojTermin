const bcrypt = require("bcrypt");
const prisma = require("../prisma/prisma");
const { sanitizePublicUser } = require("../utils/userPublic");

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  subscriptionPlan: true,
  subscriptionStartedAt: true,
  subscriptionEndsAt: true,
};

async function updateMyProfile(req, res, next) {
  try {
    const raw = req.body ?? {};
    const name = typeof raw.name === "string" ? raw.name.trim() : "";

    if (!name || name.length < 2) {
      return res.status(400).json({ error: "Please enter your full name." });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: userSelect,
    });

    return res.json({ user: sanitizePublicUser(user) });
  } catch (error) {
    return next(error);
  }
}

async function updateMyPassword(req, res, next) {
  try {
    const raw = req.body ?? {};
    const currentPassword = typeof raw.currentPassword === "string" ? raw.currentPassword : "";
    const newPassword = typeof raw.newPassword === "string" ? raw.newPassword : "";

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }

    const row = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { password: true },
    });
    if (!row) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const valid = await bcrypt.compare(currentPassword, row.password);
    if (!valid) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: passwordHash },
    });

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
}

async function cancelMySubscription(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: userSelect,
    });
    if (!user) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const plan = user.subscriptionPlan?.toLowerCase();
    if (plan !== "pro") {
      return res.status(400).json({ error: "You are not on a paid plan." });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        subscriptionPlan: "free",
        subscriptionEndsAt: new Date(),
      },
      select: userSelect,
    });

    return res.json({ user: sanitizePublicUser(updated) });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  updateMyProfile,
  updateMyPassword,
  cancelMySubscription,
};
