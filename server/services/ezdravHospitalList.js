const { Prisma } = require("../generated/prisma");
const prisma = require("../prisma/prisma");

function providerGroupId(provider, city) {
  const key = `${provider || ""}\0${city || ""}`;
  return `ezdrav:${Buffer.from(key, "utf8").toString("base64url")}`;
}

function buildSearchPattern(q) {
  if (!q) return null;
  return `%${q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_")}%`;
}

function buildWhereSql(q) {
  const pattern = buildSearchPattern(q);
  const base = Prisma.sql`"serviceUnavailable" = false`;
  if (!pattern) {
    return Prisma.sql`WHERE ${base}`;
  }
  return Prisma.sql`WHERE ${base} AND (
    COALESCE("provider", '') ILIKE ${pattern} OR
    COALESCE("city", '') ILIKE ${pattern} OR
    COALESCE("serviceName", '') ILIKE ${pattern} OR
    COALESCE("address", '') ILIKE ${pattern} OR
    COALESCE("phone", '') ILIKE ${pattern} OR
    COALESCE("region", '') ILIKE ${pattern} OR
    COALESCE("urgency", '') ILIKE ${pattern}
  )`;
}

function mapListingToService(l) {
  return {
    id: l.id,
    specialty: l.urgency || null,
    procedureName: l.serviceName,
    estimatedWaitDays: null,
    earliestDate: null,
    isActive: !l.serviceUnavailable,
    notes: l.appointmentSummary || l.remarks || null,
    region: l.region || null,
    urgency: l.urgency || null,
    routeId: l.routeId || null,
    appointmentSummary: l.appointmentSummary || null,
    remarks: l.remarks || null,
    ambulances: l.ambulances || null,
    lastUpdated: l.lastUpdated || null,
    serviceUnavailable: l.serviceUnavailable,
    eOrderNotPossible: l.eOrderNotPossible,
    websiteDisabled: l.websiteDisabled,
    postalCode: l.postalCode || null,
    fax: l.fax || null,
  };
}

function groupListingsIntoHospital(groups, listings) {
  const byKey = new Map();
  for (const l of listings) {
    const key = `${l.provider || ""}::${l.city || ""}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key).push(l);
  }

  return groups.map((g) => {
    const key = `${g.provider || ""}::${g.city || ""}`;
    const rows = byKey.get(key) || [];
    const first = rows[0];
    const activeServices = rows.filter((r) => !r.serviceUnavailable);

    return {
      id: providerGroupId(g.provider, g.city),
      name: g.provider || "Unknown provider",
      city: g.city,
      country: "Slovenia",
      address: first?.address ?? null,
      phone: first?.phone ?? null,
      email: first?.email ?? null,
      website: first?.website ?? null,
      emergency24h: null,
      bedCount: null,
      averageWaitDays: null,
      isActive: activeServices.length > 0,
      notes: null,
      serviceCount: rows.length,
      services: rows.map(mapListingToService),
      dataSource: "ezdrav",
    };
  });
}

async function listEzdravHospitalsGrouped({ page, limit, q }) {
  const offset = (page - 1) * limit;
  const wherePart = buildWhereSql(q);

  const countRows = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS total FROM (
      SELECT 1 FROM "EzdravListing" ${wherePart}
      GROUP BY "provider", "city"
    ) g
  `;
  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const safePage = Math.min(page, totalPages);

  if (total === 0) {
    return {
      hospitals: [],
      pagination: { page: safePage, limit, total: 0, totalPages: 1 },
      dataSource: "ezdrav",
      listingCount: await prisma.ezdravListing.count(),
    };
  }

  const groups = await prisma.$queryRaw`
    SELECT "provider", "city", COUNT(*)::int AS listing_count
    FROM "EzdravListing"
    ${wherePart}
    GROUP BY "provider", "city"
    ORDER BY "city" ASC NULLS LAST, "provider" ASC NULLS LAST
    LIMIT ${limit} OFFSET ${offset}
  `;

  const listings = await prisma.ezdravListing.findMany({
    where: {
      OR: groups.map((g) => ({
        provider: g.provider,
        city: g.city,
      })),
    },
    orderBy: [{ city: "asc" }, { provider: "asc" }, { serviceName: "asc" }],
  });

  const hospitals = groupListingsIntoHospital(groups, listings);
  const listingCount = await prisma.ezdravListing.count();

  return {
    hospitals,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
    dataSource: "ezdrav",
    listingCount,
  };
}

module.exports = {
  listEzdravHospitalsGrouped,
  providerGroupId,
};
