/**
 * Run 20 patient search API tests and validate against EzdravListing DB.
 * Usage: node scripts/test-search-validation.js
 */
require("dotenv").config();
const { PrismaClient } = require("../generated/prisma");

const BASE = process.env.API_BASE || "http://localhost:5000/api";
const prisma = new PrismaClient();

const TESTS = [
  { id: 1, query: "paliativna obravnava prvi pregled", city: "Ptuj", expectKw: ["paliativ"] },
  { id: 2, query: "MRI", city: "Ljubljana", expectKw: ["MRI", "mri"] },
  { id: 3, query: "ultrazvok", city: "Maribor", expectKw: ["ultrazvok", "ultrazv"] },
  { id: 4, query: "RTG rentgen", city: "Ptuj", expectKw: ["RTG", "rtg", "rentgen"] },
  { id: 5, query: "dermatology skin", city: "Celje", expectKw: ["dermat", "kož"] },
  { id: 6, query: "kardiološki pregled", city: "Novo mesto", expectKw: ["kardiol", "cardio"] },
  { id: 7, query: "CT scan", city: "Ljubljana", expectKw: ["CT", "ct"] },
  { id: 8, query: "ortopedski pregled", city: "Koper", expectKw: ["ortoped"] },
  { id: 9, query: "ginekološki", city: "Murska Sobota", expectKw: ["ginekol"] },
  { id: 10, query: "fizioterapija", city: "Celje", expectKw: ["fizioter", "fizikal"] },
  { id: 11, query: "laboratorij analiza", city: "Maribor", expectKw: ["laborator", "analiz"], note: "no lab services in Maribor DB" },
  { id: 12, query: "nevrologija", city: "Ljubljana", expectKw: ["nevrol"] },
  { id: 13, query: "okulist", city: "Nova Gorica", expectKw: ["okulist", "očes"] },
  { id: 14, query: "urologija", city: "Kranj", expectKw: ["urolog"] },
  { id: 15, query: "psihiatrija", city: "Maribor", expectKw: ["psihiatr"] },
  { id: 16, query: "hearing test sluh", city: "Ljubljana", expectKw: ["sluh", "audiolog"] },
  { id: 17, query: "covid vaccination", city: "Ptuj", expectKw: ["cepljen", "covid"] },
  { id: 18, query: "dental zobozdravnik", city: "Celje", expectKw: ["zobozdrav", "zob", "dental"] },
  { id: 19, query: "totally nonsense xyz123", city: "Ptuj", expectKw: ["xyz123"], expectZero: true },
  { id: 20, query: "pregled", city: "Ptuj", expectKw: ["pregled"], expectZero: true, note: "too generic, AI should reject" },
];

function buildDbWhere(city, keywords) {
  const orKws = keywords.flatMap((kw) => [
    { serviceName: { contains: kw, mode: "insensitive" } },
  ]);
  return {
    serviceUnavailable: false,
    city: { equals: city, mode: "insensitive" },
    ...(orKws.length ? { OR: orKws } : {}),
  };
}

function countProviders(listings) {
  const keys = new Set();
  for (const l of listings) {
    keys.add(`${l.provider || ""}::${l.city || ""}`);
  }
  return keys.size;
}

async function searchApi(query, city) {
  const res = await fetch(`${BASE}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, city }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  console.log("API:", BASE);
  console.log("=".repeat(72));

  const rows = [];
  let pass = 0;
  let warn = 0;
  let fail = 0;

  for (const t of TESTS) {
    const { status, data } = await searchApi(t.query, t.city);

    if (status !== 200) {
      rows.push({ ...t, verdict: "FAIL", reason: `HTTP ${status}: ${data.error || ""}` });
      fail++;
      continue;
    }

    const apiTotal = data.totalHospitals ?? 0;
    const apiServices = (data.hospitals || []).reduce(
      (n, h) => n + (h.services?.length || 0),
      0,
    );

    const dbListings = await prisma.ezdravListing.findMany({
      where: buildDbWhere(t.city, t.expectKw),
      take: 50,
      select: {
        provider: true,
        city: true,
        serviceName: true,
      },
    });
    const dbProviders = countProviders(dbListings);
    const dbRows = dbListings.length;

    let verdict = "PASS";
    let reason = "";

    const apiServiceNames = (data.hospitals || []).flatMap((h) =>
      (h.services || []).map((s) => (s.procedureName || "").toLowerCase()),
    );
    const kwMatch = t.expectKw.some((kw) =>
      apiServiceNames.some((sn) => sn.includes(kw.toLowerCase())),
    );

    if (t.expectZero) {
      if (apiTotal === 0) {
        reason = "correctly empty";
      } else {
        verdict = "WARN";
        reason = `expected 0, got ${apiTotal} hospitals`;
      }
    } else if (dbRows > 0 && apiTotal === 0) {
      verdict = "FAIL";
      reason = `DB has ${dbRows} rows (${dbProviders} providers) but API=0 — AI keywords likely wrong`;
    } else if (apiTotal > 0 && !kwMatch && dbRows > 0) {
      verdict = "WARN";
      reason = `API returned ${apiTotal} hospitals but no service name contains expected keywords`;
    } else if (dbRows === 0 && apiTotal === 0) {
      reason = "no listings in DB for test keywords in this city";
    } else if (apiTotal > 0 && kwMatch) {
      reason = `API ${apiTotal} hosp, ${apiServices} services; DB ref ${dbProviders} providers (${dbRows} rows@50)`;
    } else if (apiTotal > 0) {
      reason = `API ${apiTotal} hospitals (keyword check skipped, no DB ref)`;
    } else {
      reason = "empty";
    }

    const sampleService =
      data.hospitals?.[0]?.services?.[0]?.procedureName?.slice(0, 55) || "—";

    rows.push({
      id: t.id,
      query: t.query.slice(0, 35),
      city: t.city,
      intent: (data.intent || "").slice(0, 40),
      apiH: apiTotal,
      apiSvc: apiServices,
      dbRows,
      dbProv: dbProviders,
      verdict,
      reason,
      sample: sampleService,
    });

    if (verdict === "PASS") {
      if (!(t.expectZero || (dbRows === 0 && apiTotal === 0))) pass++;
      else if (t.expectZero && apiTotal === 0) pass++;
      else if (dbRows === 0 && apiTotal === 0) pass++;
    }
  }

  // Recount properly
  pass = rows.filter((r) => r.verdict === "PASS").length;
  warn = rows.filter((r) => r.verdict === "WARN").length;
  fail = rows.filter((r) => r.verdict === "FAIL").length;

  console.log(
    "\n# | Query (trunc)              | City          | API H | DB P | Verdict | Notes",
  );
  console.log("-".repeat(72));
  for (const r of rows) {
    console.log(
      `${String(r.id).padStart(2)} | ${r.query.padEnd(26)} | ${r.city.padEnd(13)} | ${String(r.apiH).padStart(5)} | ${String(r.dbProv).padStart(4)} | ${r.verdict.padEnd(7)} | ${r.reason}`,
    );
  }

  console.log("\n" + "=".repeat(72));
  console.log(`SUMMARY: ${pass} PASS, ${warn} WARN, ${fail} FAIL (of ${rows.length} tests)`);
  console.log("\nIntent samples:");
  for (const r of rows.filter((x) => x.apiH > 0).slice(0, 8)) {
    console.log(`  #${r.id}: ${r.intent} → ${r.sample}`);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
