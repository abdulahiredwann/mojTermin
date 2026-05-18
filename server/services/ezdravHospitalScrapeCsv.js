const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

function getCsvDir() {
  const fromEnv = process.env.EZDRAV_PREGLED_CSV_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.join(__dirname, "..", "scripts", "pregled_parts");
}

function listCsvFiles(dir) {
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith(".csv"))
    .map((f) => path.join(dir, f))
    .sort((a, b) => {
      const na = Number.parseInt(path.basename(a, path.extname(a)), 10);
      const nb = Number.parseInt(path.basename(b, path.extname(b)), 10);
      if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
      return path.basename(a).localeCompare(path.basename(b));
    });
}

function pick(raw, needles) {
  const keys = Object.keys(raw);
  for (const n of needles) {
    const key = keys.find((k) => k.includes(n));
    if (key) return String(raw[key] ?? "").trim();
  }
  return "";
}

function normalizeRecord(raw, fileLabel) {
  return {
    rowNum: pick(raw, [
      "Zaporedna številka (nadaljevanje",
      "Row number (continuous across files)",
    ]),
    routeId: pick(raw, ["Šifra storitve"]),
    urgencyFile: pick(raw, ["Nujnost po izbiri iskanja"]),
    serviceName: pick(raw, ["Naziv storitve (kaj je bilo iskano)", "Naziv storitve"]),
    urgencyPage: pick(raw, ["Stopnja nujnosti na strani"]),
    region: pick(raw, ["Region | Regija", "Regija"]),
    serviceUnavailable: pick(raw, [
      "Ali storitev sploh ni na voljo",
      "Service not offered at all",
    ]),
    eOrderNotPossible: pick(raw, [
      "Ali elektronsko naročanje",
      "E-ordering not possible",
    ]),
    topNotices: pick(raw, ["Obvestila ob naslovu strani", "Top-of-page notices"]),
    providerCount: pick(raw, [
      "Koliko ponudnikov je na tem seznamu",
      "Number of providers listed",
    ]),
    provider: pick(raw, [
      "Ime ponudnika ali zdravstvene ustanove",
      "Provider or institution name",
    ]),
    website: pick(raw, [
      "Spletna stran ponudnika (povezava)",
      "Provider website URL",
    ]),
    websiteDisabled: pick(raw, [
      "Ali je povezava na splet onemogočena",
      "Website link disabled",
    ]),
    appointmentSummary: pick(raw, [
      "Prvi prosti termin, okvirni datum",
      "First available appointment / approximate slot",
    ]),
    address: pick(raw, ["Naslov (ulica)", "Street address"]),
    postalCode: pick(raw, ["Poštna številka", "Postal code"]),
    city: pick(raw, ["City / town | Kraj", "City / town"]),
    email: pick(raw, ["E-pošta", "Email |"]),
    phone: pick(raw, ["Phone | Telefon", "Telefon"]),
    fax: pick(raw, ["Telefaks", "Fax |"]),
    lastUpdated: pick(raw, ["Zadnja posodobitev", "Last data refresh"]),
    remarks: pick(raw, ["Dodatna pojasnila ponudnika", "Additional provider notes"]),
    ambulances: pick(raw, [
      "razpoložljivost in opombe za vsako posebej",
      "Per-clinic availability",
    ]),
    sourceFile: pick(raw, ["Vir JSON datoteke", "Source JSON file"]) || fileLabel,
  };
}

let cache = null;

function buildCacheKey(dir, files) {
  const parts = files.map((f) => {
    try {
      const st = fs.statSync(f);
      return `${path.basename(f)}:${st.mtimeMs}:${st.size}`;
    } catch {
      return path.basename(f);
    }
  });
  return `${dir}|${parts.join("|")}`;
}

function loadAllRows() {
  const dir = getCsvDir();
  const files = listCsvFiles(dir);
  const key = buildCacheKey(dir, files);

  if (cache && cache.key === key) {
    return { dir, files, rows: cache.rows };
  }

  const rows = [];
  const labelByPath = new Map(files.map((f) => [f, path.basename(f)]));

  for (const filePath of files) {
    const label = labelByPath.get(filePath) ?? path.basename(filePath);
    let text;
    try {
      text = fs.readFileSync(filePath, "utf8");
    } catch (e) {
      console.error("[ezdravHospitalScrapeCsv] Skip file:", filePath, e.message);
      continue;
    }

    let records;
    try {
      records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        bom: true,
        relax_column_count: true,
        relax_quotes: true,
      });
    } catch (e) {
      console.error("[ezdravHospitalScrapeCsv] Parse error:", filePath, e.message);
      continue;
    }

    for (const rec of records) {
      rows.push(normalizeRecord(rec, label));
    }
  }

  cache = { key, rows };
  return { dir, files, rows };
}

function uniqueSorted(values) {
  return [...new Set(values.filter((v) => v && String(v).trim()))].sort((a, b) =>
    a.localeCompare(b, "sl", { sensitivity: "base" }),
  );
}

function topCounts(rows, getKey, limit = 25) {
  const map = new Map();
  for (const r of rows) {
    const k = getKey(r);
    if (!k) continue;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}

function getFacetsAndSummary(rows) {
  return {
    facets: {
      services: uniqueSorted(rows.map((r) => r.serviceName)),
      urgencies: uniqueSorted(rows.map((r) => r.urgencyFile)),
      regions: uniqueSorted(rows.map((r) => r.region)),
      cities: uniqueSorted(rows.map((r) => r.city)),
    },
    summary: {
      byService: topCounts(rows, (r) => r.serviceName, 20),
      byUrgency: topCounts(rows, (r) => r.urgencyFile, 10),
      byRegion: topCounts(rows, (r) => r.region, 20),
      byCity: topCounts(rows, (r) => r.city, 20),
    },
  };
}

module.exports = {
  getCsvDir,
  loadAllRows,
  getFacetsAndSummary,
};
