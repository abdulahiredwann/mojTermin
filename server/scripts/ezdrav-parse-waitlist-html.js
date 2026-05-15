/**
 * Converts one saved čakalne dobe HTML fragment (same shape as hospitallist.html)
 * into JSON: header meta, optional notices, hospitals, ambulance modals when present.
 *
 * Usage (from server/):
 *   node scripts/ezdrav-parse-waitlist-html.js data/ezdrav/html/738_zelohitro.html
 *   node scripts/ezdrav-parse-waitlist-html.js --dir data/ezdrav/html
 */

const fs = require("fs");
const path = require("path");

function stripTags(s) {
  if (!s) return "";
  return s.replace(/<[^>]+>/g, " ");
}

function decodeHtmlEntities(s) {
  if (!s) return s;
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
      String.fromCodePoint(parseInt(h, 16)),
    )
    .replace(/&#(\d+);/g, (_, d) =>
      String.fromCodePoint(parseInt(d, 10)),
    )
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function textContent(html) {
  return decodeHtmlEntities(stripTags(html).replace(/\s+/g, " ").trim());
}

function extractHeaderMeta(html) {
  const block =
    html.match(
      /<h4 class="header-label">([\s\S]*?)<\/h4>/i,
    )?.[1] || "";
  const line = (tag) => {
    const re = new RegExp(
      `<b>${tag}</b>\\s*:\\s*([^<]+)`,
      "i",
    );
    const m = block.match(re);
    return m ? textContent(m[1]) : null;
  };
  return {
    storitev: line("Storitev"),
    stopnjaNujnosti: line("Stopnja nujnosti"),
    regija: line("Regija"),
  };
}

function noticeFlags(html) {
  const plain = stripTags(html);
  return {
    serviceUnavailable: /Zdravstvena storitev ni na voljo/i.test(plain),
    enarocanjeNotPossible: /eNaročanje za to storitev ni možno/i.test(plain),
  };
}

function splitHospitalBlocks(html) {
  return html
    .split(/(?=<div class="col-md-12 infoHeader">)/)
    .filter((b) => b.includes('class="infoHeader-link'));
}

function extractModalId(block) {
  const m = block.match(/data-target="(#ambInfoModal_\d+)"/);
  return m ? m[1].slice(1) : null;
}

function parseProps(mainHtml) {
  const props = {};
  const re =
    /<div class="col-md-6 propName">\s*([^<]+?)\s*<\/div>\s*<div class="col-md-6 propValue">\s*([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(mainHtml)) !== null) {
    const key = textContent(m[1]);
    let val = m[2].trim();
    const mail = val.match(/href="mailto:([^"]+)"/i);
    if (mail) val = mail[1];
    else val = textContent(val);
    if (key) props[key] = val;
  }
  return props;
}

function parseSlots(mainHtml) {
  const slots = [];
  const re =
    /<div class="row slotHeader">\s*([\s\S]*?)<\/div>\s*<div class="row slotData">\s*([\s\S]*?)<\/div>/g;
  let m;
  while ((m = re.exec(mainHtml)) !== null) {
    const title = textContent(m[1]);
    const dataPart = m[2].split(/<i class="icon-info-sign/i)[0];
    const value = textContent(dataPart);
    if (title) slots.push({ title, value });
  }
  return slots;
}

function parseHospitalBlock(block) {
  const nameMatch = block.match(
    /<a class="infoHeader-link([^"]*)"([^>]*)>([^<]*)<\/a>/,
  );
  const name = nameMatch ? nameMatch[3].trim() : null;
  const disabled = !!nameMatch?.[1]?.includes("is-disabled");
  const hrefMatch = nameMatch?.[2]?.match(/href="([^"]+)"/);
  const website = !disabled && hrefMatch ? hrefMatch[1] : null;

  const parts = block.split("<div class=\"d-flex justify-content-between\">");
  const mainHtml = parts[0] || block;

  return {
    name,
    website: website === undefined ? null : website,
    slots: parseSlots(mainHtml),
    props: parseProps(mainHtml),
    ambulanceModalId: extractModalId(parts[1] || ""),
  };
}

function extractModalHtml(fullHtml, modalId) {
  if (!modalId) return null;
  const esc = modalId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `<div class="modal" id="${esc}"[\\s\\S]*?<div class="modal-body modal-body-custom">([\\s\\S]*?)<\\/div>\\s*<div class="modal-footer">`,
    "i",
  );
  const m = fullHtml.match(re);
  return m ? m[1] : null;
}

function parseAmbulanceModalBody(modalBodyHtml) {
  if (!modalBodyHtml) return [];
  const entries = [];
  const chunks = modalBodyHtml.split(/<p class="ambulance-name">/);
  for (const chunk of chunks.slice(1)) {
    const nameEnd = chunk.indexOf("</p>");
    if (nameEnd < 0) continue;
    const ambulanceName = textContent(chunk.slice(0, nameEnd));
    const rest = chunk.slice(nameEnd);
    const line = (label) => {
      const r = new RegExp(
        `<p>\\s*${label}\\s*:\\s*([^<]*)</p>`,
        "i",
      );
      const mm = rest.match(r);
      return mm ? mm[1].trim() : null;
    };
    const urgencyLine =
      line("Zelo hitro") || line("Hitro") || line("Redno");
    const notesMatch = rest.match(/<p>\s*Dodatna pojasnila:\s*([^<]*)<\/p>/i);
    entries.push({
      ambulanceName,
      slotLabel: urgencyLine,
      notes: notesMatch ? notesMatch[1].trim() : null,
    });
  }
  return entries;
}

function parseWaitlistHtml(html, sourceFile) {
  const meta = extractHeaderMeta(html);
  const notices = noticeFlags(html);
  const rawBlocks = splitHospitalBlocks(html);
  const hospitals = rawBlocks.map((block) => {
    const h = parseHospitalBlock(block);
    const modalBody = extractModalHtml(html, h.ambulanceModalId);
    const ambulanceSlots = parseAmbulanceModalBody(modalBody);
    return {
      ...h,
      ambulanceSlots:
        ambulanceSlots.length > 0 ? ambulanceSlots : undefined,
    };
  });

  return {
    sourceFile: sourceFile || null,
    parsedAt: new Date().toISOString(),
    meta,
    notices,
    hospitalCount: hospitals.length,
    hospitals,
  };
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.includes("--dir")) {
    const i = argv.indexOf("--dir");
    const dir = argv[i + 1];
    if (!dir || !fs.statSync(dir).isDirectory()) {
      console.error("Usage: --dir <path-to-html-folder>");
      process.exit(1);
    }
    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".html"));
    for (const f of files) {
      const p = path.join(dir, f);
      const html = fs.readFileSync(p, "utf8");
      const data = parseWaitlistHtml(html, f);
      const out = path.join(dir, f.replace(/\.html$/i, ".json"));
      fs.writeFileSync(out, JSON.stringify(data, null, 2), "utf8");
      console.log("Wrote", out);
    }
    return;
  }

  const file = argv[0];
  if (!file || !fs.existsSync(file)) {
    console.error(
      "Usage: node scripts/ezdrav-parse-waitlist-html.js <file.html>\n" +
        "   or: node scripts/ezdrav-parse-waitlist-html.js --dir data/ezdrav/html",
    );
    process.exit(1);
  }

  const html = fs.readFileSync(file, "utf8");
  const data = parseWaitlistHtml(html, path.basename(file));
  console.log(JSON.stringify(data, null, 2));
}

main();
