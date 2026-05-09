const fs = require("fs");
const path = require("path");

/**
 * Largest cities first (referral UX), then alphabetical by city name (locale sl).
 * Population proxy — stable MVP ordering.
 */
const CITY_PRIORITY = [
  "Ljubljana",
  "Maribor",
  "Celje",
  "Kranj",
  "Velenje",
  "Koper",
  "Novo mesto",
  "Ptuj",
  "Murska Sobota",
  "Nova Gorica",
  "Jesenice",
  "Škofja Loka",
  "Domžale",
  "Kamnik",
  "Litija",
];

let cached = null;

function parseCitiyesFile() {
  const filePath = path.join(__dirname, "..", "citiyes.txt");
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/);
  let currentRegion = null;
  /** @type {{ city: string, region: string }[]} */
  const locations = [];

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (/REGIONS\s*\+\s*CITIES/i.test(t)) continue;

    if (t.startsWith("- ")) {
      const city = t.slice(2).trim();
      if (city && currentRegion) {
        locations.push({ city, region: currentRegion });
      }
      continue;
    }

    currentRegion = t;
  }

  return locations;
}

function sortLocations(locations) {
  const priorityIndex = new Map(CITY_PRIORITY.map((c, i) => [c, i]));

  return [...locations].sort((a, b) => {
    const pa = priorityIndex.has(a.city) ? priorityIndex.get(a.city) : 999;
    const pb = priorityIndex.has(b.city) ? priorityIndex.get(b.city) : 999;
    if (pa !== pb) return pa - pb;
    return a.city.localeCompare(b.city, "sl");
  });
}

function getSortedLocations() {
  if (!cached) {
    cached = sortLocations(parseCitiyesFile());
  }
  return cached;
}

/**
 * Normalize for loose matching against DB hospital.city (accent/case tolerant MVP).
 */
function normalizeCityToken(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

module.exports = {
  getSortedLocations,
  normalizeCityToken,
  CITY_PRIORITY,
};
