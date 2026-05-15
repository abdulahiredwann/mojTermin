/**
 * Inserts rows from restore-preview/for-delivery-app.json and for-pickup-app.json
 * into DeliveryAddress and PickupAddress (current schema).
 *
 * Prereqs: DATABASE_URL in server/.env ; prisma generate ; areas already in DB (areaId FK).
 *
 * Dual-use addresses (same legacy id in both JSON files — backup type was null):
 *   Default: insert into BOTH tables. To restrict after client confirms, use either:
 *   - --overrides=file.json  → { "source-old-uuid": "delivery" | "pickup" | "both" }
 *   - --from-client-review=file.json → dual-use-for-client-review.json after filling "clientSays"
 *
 * Usage (from server/):
 *   node scripts/apply-restore-addresses.js --dry-run
 *   node scripts/apply-restore-addresses.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const fs = require("fs");
const path = require("path");
const prisma = require("../prisma/prisma");

const repoRoot = path.join(__dirname, "..", "..");

function parseArgs() {
  const argv = process.argv.slice(2);
  const o = {
    dryRun: argv.includes("--dry-run"),
    fromDir: path.join(repoRoot, "restore-preview"),
    overridesPath: null,
    clientReviewPath: null,
    dualUseDefault: "both",
  };
  for (const a of argv) {
    if (a === "--dry-run") continue;
    const m = /^--([\w-]+)=(.+)$/.exec(a);
    if (!m) continue;
    const v = path.resolve(process.cwd(), m[2]);
    if (m[1] === "from-dir") o.fromDir = v;
    else if (m[1] === "overrides") o.overridesPath = v;
    else if (m[1] === "from-client-review") o.clientReviewPath = v;
    else if (m[1] === "dual-use-default") o.dualUseDefault = v;
  }
  if (!["both", "delivery", "pickup"].includes(o.dualUseDefault)) {
    console.error('--dual-use-default must be "both", "delivery", or "pickup"');
    process.exit(1);
  }
  return o;
}

function norm(s) {
  if (s == null) return "";
  return String(s).trim();
}

function addrKey(areaId, street, businessName, receiverName) {
  return [
    areaId,
    norm(street).toLowerCase(),
    norm(businessName).toLowerCase(),
    norm(receiverName).toLowerCase(),
  ].join("\t");
}

function readJson(p, label) {
  if (!fs.existsSync(p)) throw new Error(`Missing ${label}: ${p}`);
  const raw = fs.readFileSync(p, "utf8");
  if (!raw.trim()) throw new Error(`${label} is empty: ${p}`);
  return JSON.parse(raw);
}

function loadOverrides(opts) {
  const merged = {};
  if (opts.overridesPath && fs.existsSync(opts.overridesPath)) {
    const o = readJson(opts.overridesPath, "overrides file");
    if (typeof o !== "object" || Array.isArray(o)) {
      throw new Error("overrides file must be a JSON object: id -> delivery|pickup|both");
    }
    Object.assign(merged, o);
  }
  if (opts.clientReviewPath && fs.existsSync(opts.clientReviewPath)) {
    const arr = readJson(opts.clientReviewPath, "client review file");
    if (!Array.isArray(arr)) throw new Error("client review file must be a JSON array");
    for (const item of arr) {
      const id = item.sourceOldAddressId;
      const cs = item.clientSays;
      if (id && cs != null && String(cs).trim() !== "") {
        merged[id] = String(cs).trim().toLowerCase();
      }
    }
  }
  for (const [k, v] of Object.entries(merged)) {
    if (!["delivery", "pickup", "both"].includes(v)) {
      throw new Error(`Invalid override for ${k}: "${v}" (use delivery | pickup | both)`);
    }
  }
  return merged;
}

/** dual-use = same sourceOldAddressId would be inserted in both tables without override */
function flowAllowed(flow, sourceOldAddressId, dualSet, overrides, dualDefault) {
  if (!dualSet.has(sourceOldAddressId)) return true;
  const decision = overrides[sourceOldAddressId] ?? dualDefault;
  if (decision === "both") return true;
  if (decision === "delivery") return flow === "delivery";
  if (decision === "pickup") return flow === "pickup";
  return true;
}

