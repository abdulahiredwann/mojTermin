/**
 * Build JSON files to REVIEW before migrating addresses into the current DB.
 * Does NOT connect to the database.
 *
 * Maps old areaId -> suburb+code (oldarea.json) -> new area id (currentarea.json).
 * If suburb+code changed between exports (e.g. postcode digit), falls back to a unique suburb name in current.
 *
 * Inputs (defaults = repo root):
 *   --old-area=../oldarea.json
 *   --current-area=../currentarea.json
 *   --from-json=../olddeliver.json     (object: oldAreaId -> address[])
 *   --from-sql=../d2ddeliver_backup.sql (pg_dump COPY for "Address")
 *   --out=../restore-preview
 *
 * If both JSON and SQL are provided, SQL is used as the primary address list (has type + full list);
 * a small diff report is written if ID sets differ.
 *
 * Also writes dual-use-for-client-review.json when the same legacy address id appears in both delivery
 * and pickup (usually SQL type was null) — send to the client to choose delivery / pickup / both before migrate.
 *
 * Usage (from server/):
 *   node scripts/preview-restore-addresses.js
 */

const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..", "..");

function parseArgs() {
  const o = {
    oldArea: path.join(repoRoot, "oldarea.json"),
    currentArea: path.join(repoRoot, "currentarea.json"),
    fromJson: path.join(repoRoot, "olddeliver.json"),
    fromSql: path.join(repoRoot, "d2ddeliver_backup_20260511_173044.sql"),
    outDir: path.join(repoRoot, "restore-preview"),
  };
  for (const a of process.argv.slice(2)) {
    const m = /^--([\w-]+)=(.+)$/.exec(a);
    if (!m) continue;
    const v = path.resolve(process.cwd(), m[2]);
    if (m[1] === "old-area") o.oldArea = v;
    else if (m[1] === "current-area") o.currentArea = v;
    else if (m[1] === "from-json") o.fromJson = v;
    else if (m[1] === "from-sql") o.fromSql = v;
    else if (m[1] === "out") o.outDir = v;
  }
  return o;
}

function norm(s) {
  return typeof s === "string" ? s.trim() : "";
}

function areaKey(suburb, code) {
  return `${norm(suburb).toLowerCase()}|${norm(code).toLowerCase()}`;
}

function nullIfCopyNull(v) {
  if (v === "\\N" || v === "") return null;
  return v;
}

function readJson(p, label) {
  if (!fs.existsSync(p)) throw new Error(`Missing ${label}: ${p}`);
  const raw = fs.readFileSync(p, "utf8");
  if (!raw.trim()) throw new Error(`${label} is empty: ${p}`);
  return JSON.parse(raw);
}

/** Returns null if missing or empty/whitespace (optional inputs like olddeliver.json). */
function readJsonIfNonEmpty(p) {
  if (!fs.existsSync(p)) return null;
  const raw = fs.readFileSync(p, "utf8");
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

function buildAreaResolver(oldAreasArr, currentAreasArr) {
  const currentIds = new Set(currentAreasArr.map((r) => r.id).filter(Boolean));
  const newIdByKey = new Map();
  const dupKeys = [];
  for (const row of currentAreasArr) {
    const k = areaKey(row.suburb, row.code);
    if (newIdByKey.has(k)) {
      dupKeys.push(k);
      continue;
    }
    newIdByKey.set(k, { id: row.id, suburb: row.suburb, code: row.code });
  }

  /** Same suburb name (normalized) -> current area rows; used when old code ≠ current code. */
  const currentRowsBySuburb = new Map();
  for (const row of currentAreasArr) {
    const sn = norm(row.suburb).toLowerCase();
    if (!sn) continue;
    if (!currentRowsBySuburb.has(sn)) currentRowsBySuburb.set(sn, []);
    currentRowsBySuburb.get(sn).push(row);
  }

  const oldMetaById = new Map();
  for (const row of oldAreasArr) {
    if (row.id) oldMetaById.set(row.id, { suburb: row.suburb, code: row.code });
  }

  function resolve(oldAreaId) {
    if (!oldAreaId) return null;
    if (currentIds.has(oldAreaId)) {
      const row = currentAreasArr.find((x) => x.id === oldAreaId);
      return row
        ? { newAreaId: oldAreaId, suburb: row.suburb, code: row.code, match: "id_already_current" }
        : { newAreaId: oldAreaId, suburb: null, code: null, match: "id_already_current" };
    }
    const meta = oldMetaById.get(oldAreaId);
    if (!meta) return null;
    const hit = newIdByKey.get(areaKey(meta.suburb, meta.code));
    if (hit) {
      return {
        newAreaId: hit.id,
        suburb: hit.suburb,
        code: hit.code,
        match: "suburb_code",
      };
    }
    const subNorm = norm(meta.suburb).toLowerCase();
    const bySub = currentRowsBySuburb.get(subNorm);
    if (bySub && bySub.length === 1) {
      const row = bySub[0];
      return {
        newAreaId: row.id,
        suburb: row.suburb,
        code: row.code,
        match: "suburb_only",
      };
    }
    return null;
  }

  return { resolve, dupKeys };
}

function flowsFromType(t) {
  if (t === "delivery") return ["delivery"];
  if (t === "pickup") return ["pickup"];
  return ["delivery", "pickup"];
}

/** olddeliver.json: { [oldAreaId]: Address[] } */
function flattenOldDeliver(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    throw new Error("olddeliver.json must be an object keyed by area id");
  }
  const rows = [];
  for (const [areaKey, list] of Object.entries(obj)) {
    if (!Array.isArray(list)) continue;
    for (const a of list) {
      rows.push({
        id: a.id,
        street: a.street,
        areaId: a.areaId ?? areaKey,
        businessName: a.businessName ?? null,
        receiverName: a.receiverName ?? null,
        type: a.type ?? null,
        _source: "olddeliver.json",
      });
    }
  }
  return rows;
}

