const prisma = require("../prisma/prisma");
const { analyzePatientSearch } = require("../services/patientSearchOpenAI");

async function searchAppointments(req, res, next) {
  try {
    const query = typeof req.body?.query === "string" ? req.body.query.trim() : "";
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    // Use AI to analyze the search query
    let analysis;
    try {
      analysis = await analyzePatientSearch(query);
    } catch (err) {
      if (err.code === "OPENAI_NOT_CONFIGURED") {
        return res.status(503).json({
          error: "Search service is temporarily unavailable. Please try again later.",
        });
      }
      throw err;
    }

    // Build database query based on AI analysis
    const specialtyFilters = analysis.specialties.length > 0
      ? analysis.specialties.map((s) => ({
          specialty: { contains: s, mode: "insensitive" },
        }))
      : [];

    const procedureFilters = analysis.procedures.length > 0
      ? analysis.procedures.map((p) => ({
          procedureName: { contains: p, mode: "insensitive" },
        }))
      : [];

    // Combine service filters
    const serviceWhere = {
      isActive: true,
      ...(specialtyFilters.length > 0 || procedureFilters.length > 0
        ? {
            OR: [...specialtyFilters, ...procedureFilters],
          }
        : {}),
    };

    // Find hospitals with matching services
    const hospitals = await prisma.hospital.findMany({
      where: {
        isActive: true,
        services: {
          some: serviceWhere,
        },
        ...(analysis.cities.length > 0
          ? {
              OR: analysis.cities.map((c) => ({
                city: { contains: c, mode: "insensitive" },
              })),
            }
          : {}),
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

    // Extract unique cities from results
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
      a.name.localeCompare(b.name)
    );

    // Format hospitals for dropdown
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

    return res.json({
      intent: analysis.intent,
      explanation: analysis.explanation,
      query,
      cities,
      hospitals: hospitalsList,
      totalHospitals: hospitalsList.length,
    });
  } catch (error) {
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

module.exports = {
  searchAppointments,
  getCities,
};
