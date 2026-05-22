const prisma = require("../prisma/prisma");
const { effectiveSubscriptionPlan, toIsoOrNull } = require("../utils/userSubscription");

const userListSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  subscriptionPlan: true,
  subscriptionStartedAt: true,
  subscriptionEndsAt: true,
  restricted: true,
  createdAt: true,
  updatedAt: true,
};

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

function mapUserRow(user, requestCount, lastRequestAt) {
  const lastActiveAt = lastRequestAt ?? user.updatedAt;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    subscriptionPlan: user.subscriptionPlan,
    effectivePlan: effectiveSubscriptionPlan(user),
    subscriptionStartedAt: toIsoOrNull(user.subscriptionStartedAt),
    subscriptionEndsAt: toIsoOrNull(user.subscriptionEndsAt),
    restricted: user.restricted,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    requestCount,
    lastActiveAt,
  };
}

function mapRequestRow(r) {
  return {
    id: r.id,
    query: r.query,
    intent: r.intent,
    city: r.city,
    hospitalName: r.hospitalName ?? r.hospital?.name ?? null,
    preferredDate: r.preferredDate,
    status: r.status,
    notifyEmail: r.notifyEmail,
    notifyFasterRefresh: r.notifyFasterRefresh,
    notifySms: r.notifySms,
    createdAt: r.createdAt,
  };
}

async function listAdminUsers(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limitRaw = Number(req.query.limit) || 20;
    const limit = Math.min(Math.max(limitRaw, 10), 100);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          ...userListSelect,
          _count: { select: { appointmentRequests: true } },
          appointmentRequests: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { createdAt: true },
          },
        },
      }),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return res.json({
      users: rows.map((u) =>
        mapUserRow(u, u._count.appointmentRequests, u.appointmentRequests[0]?.createdAt ?? null),
      ),
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    return next(error);
  }
}

async function getAdminUser(req, res, next) {
  try {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ...userListSelect,
        _count: { select: { appointmentRequests: true } },
        appointmentRequests: {
          orderBy: { createdAt: "desc" },
          take: 100,
          include: {
            hospital: { select: { name: true, city: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const lastRequestAt = user.appointmentRequests[0]?.createdAt ?? null;

    return res.json({
      user: mapUserRow(user, user._count.appointmentRequests, lastRequestAt),
      requests: user.appointmentRequests.map(mapRequestRow),
    });
  } catch (error) {
    return next(error);
  }
}

async function updateAdminUser(req, res, next) {
  try {
    const { userId } = req.params;
    const raw = req.body ?? {};

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "User not found." });
    }

    const data = {};

    if (raw.name !== undefined) {
      const name = typeof raw.name === "string" ? raw.name.trim() : "";
      if (!name || name.length < 2) {
        return res.status(400).json({ error: "Please enter a valid name." });
      }
      data.name = name;
    }

    if (raw.email !== undefined) {
      const email = typeof raw.email === "string" ? raw.email.trim().toLowerCase() : "";
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: "Valid email is required." });
      }
      if (email !== existing.email) {
        const clash = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });
        if (clash && clash.id !== userId) {
          return res.status(409).json({ error: "Email is already in use." });
        }
      }
      data.email = email;
    }

    if (raw.phone !== undefined) {
      data.phone =
        typeof raw.phone === "string" && raw.phone.trim() ? raw.phone.trim() : null;
    }

    if (raw.restricted !== undefined) {
      data.restricted = raw.restricted === true || raw.restricted === "true";
      if (data.restricted) {
        data.sessionToken = null;
      }
    }

    if (raw.subscriptionPlan !== undefined) {
      const plan =
        typeof raw.subscriptionPlan === "string" ? raw.subscriptionPlan.trim().toLowerCase() : "";
      if (plan === "free") {
        data.subscriptionPlan = "free";
        data.subscriptionEndsAt = new Date();
      } else if (plan === "pro") {
        data.subscriptionPlan = "pro";
        data.subscriptionStartedAt = new Date();
        data.subscriptionEndsAt = null;
      } else if (plan === "" || plan === "null") {
        data.subscriptionPlan = null;
      } else {
        return res.status(400).json({ error: "Invalid subscription plan." });
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "No fields to update." });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        ...userListSelect,
        _count: { select: { appointmentRequests: true } },
        appointmentRequests: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    });

    return res.json({
      user: mapUserRow(
        updated,
        updated._count.appointmentRequests,
        updated.appointmentRequests[0]?.createdAt ?? null,
      ),
    });
  } catch (error) {
    return next(error);
  }
}

async function deleteAdminUser(req, res, next) {
  try {
    const { userId } = req.params;
    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });
    if (!existing) {
      return res.status(404).json({ error: "User not found." });
    }

    await prisma.user.delete({ where: { id: userId } });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listAdminUsers,
  getAdminUser,
  updateAdminUser,
  deleteAdminUser,
};
