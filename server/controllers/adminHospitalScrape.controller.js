const prisma = require("../prisma/prisma");

function toTrimmedString(value) {
  if (value == null || typeof value !== "string") return "";
  return value.trim();
}

const SORT_MAP = {
  rowNum: { importedAt: "asc" },
  routeId: { routeId: undefined },
  provider: { provider: undefined },
  city: { city: undefined },
  service: { serviceName: undefined },
  urgency: { urgency: undefined },
  region: { region: undefined },
  appointment: { appointmentSummary: undefined },
  phone: { phone: undefined },
  address: { address: undefined },
};

async function getHospitalScrapeMeta(req, res, next) {
  try {
    const rowCount = await prisma.ezdravListing.count();

    const [services, urgencies, regions, cities] = await Promise.all([
      prisma.ezdravListing.groupBy({
        by: ["serviceName"],
        where: { serviceName: { not: null } },
        _count: { serviceName: true },
        orderBy: { _count: { serviceName: "desc" } },
        take: 20,
      }),
      prisma.ezdravListing.groupBy({
        by: ["urgency"],
        where: { urgency: { not: null } },
        _count: { urgency: true },
        orderBy: { _count: { urgency: "desc" } },
        take: 10,
      }),
      prisma.ezdravListing.groupBy({
        by: ["region"],
        where: { region: { not: null } },
        _count: { region: true },
        orderBy: { _count: { region: "desc" } },
        take: 20,
      }),
      prisma.ezdravListing.groupBy({
        by: ["city"],
        where: { city: { not: null } },
        _count: { city: true },
        orderBy: { _count: { city: "desc" } },
        take: 20,
      }),
    ]);

    const [allServices, allUrgencies, allRegions, allCities] = await Promise.all([
      prisma.ezdravListing.findMany({
        where: { serviceName: { not: null } },
        distinct: ["serviceName"],
        select: { serviceName: true },
        orderBy: { serviceName: "asc" },
      }),
      prisma.ezdravListing.findMany({
        where: { urgency: { not: null } },
        distinct: ["urgency"],
        select: { urgency: true },
        orderBy: { urgency: "asc" },
      }),
      prisma.ezdravListing.findMany({
        where: { region: { not: null } },
        distinct: ["region"],
        select: { region: true },
        orderBy: { region: "asc" },
      }),
      prisma.ezdravListing.findMany({
        where: { city: { not: null } },
        distinct: ["city"],
        select: { city: true },
        orderBy: { city: "asc" },
      }),
    ]);

    return res.json({
      csvDir: "(database)",
      sourceFiles: [],
      fileCount: 0,
      rowCount,
      facets: {
        services: allServices.map((r) => r.serviceName).filter(Boolean),
        urgencies: allUrgencies.map((r) => r.urgency).filter(Boolean),
        regions: allRegions.map((r) => r.region).filter(Boolean),
        cities: allCities.map((r) => r.city).filter(Boolean),
      },
      summary: {
        byService: services.map((r) => ({ name: r.serviceName, count: r._count.serviceName })),
        byUrgency: urgencies.map((r) => ({ name: r.urgency, count: r._count.urgency })),
        byRegion: regions.map((r) => ({ name: r.region, count: r._count.region })),
        byCity: cities.map((r) => ({ name: r.city, count: r._count.city })),
      },
      sortFields: Object.keys(SORT_MAP),
    });
  } catch (error) {
    return next(error);
  }
}

async function listHospitalScrapeRows(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limitRaw = Number(req.query.limit) || 25;
    const limit = Math.min(Math.max(limitRaw, 5), 100);

    const q = toTrimmedString(req.query.q);
    const service = toTrimmedString(req.query.service) || "";
    const urgencyFilter = toTrimmedString(req.query.urgency) || "";
    const region = toTrimmedString(req.query.region) || "";
    const city = toTrimmedString(req.query.city) || "";

    const sortKey = toTrimmedString(req.query.sort) || "rowNum";
    const orderDir = toTrimmedString(req.query.order) === "desc" ? "desc" : "asc";

    const where = {};
    const andClauses = [];

    if (service) andClauses.push({ serviceName: service });
    if (urgencyFilter) andClauses.push({ urgency: urgencyFilter });
    if (region) andClauses.push({ region });
    if (city) andClauses.push({ city });

    if (q) {
      andClauses.push({
        OR: [
          { provider: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
          { address: { contains: q, mode: "insensitive" } },
          { postalCode: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
          { serviceName: { contains: q, mode: "insensitive" } },
          { appointmentSummary: { contains: q, mode: "insensitive" } },
          { website: { contains: q, mode: "insensitive" } },
          { routeId: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { urgency: { contains: q, mode: "insensitive" } },
          { region: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    if (andClauses.length > 0) where.AND = andClauses;

    const sortEntry = SORT_MAP[sortKey] || SORT_MAP.rowNum;
    const sortField = Object.keys(sortEntry)[0];
    const orderBy = [{ [sortField]: orderDir }];

    const total = await prisma.ezdravListing.count({ where });
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;

    const rows = await prisma.ezdravListing.findMany({
      where,
      orderBy,
      skip: offset,
      take: limit,
    });

    return res.json({
      rows: rows.map((r, idx) => ({
        rowNum: String(offset + idx + 1),
        routeId: r.routeId || "",
        urgencyFile: r.urgency || "",
        serviceName: r.serviceName || "",
        urgencyPage: r.urgencyPage || "",
        region: r.region || "",
        serviceUnavailable: r.serviceUnavailable ? "da" : "ne",
        eOrderNotPossible: r.eOrderNotPossible ? "da" : "ne",
        provider: r.provider || "",
        website: r.website || "",
        websiteDisabled: r.websiteDisabled ? "da" : "ne",
        appointmentSummary: r.appointmentSummary || "",
        address: r.address || "",
        postalCode: r.postalCode || "",
        city: r.city || "",
        email: r.email || "",
        phone: r.phone || "",
        fax: r.fax || "",
        lastUpdated: r.lastUpdated || "",
        remarks: r.remarks || "",
        ambulances: r.ambulances || "",
        sourceFile: r.sourceFile || "",
      })),
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
      filters: {
        q: q || undefined,
        service: service || undefined,
        urgency: urgencyFilter || undefined,
        region: region || undefined,
        city: city || undefined,
      },
      sort: SORT_MAP[sortKey] ? sortKey : "rowNum",
      order: orderDir,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getHospitalScrapeMeta,
  listHospitalScrapeRows,
};
