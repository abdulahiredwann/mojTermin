const fs = require("fs/promises");
const prisma = require("../prisma/prisma");
const { analyzePatientSearch } = require("../services/patientSearchOpenAI");
const {
  analyzeReferralImagesFromFiles,
  buildAugmentedSearchQuery,
} = require("../services/referralVisionOpenAI");
const {
  getSortedLocations,
  normalizeCityToken,
} = require("../services/slovenianLocations");

async function unlinkUploadPaths(files) {
  await Promise.all((files || []).map((f) => fs.unlink(f.path).catch(() => {})));
}

function resolveOfficialCity(userCity) {
  if (typeof userCity !== "string" || !userCity.trim()) return null;
  const want = normalizeCityToken(userCity);
  const list = getSortedLocations();
  const exact = list.find((l) => normalizeCityToken(l.city) === want);
  if (exact) return exact.city;
  const partial = list.find(
    (l) =>
      normalizeCityToken(l.city).includes(want) || want.includes(normalizeCityToken(l.city)),
  );
  return partial ? partial.city : userCity.trim();
}

async function searchAppointments(req, res, next) {
  const uploaded = Array.isArray(req.files) ? req.files : [];

  try {
    const query = typeof req.body?.query === "string" ? req.body.query.trim() : "";
    if (!query) {
      await unlinkUploadPaths(uploaded);
      return res.status(400).json({ error: "Query is required." });
    }

    const userCityRaw = typeof req.body?.city === "string" ? req.body.city.trim() : "";
    const officialCity = userCityRaw ? resolveOfficialCity(userCityRaw) : null;

    let visionPayload = null;
    let visionForSearch = null;

    if (uploaded.length > 0) {
      try {
        visionForSearch = await analyzeReferralImagesFromFiles(uploaded);
        visionPayload = {
          headline: visionForSearch.headline,
          detailsMarkdown: visionForSearch.detailsMarkdown,
          specialtyHints: visionForSearch.specialtyHints,
          procedureHints: visionForSearch.procedureHints,
          rawEntities: visionForSearch.rawEntities,
          model: visionForSearch.model,
          imageCount: uploaded.length,
        };
      } catch (vErr) {
        if (vErr?.code === "OPENAI_NOT_CONFIGURED") {
          await unlinkUploadPaths(uploaded);
          return res.status(503).json({
            error: "Search service is temporarily unavailable. Please try again later.",
          });
        }
        visionPayload = {
          error: typeof vErr?.message === "string" ? vErr.message : "Image analysis failed.",
          headline: "",
          detailsMarkdown: "",
          specialtyHints: [],
          procedureHints: [],
          rawEntities: [],
          imageCount: uploaded.length,
        };
      }
    }

    const augmentedQuery = buildAugmentedSearchQuery(query, visionForSearch);

    let analysis;
    try {
      analysis = await analyzePatientSearch(augmentedQuery);
    } catch (err) {
      await unlinkUploadPaths(uploaded);
      if (err.code === "OPENAI_NOT_CONFIGURED") {
        return res.status(503).json({
          error: "Search service is temporarily unavailable. Please try again later.",
        });
      }
      throw err;
    }

    const specialtyFilters =
      analysis.specialties.length > 0
        ? analysis.specialties.map((s) => ({
            specialty: { contains: s, mode: "insensitive" },
          }))
        : [];

    const procedureFilters =
      analysis.procedures.length > 0
        ? analysis.procedures.map((p) => ({
            procedureName: { contains: p, mode: "insensitive" },
          }))
        : [];

    const serviceWhere = {
      isActive: true,
      ...(specialtyFilters.length > 0 || procedureFilters.length > 0
        ? {
            OR: [...specialtyFilters, ...procedureFilters],
          }
        : {}),
    };

    const cityClause = officialCity
      ? { city: { equals: officialCity, mode: "insensitive" } }
      : analysis.cities.length > 0
        ? {
            OR: analysis.cities.map((c) => ({
              city: { contains: c, mode: "insensitive" },
            })),
          }
        : {};

    const hospitals = await prisma.hospital.findMany({
      where: {
        isActive: true,
        services: {
          some: serviceWhere,
        },
        ...cityClause,
      },
      include: {
        services: {
          where: serviceWhere,
          orderBy: [{ specialty: "asc" }, { procedureName: "asc" }],
          take: 5,
        },
      },
      orderBy: [{ city: "asc" }, { name: "asc" }],
      take: 50,
    });

    const citiesMap = new Map();
    hospitals.forEach((h) => {
      if (h.city && !citiesMap.has(h.city)) {
        citiesMap.set(h.city, {
          name: h.city,
          country: h.country || "Slovenia",
          hospitalCount: 0,
        });
      }
      if (h.city && citiesMap.has(h.city)) {
        citiesMap.get(h.city).hospitalCount++;
      }
    });

    const cities = Array.from(citiesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    const hospitalsList = hospitals.map((h) => ({
      id: h.id,
      name: h.name,
      city: h.city,
      country: h.country || "Slovenia",
      address: h.address,
      phone: h.phone,
      averageWaitDays: h.averageWaitDays,
      services: h.services.map((s) => ({
        id: s.id,
        specialty: s.specialty,
        procedureName: s.procedureName,
        estimatedWaitDays: s.estimatedWaitDays,
      })),
    }));

    await unlinkUploadPaths(uploaded);

    return res.json({
      intent: analysis.intent,
      explanation: analysis.explanation,
      query,
      filterCity: officialCity,
      cities,
      hospitals: hospitalsList,
      totalHospitals: hospitalsList.length,
      referralVision: visionPayload,
    });
  } catch (error) {
    await unlinkUploadPaths(uploaded);
    return next(error);
  }
}

async function getCities(req, res, next) {
  try {
    const cities = await prisma.hospital.groupBy({
      by: ["city"],
      where: {
        isActive: true,
        city: { not: null },
      },
      _count: { city: true },
      orderBy: { city: "asc" },
    });

    return res.json({
      cities: cities
        .filter((c) => c.city)
        .map((c) => ({
          name: c.city,
          hospitalCount: c._count.city,
        })),
    });
  } catch (error) {
    return next(error);
  }
}

async function listLocations(req, res, next) {
  try {
    const locations = getSortedLocations();
    return res.json({ locations });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  searchAppointments,
  getCities,
  listLocations,
};
