/**
 * Združi JSON datoteke (iz ezdrav-parse-waitlist-html.js) v eno preglednico (CSV),
 * berljivo za ne-tehnične uporabnike. Odpre se v Excelu / LibreOffice / Google Sheets.
 *
 * Po vrstici: ena vrstica = en ponudnik (zdravstvena ustanova). Če stran nima ponudnikov,
 * je ena vrstica s praznimi stolpci ponudnika (npr. storitev ni na voljo).
 *
 * Uporaba (iz mape server/):
 *   node scripts/jsontosheet.js --dir data/ezdrav/json --limit 100 --out data/ezdrav/pregled_100.csv
 *   node scripts/jsontosheet.js --dir data/ezdrav/json --out data/ezdrav/pregled_vsi.csv
 *   node scripts/jsontosheet.js --dir data/ezdrav/json --chunk-rows 5000 --out data/ezdrav/pregled_parts
 *     → mapa z 1.csv, 2.csv, … prvi stolpec # se nadaljuje po vseh delih
 */

const fs = require("fs");
const path = require("path");

function csvCell(val) {
  if (val == null || val === undefined) return "";
  const s = String(val);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function formatEnrollmentHints(hints) {
  if (!hints?.length) return "";
  return hints
    .map((h) => {
      let line = h.label || "";
      if (h.href) line += ` (${h.href})`;
      if (h.tooltip) line += ` — ${h.tooltip}`;
      return line.trim();
    })
    .filter(Boolean)
    .join(" | ");
}

function urgencyLabel(slug) {
  if (!slug) return "";
  if (slug === "zelohitro") return "Zelo hitro";
  if (slug === "hitro") return "Hitro";
  if (slug === "redno") return "Redno";
  return slug;
}

function slotsToReadable(slots) {
  if (!slots?.length) return "";
  return slots
    .map((s) => {
      let line = `${s.title}: ${s.value}`;
      if (s.explanation) line += ` (${s.explanation})`;
      const bh = s.bookingHints;
      if (bh) {
        const bits = [];
        if (bh.receptionHoursHint)
          bits.push(`Delovni čas / urnik: ${bh.receptionHoursHint}`);
        if (bh.relatedWebUrl) bits.push(`Povezava: ${bh.relatedWebUrl}`);
        if (bh.bookingNotesPlain) bits.push(bh.bookingNotesPlain);
        if (bits.length) line += ` — ${bits.join(" — ")}`;
      }
      return line;
    })
    .join("\n");
}

function ambulanceToReadable(slots) {
  if (!slots?.length) return "";
  return slots
    .map((a) => {
      let line = a.ambulanceName || "";
      const u =
        a.urgencyLevel === "zelohitro"
          ? "Zelo hitro"
          : a.urgencyLevel === "hitro"
            ? "Hitro"
            : a.urgencyLevel === "redno"
              ? "Redno"
              : "";
      if (a.availabilitySummary)
        line += ` — ${u ? `${u}: ` : ""}${a.availabilitySummary}`;
      if (a.notesPlain) line += ` — ${a.notesPlain}`;
      return line.trim();
    })
    .join("\n");
}

function parseCli(argv) {
  const opts = {
    dir: "data/ezdrav/json",
    out: null,
    limit: null,
    chunkRows: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--dir") {
      opts.dir = argv[i + 1];
      i += 1;
    } else if (a.startsWith("--dir=")) opts.dir = a.slice("--dir=".length);
    else if (a === "--out") {
      opts.out = argv[i + 1];
      i += 1;
    } else if (a.startsWith("--out=")) opts.out = a.slice("--out=".length);
    else if (a === "--limit") {
      opts.limit = Number(argv[i + 1], 10);
      i += 1;
    } else if (a.startsWith("--limit="))
      opts.limit = Number(a.slice("--limit=".length), 10);
    else if (a === "--chunk-rows") {
      opts.chunkRows = Number(argv[i + 1], 10);
      i += 1;
    } else if (a.startsWith("--chunk-rows="))
      opts.chunkRows = Number(a.slice("--chunk-rows=".length), 10);
    else if (a === "--help" || a === "-h") opts.help = true;
  }
  return opts;
}

/** First column when exporting split CSVs (global row index continues across files). */
const ROW_NUM_HEADER =
  "# | Row number (continuous across files) | Zaporedna številka (nadaljevanje po vseh delih)";

