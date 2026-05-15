/**
 * Reads server/dropdown.html (selectize options) and writes JSON with route ids (data-value)
 * and labels. Run from server/: node scripts/ezdrav-parse-dropdown.js
 */

const fs = require("fs");
const path = require("path");

const DROPDOWN_HTML = path.join(__dirname, "..", "dropdown.html");
const OUT_JSON = path.join(__dirname, "..", "data", "ezdrav", "dropdown-services.json");

function stripTags(s) {
  return s.replace(/<[^>]+>/g, " ");
}

function normalizeLabel(raw) {
  return stripTags(raw).replace(/\s+/g, " ").trim();
}

function parseCodeFromLabel(label) {
  const m = label.match(/^(\S+)\s*-\s*/);
  return m ? m[1] : null;
}

function parseDropdownHtml(html) {
  const services = [];
  const re =
    /<div class="option[^"]*"[^>]*\bdata-value="(\d+)"[^>]*>([\s\S]*?)<\/div>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const routeId = Number(m[1], 10);
    const label = normalizeLabel(m[2]);
    if (!label) continue;
    services.push({
      routeId,
      label,
      code: parseCodeFromLabel(label),
    });
  }
  return services;
}

function main() {
  const [,, argIn, argOut] = process.argv;
  const inputPath = argIn || DROPDOWN_HTML;
  const outPath = argOut || OUT_JSON;

  if (!fs.existsSync(inputPath)) {
    console.error("Input not found:", inputPath);
    process.exit(1);
  }

  const html = fs.readFileSync(inputPath, "utf8");
  const services = parseDropdownHtml(html);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const payload = {
    source: path.basename(inputPath),
    generatedAt: new Date().toISOString(),
    count: services.length,
    services,
  };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`Wrote ${services.length} services → ${outPath}`);
}

main();