/** pg_dump COPY public."Address" ... */
function parseSqlAddresses(sqlPath) {
  if (!fs.existsSync(sqlPath)) return [];
  const text = fs.readFileSync(sqlPath, "utf8");
  const needle = 'COPY public."Address"';
  const i = text.indexOf(needle);
  if (i === -1) return [];
  const from = text.indexOf("FROM stdin;", i);
  if (from === -1) return [];
  const start = text.indexOf("\n", from) + 1;
  const end = text.indexOf("\n\\.\n", start);
  if (end === -1) return [];
  const body = text.slice(start, end);
  const rows = [];
  for (const line of body.split("\n")) {
    if (!line.trim()) continue;
    const parts = line.split("\t");
    if (parts.length < 7) continue;
    const [id, street, areaId, , businessName, receiverName, type] = parts;
    rows.push({
      id,
      street,
      areaId,
      businessName: nullIfCopyNull(businessName),
      receiverName: nullIfCopyNull(receiverName),
      type: nullIfCopyNull(type),
      _source: path.basename(sqlPath),
    });
  }
  return rows;
}

function buildRecords(rawRows, resolve) {
  const records = [];
  const unmapped = [];
  const seen = new Set();

  for (const r of rawRows) {
    const street = norm(r.street);
    if (!street) continue;
    const mapped = resolve(r.areaId);
    if (!mapped) {
      unmapped.push({
        sourceOldAddressId: r.id,
        street,
        oldAreaId: r.areaId,
        businessName: r.businessName,
        receiverName: r.receiverName,
        type: r.type,
        _source: r._source,
      });
      continue;
    }

    const key = `${r.id}`;
    if (seen.has(key)) continue;
    seen.add(key);

    records.push({
      sourceOldAddressId: r.id,
      street,
      businessName: r.businessName,
      receiverName: r.receiverName,
      sourceType: r.type,
      flows: flowsFromType(r.type),
      oldAreaId: r.areaId,
      currentAreaId: mapped.newAreaId,
      areaSuburb: mapped.suburb,
      areaCode: mapped.code,
      areaMatch: mapped.match,
      _source: r._source,
    });
  }

  return { records, unmapped };
}