/** Bilingual headers: English | Slovenian (for Excel / Sheets). */
const COLUMNS = [
  {
    key: "storitevKoda",
    header: "Service route ID | Šifra storitve (številka iz eZdrav)",
  },
  {
    key: "nujnostDatoteka",
    header:
      "Urgency from export (regular / fast / very fast) | Nujnost po izbiri iskanja (redno / hitro / zelo hitro)",
  },
  {
    key: "nazivStoritve",
    header: "Service name | Naziv storitve (kaj je bilo iskano)",
  },
  {
    key: "stopnjaNujnostiNaStrani",
    header:
      "Urgency shown on portal page | Stopnja nujnosti na strani (kot jo prikaže portal)",
  },
  {
    key: "regija",
    header: "Region | Regija",
  },
  {
    key: "storitevNiNaVoljo",
    header:
      "Service not offered at all (yes / no) | Ali storitev sploh ni na voljo (da / ne)",
  },
  {
    key: "enarocanjeNiMozno",
    header:
      "E-ordering not possible for this service (yes / no) | Ali elektronsko naročanje za to storitev ni možno (da / ne)",
  },
  {
    key: "obvestilaNaVrhu",
    header:
      "Top-of-page notices (e.g. zVem link; ordering limits) | Obvestila ob naslovu strani (npr. zVem, omejitve naročanja)",
  },
  {
    key: "steviloPonudnikov",
    header:
      "Number of providers listed | Koliko ponudnikov je na tem seznamu (število)",
  },
  {
    key: "imePonudnika",
    header:
      "Provider or institution name | Ime ponudnika ali zdravstvene ustanove",
  },
  {
    key: "spletnaStran",
    header: "Provider website URL | Spletna stran ponudnika (povezava)",
  },
  {
    key: "brezAktivnePovezave",
    header:
      "Website link disabled (yes / no) | Ali je povezava na splet onemogočena (da / ne)",
  },
  {
    key: "terminiInCakalneInfo",
    header:
      "First available appointment / approximate slot / waiting days summary | Prvi prosti termin, okvirni datum, dnevi čakanja — povzetek iz portala",
  },
  {
    key: "naslov",
    header: "Street address | Naslov (ulica)",
  },
  {
    key: "postnaStevilka",
    header: "Postal code | Poštna številka",
  },
  {
    key: "kraj",
    header: "City / town | Kraj",
  },
  {
    key: "email",
    header: "Email | E-pošta",
  },
  {
    key: "telefon",
    header: "Phone | Telefon",
  },
  {
    key: "telefaks",
    header: "Fax | Telefaks",
  },
  {
    key: "zadnjaPosodobitev",
    header:
      "Last data refresh by provider (if stated) | Kdaj so podatke ponudnik zadnjič posodobil (če je navedeno)",
  },
  {
    key: "dodatnaPojasnila",
    header:
      "Additional provider notes | Dodatna pojasnila ponudnika (besedilo)",
  },
  {
    key: "razpolozljivostPoAmbulantah",
    header:
      "Per-clinic availability when listed separately | Če obstaja več ambulant — razpoložljivost in opombe za vsako posebej",
  },
  {
    key: "virDatoteka",
    header: "Source JSON file name | Vir JSON datoteke (za preverjanje)",
  },
];

function rowFromHospital(data, h) {
  const sid = data.sourceIds || {};
  const stNi = data.notices?.serviceUnavailable === true ? "da" : "ne";
  const enNi = data.notices?.enarocanjeNotPossible === true ? "da" : "ne";

  return {
    storitevKoda: sid.routeId ?? "",
    nujnostDatoteka: urgencyLabel(sid.urgencySlug),
    nazivStoritve: data.meta?.storitev ?? "",
    stopnjaNujnostiNaStrani: data.meta?.stopnjaNujnosti ?? "",
    regija: data.meta?.regija ?? "",
    storitevNiNaVoljo: stNi,
    enarocanjeNiMozno: enNi,
    obvestilaNaVrhu: formatEnrollmentHints(data.enrollmentHints),
    steviloPonudnikov:
      data.hospitalCount != null ? String(data.hospitalCount) : "0",
    imePonudnika: h?.name ?? "",
    spletnaStran: h?.website ?? "",
    brezAktivnePovezave: h == null ? "" : h.websiteDisabled ? "da" : "ne",
    terminiInCakalneInfo: slotsToReadable(h?.slots),
    naslov: h?.derived?.address?.street ?? h?.props?.Naslov ?? "",
    postnaStevilka:
      h?.derived?.address?.postalCode ?? h?.props?.["Poštna številka"] ?? "",
    kraj: h?.derived?.address?.city ?? h?.props?.Kraj ?? "",
    email: h?.derived?.contact?.email ?? h?.props?.["Elektronski naslov"] ?? "",
    telefon: h?.derived?.contact?.phone ?? h?.props?.Telefon ?? "",
    telefaks: h?.derived?.contact?.fax ?? h?.props?.Telefaks ?? "",
    zadnjaPosodobitev:
      h?.derived?.lastUpdated ?? h?.props?.["Zadnja posodobitev"] ?? "",
    dodatnaPojasnila:
      h?.derived?.remarksPlain ?? h?.props?.["Dodatna pojasnila"] ?? "",
    razpolozljivostPoAmbulantah: ambulanceToReadable(h?.ambulanceSlots),
    virDatoteka: data.sourceFile ?? "",
  };
}

