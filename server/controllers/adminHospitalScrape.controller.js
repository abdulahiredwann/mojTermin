const path = require("path");
const {
  loadAllRows,
  getFacetsAndSummary,
} = require("../services/ezdravHospitalScrapeCsv");

function toTrimmedString(value) {
  if (value == null || typeof value !== "string") return "";
  return value.trim();
}

const SORT_FIELDS = {
  rowNum: (r) => Number.parseInt(String(r.rowNum), 10) || 0,
  routeId: (r) => String(r.routeId || "").toLowerCase(),
  provider: (r) => String(r.provider || "").toLowerCase(),
  city: (r) => String(r.city || "").toLowerCase(),
  service: (r) => String(r.serviceName || "").toLowerCase(),
  urgency: (r) => String(r.urgencyFile || "").toLowerCase(),
  region: (r) => String(r.region || "").toLowerCase(),
  appointment: (r) => String(r.appointmentSummary || "").toLowerCase(),
  phone: (r) => String(r.phone || "").toLowerCase(),
  address: (r) => String(r.address || "").toLowerCase(),
};

function applyFilters(rows, { q, service, urgency, region, city }) {
  let out = rows;

  if (service) {
    out = out.filter((r) => r.serviceName === service);
  }
  if (urgency) {
    out = out.filter((r) => r.urgencyFile === urgency);
  }
  if (region) {
    out = out.filter((r) => r.region === region);
  }
  if (city) {
    out = out.filter((r) => r.city === city);
  }

  const needle = toTrimmedString(q).toLowerCase();
  if (needle) {
    out = out.filter((r) =>
      [
        r.provider,
        r.city,
        r.address,
        r.postalCode,
        r.phone,
        r.serviceName,
        r.appointmentSummary,
        r.website,
        r.routeId,
        r.email,
        r.urgencyFile,
        r.region,
      ].some((field) => field && String(field).toLowerCase().includes(needle)),
    );
  }

  return out;
}

function sortRows(rows, sortRaw, orderRaw) {
  const sort = SORT_FIELDS[sortRaw] ? sortRaw : "rowNum";
  const order = orderRaw === "desc" ? "desc" : "asc";
  const getter = SORT_FIELDS[sort];
  const mult = order === "desc" ? -1 : 1;

  return [...rows].sort((a, b) => {
    const va = getter(a);
    const vb = getter(b);
    if (va < vb) return -1 * mult;
    if (va > vb) return 1 * mult;
    const tieA = Number.parseInt(String(a.rowNum), 10) || 0;
    const tieB = Number.parseInt(String(b.rowNum), 10) || 0;
    return tieA - tieB;
  });
}

function publicRow(r) {
  return {
    rowNum: r.rowNum,
    routeId: r.routeId,
    urgencyFile: r.urgencyFile,
    serviceName: r.serviceName,
    urgencyPage: r.urgencyPage,
    region: r.region,
    serviceUnavailable: r.serviceUnavailable,
    eOrderNotPossible: r.eOrderNotPossible,
    provider: r.provider,
    website: r.website,
    websiteDisabled: r.websiteDisabled,
    appointmentSummary: r.appointmentSummary,
    address: r.address,
    postalCode: r.postalCode,
    city: r.city,
    email: r.email,
    phone: r.phone,
    fax: r.fax,
    lastUpdated: r.lastUpdated,
    remarks: r.remarks,
    ambulances: r.ambulances,
    sourceFile: r.sourceFile,
  };
}

async function getHospitalScrapeMeta(req, res, next) {
  try {
    const { dir, files, rows } = loadAllRows();
    const { facets, summary } = getFacetsAndSummary(rows);

    return res.json({
      csvDir: dir,
      sourceFiles: files.map((f) => path.basename(f)),
      fileCount: files.length,
      rowCount: rows.length,
      facets,
      summary,
      sortFields: Object.keys(SORT_FIELDS),
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
    const urgency = toTrimmedString(req.query.urgency) || "";
    const region = toTrimmedString(req.query.region) || "";
    const city = toTrimmedString(req.query.city) || "";

    const sort = toTrimmedString(req.query.sort) || "rowNum";
    const order = toTrimmedString(req.query.order) || "asc";

    const { rows: all } = loadAllRows();
    const filtered = applyFilters(all, { q, service, urgency, region, city });
    const sorted = sortRows(filtered, sort, order);

    const total = sorted.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * limit;
    const slice = sorted.slice(offset, offset + limit);

    return res.json({
      rows: slice.map(publicRow),
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
      filters: {
        q: q || undefined,
        service: service || undefined,
        urgency: urgency || undefined,
        region: region || undefined,
        city: city || undefined,
      },
      sort: SORT_FIELDS[sort] ? sort : "rowNum",
      order: order === "desc" ? "desc" : "asc",
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getHospitalScrapeMeta,
  listHospitalScrapeRows,
};
