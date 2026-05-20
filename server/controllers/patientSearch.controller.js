const fs = require("fs/promises");
const prisma = require("../prisma/prisma");
const { analyzePatientSearch, serviceMatchesKeywords } = require("../services/patientSearchOpenAI");
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

    const allKeywords = [
      ...analysis.serviceKeywords,
      ...analysis.procedures,
      ...analysis.specialties,
    ].filter(Boolean);

    // If AI couldn't understand the query (no keywords), return empty results
    if (allKeywords.length === 0) {
      await unlinkUploadPaths(uploaded);
      return res.json({
        intent: analysis.intent,
        explanation: analysis.explanation,
        query,
        filterCity: officialCity,
        cities: [],
        hospitals: [],
        totalHospitals: 0,
        referralVision: visionPayload,
      });
    }

    const serviceFilters = allKeywords.map((kw) => ({
      serviceName: { contains: kw, mode: "insensitive" },
    }));

    const cityClause = officialCity
      ? { city: { equals: officialCity, mode: "insensitive" } }
      : analysis.cities.length > 0
        ? {
            OR: analysis.cities.map((c) => ({
              city: { contains: c, mode: "insensitive" },
            })),
          }
        : {};

    const where = {
      serviceUnavailable: false,
      OR: serviceFilters,
      ...cityClause,
    };

    const rawListings = await prisma.ezdravListing.findMany({
      where,
      orderBy: [{ city: "asc" }, { provider: "asc" }],
      take: 100, // fetch more initially, will filter down
    });

    // Post-filter: ensure each listing's serviceName matches at least one of the AI keywords
    // This prevents broad DB matches from polluting results
    const filterKeywords = analysis.primaryKeyword
      ? [analysis.primaryKeyword, ...analysis.serviceKeywords.slice(0, 3)]
      : analysis.serviceKeywords.slice(0, 5);

    const listings =
      filterKeywords.length > 0
        ? rawListings
            .filter((l) => serviceMatchesKeywords(l.serviceName, filterKeywords))
            .slice(0, 50)
        : rawListings.slice(0, 50);

    const citiesMap = new Map();
    const hospitalsMap = new Map();

    for (const l of listings) {
      if (l.city && !citiesMap.has(l.city)) {
        citiesMap.set(l.city, { name: l.city, country: "Slovenia", hospitalCount: 0 });
      }

      const providerKey = `${l.provider || ""}::${l.city || ""}`;
      if (!hospitalsMap.has(providerKey)) {
        hospitalsMap.set(providerKey, {
          id: l.id,
          name: l.provider || "Unknown provider",
          city: l.city,
          country: "Slovenia",
          address: l.address,
          phone: l.phone,
          email: l.email,
          website: l.website,
          averageWaitDays: null,
          services: [],
        });
        if (l.city && citiesMap.has(l.city)) {
          citiesMap.get(l.city).hospitalCount++;
        }
      }

      const h = hospitalsMap.get(providerKey);
      h.services.push({
        id: l.id,
        specialty: l.urgency || null,
        procedureName: l.serviceName,
        estimatedWaitDays: null,
        appointmentSummary: l.appointmentSummary || null,
        region: l.region || null,
        urgency: l.urgency || null,
      });
    }

    const cities = Array.from(citiesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    const hospitalsList = Array.from(hospitalsMap.values());

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
    const cities = await prisma.ezdravListing.groupBy({
      by: ["city"],
      where: {
        city: { not: null },
        serviceUnavailable: false,
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