function emptyHospitalRow(data) {
  return rowFromHospital(data, null);
}

function main() {
  const opts = parseCli(process.argv.slice(2));
  if (opts.help) {
    console.log(`
Združi JSON v eno CSV preglednico.

  node scripts/jsontosheet.js --dir data/ezdrav/json --limit 100 --out data/ezdrav/pregled_100.csv
  node scripts/jsontosheet.js --dir data/ezdrav/json --chunk-rows 5000 --out data/ezdrav/pregled_parts

  --dir         Mapa z .json datotekami (privzeto: data/ezdrav/json)
  --out         Izhod: ena .csv datoteka ali mapa (pri --chunk-rows)
  --limit       Obdelaj samo prvih N JSON datotek (po abecedi), za preskus
  --chunk-rows  Razdeli izhod na več CSV (1.csv, 2.csv, …) po N vrsticah na datoteko;
                prvi stolpec # se šteje zvezno po vseh delih
`);
    process.exit(0);
  }

  const dir = path.resolve(opts.dir);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    console.error("Ni mape:", dir);
    process.exit(1);
  }

  let files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort();

  if (opts.limit != null && Number.isFinite(opts.limit) && opts.limit > 0) {
    files = files.slice(0, opts.limit);
  }

  const rows = [];
  for (const f of files) {
    const full = path.join(dir, f);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(full, "utf8"));
    } catch (e) {
      console.error("Preskočim (napaka JSON):", f, e.message);
      continue;
    }

    const list = data.hospitals;
    if (!list || list.length === 0) {
      rows.push(emptyHospitalRow(data));
    } else {
      for (const h of list) {
        rows.push(rowFromHospital(data, h));
      }
    }
  }

  const bom = "\ufeff";
  const chunkSize =
    opts.chunkRows != null &&
    Number.isFinite(opts.chunkRows) &&
    opts.chunkRows > 0
      ? Math.floor(opts.chunkRows)
      : null;

  if (chunkSize != null) {
    const outDir = path.resolve(
      opts.out || path.join(path.dirname(dir), "pregled_csv_parts"),
    );
    fs.mkdirSync(outDir, { recursive: true });

    let part = 1;
    for (let offset = 0; offset < rows.length; offset += chunkSize) {
      const chunk = rows.slice(offset, offset + chunkSize);
      const headerLine = [
        csvCell(ROW_NUM_HEADER),
        ...COLUMNS.map((c) => csvCell(c.header)),
      ].join(",");
      const bodyLines = chunk.map((row, i) =>
        [
          csvCell(offset + i + 1),
          ...COLUMNS.map((c) => csvCell(row[c.key] ?? "")),
        ].join(","),
      );
      const filePath = path.join(outDir, `${part}.csv`);
      fs.writeFileSync(
        filePath,
        bom + [headerLine, ...bodyLines].join("\r\n"),
        "utf8",
      );
      part += 1;
    }

    console.error(
      `Končano: ${files.length} JSON datotek → ${rows.length} vrstic v ${part - 1} delih CSV`,
    );
    console.error("Mapa:", outDir);
  } else {
    const outPath = path.resolve(
      opts.out || path.join(path.dirname(dir), "pregled.csv"),
    );
    fs.mkdirSync(path.dirname(outPath), { recursive: true });

    const headerLine = COLUMNS.map((c) => csvCell(c.header)).join(",");
    const lines = [
      headerLine,
      ...rows.map((row) =>
        COLUMNS.map((c) => csvCell(row[c.key] ?? "")).join(","),
      ),
    ];
    const csvBody = lines.join("\r\n");
    fs.writeFileSync(outPath, bom + csvBody, "utf8");

    console.error(
      `Končano: ${files.length} JSON datotek → ${rows.length} vrstic v preglednici`,
    );
    console.error("Shranjeno:", outPath);
  }
}

main();