function main() {
  const opts = parseArgs();
  const oldAreasArr = readJson(opts.oldArea, "oldarea.json");
  const currentAreasArr = readJson(opts.currentArea, "currentarea.json");
  if (!Array.isArray(oldAreasArr) || !Array.isArray(currentAreasArr)) {
    throw new Error("oldarea.json and currentarea.json must be JSON arrays");
  }

  const { resolve, dupKeys } = buildAreaResolver(oldAreasArr, currentAreasArr);

  let rawSql = [];
  let rawJson = [];
  if (fs.existsSync(opts.fromSql)) rawSql = parseSqlAddresses(opts.fromSql);
  const deliverObj = readJsonIfNonEmpty(opts.fromJson);
  if (deliverObj) {
    rawJson = flattenOldDeliver(deliverObj);
  } else if (fs.existsSync(opts.fromJson)) {
    console.warn(`Skipping empty olddeliver export: ${opts.fromJson}`);
  }

  let primary = rawSql.length > 0 ? rawSql : rawJson;
  let primaryLabel = rawSql.length > 0 ? "sql" : "json";
  if (rawSql.length === 0 && rawJson.length === 0) {
    console.error("No address rows: provide a valid --from-sql and/or --from-json");
    process.exit(1);
  }

  const { records, unmapped } = buildRecords(primary, resolve);

  const areaMatchCounts = {};
  for (const r of records) {
    const k = r.areaMatch || "unknown";
    areaMatchCounts[k] = (areaMatchCounts[k] || 0) + 1;
  }

  const byFlow = {
    delivery: records.filter((r) => r.flows.includes("delivery")),
    pickup: records.filter((r) => r.flows.includes("pickup")),
  };

  const deliveryIdSet = new Set(byFlow.delivery.map((r) => r.sourceOldAddressId));
  const pickupIdSet = new Set(byFlow.pickup.map((r) => r.sourceOldAddressId));
  const dualUseIds = [...deliveryIdSet].filter((id) => pickupIdSet.has(id)).sort();
  const dualUseForClient = dualUseIds.map((id) => {
    const r = byFlow.delivery.find((x) => x.sourceOldAddressId === id);
    return {
      sourceOldAddressId: id,
      street: r.street,
      businessName: r.businessName,
      receiverName: r.receiverName,
      areaId: r.currentAreaId,
      areaSuburb: r.areaSuburb,
      areaCode: r.areaCode,
      sourceTypeInBackup: r.sourceType,
      explain:
        "This address appears in both delivery and pickup lists because the backup Address.type was null. Ask the client: should this be delivery only, pickup only, or both?",
      clientSays: null,
    };
  });

  let diff = null;
  if (rawSql.length > 0 && rawJson.length > 0) {
    const idsS = new Set(rawSql.map((x) => x.id));
    const idsJ = new Set(rawJson.map((x) => x.id));
    const onlySql = [...idsS].filter((id) => !idsJ.has(id));
    const onlyJson = [...idsJ].filter((id) => !idsS.has(id));
    diff = {
      sqlCount: rawSql.length,
      jsonCount: rawJson.length,
      onlyInSql: onlySql,
      onlyInJson: onlyJson,
    };
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    primarySource: primaryLabel,
    oldAreaRows: oldAreasArr.length,
    currentAreaRows: currentAreasArr.length,
    duplicateSuburbCodeKeysInCurrent: dupKeys.length,
    addressRowsPrimary: primary.length,
    recordsUniqueByOldAddressId: records.length,
    deliveryRowsExpanded: byFlow.delivery.length,
    pickupRowsExpanded: byFlow.pickup.length,
    unmappedCount: unmapped.length,
    areaMatchCounts,
    dualUseForClientCount: dualUseForClient.length,
    note:
      "Review restore-preview/*.json then run migrate step when ready (separate command). This script does not touch the database.",
  };

  fs.mkdirSync(opts.outDir, { recursive: true });

  fs.writeFileSync(
    path.join(opts.outDir, "summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8",
  );
  fs.writeFileSync(
    path.join(opts.outDir, "restore-records.json"),
    JSON.stringify(records, null, 2),
    "utf8",
  );
  fs.writeFileSync(
    path.join(opts.outDir, "for-delivery-app.json"),
    JSON.stringify(
      byFlow.delivery.map((r) => ({
        sourceOldAddressId: r.sourceOldAddressId,
        street: r.street,
        businessName: r.businessName,
        receiverName: r.receiverName,
        areaId: r.currentAreaId,
        areaSuburb: r.areaSuburb,
        areaCode: r.areaCode,
      })),
      null,
      2,
    ),
    "utf8",
  );
  fs.writeFileSync(
    path.join(opts.outDir, "for-pickup-app.json"),
    JSON.stringify(
      byFlow.pickup.map((r) => ({
        sourceOldAddressId: r.sourceOldAddressId,
        street: r.street,
        businessName: r.businessName,
        receiverName: r.receiverName,
        areaId: r.currentAreaId,
        areaSuburb: r.areaSuburb,
        areaCode: r.areaCode,
      })),
      null,
      2,
    ),
    "utf8",
  );
  fs.writeFileSync(
    path.join(opts.outDir, "dual-use-for-client-review.json"),
    JSON.stringify(dualUseForClient, null, 2),
    "utf8",
  );
  fs.writeFileSync(
    path.join(opts.outDir, "unmapped.json"),
    JSON.stringify(unmapped, null, 2),
    "utf8",
  );

  if (diff) {
    fs.writeFileSync(path.join(opts.outDir, "json-vs-sql-diff.json"), JSON.stringify(diff, null, 2), "utf8");
  }

  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nWrote JSON preview to: ${opts.outDir}`);
}

main();