async function main() {
  const opts = parseArgs();
  const deliveryPath = path.join(opts.fromDir, "for-delivery-app.json");
  const pickupPath = path.join(opts.fromDir, "for-pickup-app.json");
  const deliveryRows = readJson(deliveryPath, "for-delivery-app.json");
  const pickupRows = readJson(pickupPath, "for-pickup-app.json");
  if (!Array.isArray(deliveryRows) || !Array.isArray(pickupRows)) {
    throw new Error("for-*-app.json files must be arrays");
  }

  const deliveryIds = new Set(deliveryRows.map((r) => r.sourceOldAddressId));
  const pickupIds = new Set(pickupRows.map((r) => r.sourceOldAddressId));
  const dualSet = new Set([...deliveryIds].filter((id) => pickupIds.has(id)));

  const overrides = loadOverrides(opts);

  const deliveryPlanned = deliveryRows.filter((r) =>
    flowAllowed("delivery", r.sourceOldAddressId, dualSet, overrides, opts.dualUseDefault),
  );
  const pickupPlanned = pickupRows.filter((r) =>
    flowAllowed("pickup", r.sourceOldAddressId, dualSet, overrides, opts.dualUseDefault),
  );

  const areaIds = new Set();
  for (const r of deliveryPlanned) areaIds.add(r.areaId);
  for (const r of pickupPlanned) areaIds.add(r.areaId);

  const existingAreas = await prisma.area.findMany({
    where: { id: { in: [...areaIds] } },
    select: { id: true },
  });
  const areaOk = new Set(existingAreas.map((a) => a.id));
  const missingAreas = [...areaIds].filter((id) => !areaOk.has(id));
  if (missingAreas.length) {
    console.error("FK check failed: these areaId values are not in the database:");
    console.error(missingAreas);
    process.exit(1);
  }

  const existingDel = await prisma.deliveryAddress.findMany({
    select: { areaId: true, street: true, businessName: true, receiverName: true },
  });
  const existingPu = await prisma.pickupAddress.findMany({
    select: { areaId: true, street: true, businessName: true, receiverName: true },
  });
  const delKeys = new Set(existingDel.map((r) => addrKey(r.areaId, r.street, r.businessName, r.receiverName)));
  const puKeys = new Set(existingPu.map((r) => addrKey(r.areaId, r.street, r.businessName, r.receiverName)));

  const delToCreate = [];
  for (const r of deliveryPlanned) {
    const k = addrKey(r.areaId, r.street, r.businessName, r.receiverName);
    if (delKeys.has(k)) continue;
    delKeys.add(k);
    delToCreate.push({
      street: norm(r.street),
      businessName: norm(r.businessName) || null,
      receiverName: norm(r.receiverName) || null,
      areaId: r.areaId,
    });
  }

  const puToCreate = [];
  for (const r of pickupPlanned) {
    const k = addrKey(r.areaId, r.street, r.businessName, r.receiverName);
    if (puKeys.has(k)) continue;
    puKeys.add(k);
    puToCreate.push({
      street: norm(r.street),
      businessName: norm(r.businessName) || null,
      receiverName: norm(r.receiverName) || null,
      areaId: r.areaId,
    });
  }

  const summary = {
    dryRun: opts.dryRun,
    dualUseLegacyIds: dualSet.size,
    deliveryPlanned: deliveryPlanned.length,
    pickupPlanned: pickupPlanned.length,
    deliveryCreate: delToCreate.length,
    pickupCreate: puToCreate.length,
    deliverySkippedDuplicate: deliveryPlanned.length - delToCreate.length,
    pickupSkippedDuplicate: pickupPlanned.length - puToCreate.length,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (opts.dryRun) {
    console.log("\n--dry-run: no database writes.");
    await prisma.$disconnect();
    return;
  }

  for (const data of delToCreate) {
    await prisma.deliveryAddress.create({ data });
  }
  for (const data of puToCreate) {
    await prisma.pickupAddress.create({ data });
  }

  console.log("\nDone. Created delivery:", delToCreate.length, "pickup:", puToCreate.length);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
