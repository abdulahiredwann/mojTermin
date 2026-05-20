/**
 * Import all eZdrav CSV rows from pregled_parts into the EzdravListing table.
 *
 * Usage (from server/):
 *   npx prisma generate && node scripts/import-ezdrav-csv-to-db.js
 *   node scripts/import-ezdrav-csv-to-db.js --wipe   # clear table first
 */

const dotenv = require("dotenv");
dotenv.config();

const { PrismaClient } = require("../generated/prisma");
const { loadAllRows } = require("../services/ezdravHospitalScrapeCsv");

const prisma = new PrismaClient();

function toBool(val) {
  if (!val) return false;
  const s = String(val).toLowerCase().trim();
  return s === "da" || s === "yes" || s === "true";
}

function toNullStr(val) {
  if (val == null) return null;
  const s = String(val).trim();
  return s || null;
}

async function main() {
  const wipe = process.argv.includes("--wipe");

  console.log("[import] Loading CSV rows…");
  const { rows } = loadAllRows();
  console.log(`[import] Found ${rows.length} CSV rows.`);

  if (rows.length === 0) {
    console.error("[import] No rows to import. Check CSV dir.");
    process.exit(1);
  }

  if (wipe) {
    const deleted = await prisma.ezdravListing.deleteMany();
    console.log(`[import] Wiped ${deleted.count} existing rows.`);
  }

  const BATCH = 500;
  let imported = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const data = chunk.map((r) => ({
      routeId: toNullStr(r.routeId),
      serviceName: toNullStr(r.serviceName),
      urgency: toNullStr(r.urgencyFile),
      urgencyPage: toNullStr(r.urgencyPage),
      region: toNullStr(r.region),
      provider: toNullStr(r.provider),
      city: toNullStr(r.city),
      postalCode: toNullStr(r.postalCode),
      address: toNullStr(r.address),
      phone: toNullStr(r.phone),
      fax: toNullStr(r.fax),
      email: toNullStr(r.email),
      website: toNullStr(r.website),
      websiteDisabled: toBool(r.websiteDisabled),
      serviceUnavailable: toBool(r.serviceUnavailable),
      eOrderNotPossible: toBool(r.eOrderNotPossible),
      appointmentSummary: toNullStr(r.appointmentSummary),
      remarks: toNullStr(r.remarks),
      ambulances: toNullStr(r.ambulances),
      lastUpdated: toNullStr(r.lastUpdated),
      sourceFile: toNullStr(r.sourceFile),
    }));

    await prisma.ezdravListing.createMany({ data, skipDuplicates: false });
    imported += chunk.length;

    if (imported % 5000 === 0 || imported === rows.length) {
      console.log(`[import] ${imported} / ${rows.length} rows inserted.`);
    }
  }

  const total = await prisma.ezdravListing.count();
  console.log(`[import] Done. EzdravListing table now has ${total} rows.`);
}

main()
  .catch((err) => {
    console.error("[import] Failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
