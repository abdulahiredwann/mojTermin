/**
 * Fetches čakalne dobe HTML for each service route id and urgency (redno, hitro, zelohitro).
 * Reads dropdown-services.json from ezdrav-parse-dropdown.js.
 *
 * Designed for long VPS runs: delay between requests, retries, timeouts, progress %,
 * continues on errors, writes manifest after each request (safe if process is killed).
 *
 * Full scrape (example ~1619 services × 3 urgencies ≈ 4857 requests):
 *   cd server && node scripts/ezdrav-fetch-waitlists.js --delay=800
 *
 * Resume after interruption (skip non-empty HTML files already on disk):
 *   node scripts/ezdrav-fetch-waitlists.js --delay=800 --resume
 *
 * Usage (from server/):
 *   node scripts/ezdrav-fetch-waitlists.js
 *   node scripts/ezdrav-fetch-waitlists.js --limit=3
 *   node scripts/ezdrav-fetch-waitlists.js --only=738,1012,1098
 *   node scripts/ezdrav-fetch-waitlists.js --urgencies=redno,zelohitro --delay=600
 *   node scripts/ezdrav-fetch-waitlists.js --timeout=45000 --retries=3 --delay=1000
 */

const fs = require("fs");
const path = require("path");

const DEFAULT_SERVICES_JSON = path.join(
  __dirname,
  "..",
  "data",
  "ezdrav",
  "dropdown-services.json",
);
const DEFAULT_OUT_DIR = path.join(__dirname, "..", "data", "ezdrav", "html");

const BASE = "https://cakalnedobe.ezdrav.si/zdravstvena-storitev";
const DEFAULT_URGENCIES = ["redno", "hitro", "zelohitro"];

/** Looks like a normal desktop browser (less “empty bot” than a generic UA). */
const USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

function parseArgs(argv) {
  const opts = {
    servicesJson: DEFAULT_SERVICES_JSON,
    outDir: DEFAULT_OUT_DIR,
    delayMs: 400,
    limit: null,
    only: null,
    urgencies: [...DEFAULT_URGENCIES],
    timeoutMs: 60_000,
    retries: 2,
    resume: false,
  };
  for (const a of argv) {
    if (a.startsWith("--services-json="))
      opts.servicesJson = a.slice("--services-json=".length);
    else if (a.startsWith("--out-dir="))
      opts.outDir = a.slice("--out-dir=".length);
    else if (a.startsWith("--delay="))
      opts.delayMs = Number(a.slice("--delay=".length), 10) || opts.delayMs;
    else if (a.startsWith("--timeout=")) {
      const n = Number(a.slice("--timeout=".length), 10);
      if (Number.isFinite(n) && n > 0) opts.timeoutMs = n;
    } else if (a.startsWith("--retries=")) {
      const n = Number(a.slice("--retries=".length), 10);
      if (Number.isFinite(n) && n >= 0) opts.retries = n;
    } else if (a === "--resume") opts.resume = true;
    else if (a.startsWith("--limit=")) {
      const n = Number(a.slice("--limit=".length), 10);
      if (Number.isFinite(n) && n > 0) opts.limit = n;
    } else if (a.startsWith("--only=")) {
      opts.only = new Set(
        a
          .slice("--only=".length)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    } else if (a.startsWith("--urgencies=")) {
      opts.urgencies = a
        .slice("--urgencies=".length)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return opts;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchHtmlOnce(url, timeoutMs) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "sl,en-US;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, url: res.url, text };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Retries on network errors, timeouts, and 429/502/503.
 */
async function fetchHtmlWithRetries(url, timeoutMs, retries, baseDelayMs) {
  let lastErr = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const result = await fetchHtmlOnce(url, timeoutMs);
      const retryable =
        result.status === 429 || result.status === 502 || result.status === 503;
      if (retryable && attempt < retries) {
        const wait = baseDelayMs * (2 + attempt) * 2;
        await sleep(wait);
        continue;
      }
      return result;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        const wait = baseDelayMs * (1 + attempt);
        await sleep(wait);
        continue;
      }
    }
  }
  throw lastErr || new Error("fetch failed after retries");
}

function writeManifest(metaPath, manifest) {
  manifest.stats = {
    ok: manifest.results.filter((r) => r.ok === true).length,
    skipped: manifest.results.filter((r) => r.skipped).length,
    httpError: manifest.results.filter(
      (r) => r.ok === false && !r.error && !r.skipped,
    ).length,
    failed: manifest.results.filter((r) => r.error).length,
  };
  fs.writeFileSync(metaPath, JSON.stringify(manifest, null, 2), "utf8");
}

function fileExistsNonEmpty(p) {
  try {
    return fs.existsSync(p) && fs.statSync(p).size > 0;
  } catch {
    return false;
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(opts.servicesJson)) {
    console.error(
      "Missing services JSON. Run: node scripts/ezdrav-parse-dropdown.js",
    );
    console.error("Expected:", opts.servicesJson);
    process.exit(1);
  }

  const { services } = JSON.parse(fs.readFileSync(opts.servicesJson, "utf8"));
  let list = services;
  if (opts.only) {
    list = list.filter((s) => opts.only.has(String(s.routeId)));
  }
  if (opts.limit != null) {
    list = list.slice(0, opts.limit);
  }

  fs.mkdirSync(opts.outDir, { recursive: true });

  const metaPath = path.join(opts.outDir, "..", "fetch-manifest.json");
  const manifest = {
    startedAt: new Date().toISOString(),
    baseUrl: BASE,
    urgencies: opts.urgencies,
    options: {
      delayMs: opts.delayMs,
      timeoutMs: opts.timeoutMs,
      retries: opts.retries,
      resume: opts.resume,
    },
    totalRequests: list.length * opts.urgencies.length,
    results: [],
  };

  let completed = 0;
  const total = manifest.totalRequests;

  for (const s of list) {
    for (const urgency of opts.urgencies) {
      const url = `${BASE}/${s.routeId}/${urgency}`;
      const fileBase = `${s.routeId}_${urgency}`;
      const htmlPath = path.join(opts.outDir, `${fileBase}.html`);

      const pct = ((completed / total) * 100).toFixed(1);

      if (opts.resume && fileExistsNonEmpty(htmlPath)) {
        completed += 1;
        manifest.results.push({
          routeId: s.routeId,
          label: s.label,
          urgency,
          url,
          skipped: true,
          file: `${fileBase}.html`,
        });
        console.log(
          `[${completed}/${total}] ${pct}% | SKIP (resume) ${s.routeId}/${urgency}`,
        );
        writeManifest(metaPath, manifest);
        if (opts.delayMs > 0) await sleep(opts.delayMs);
        continue;
      }

      try {
        const { ok, status, text } = await fetchHtmlWithRetries(
          url,
          opts.timeoutMs,
          opts.retries,
          opts.delayMs,
        );

        try {
          fs.writeFileSync(htmlPath, text, "utf8");
        } catch (writeErr) {
          manifest.results.push({
            routeId: s.routeId,
            label: s.label,
            urgency,
            url,
            status,
            ok,
            error: `write failed: ${writeErr?.message || writeErr}`,
          });
          completed += 1;
          const pct2 = ((completed / total) * 100).toFixed(1);
          console.error(
            `[${completed}/${total}] ${pct2}% | WRITE-FAIL ${s.routeId}/${urgency} | ${writeErr?.message}`,
          );
          writeManifest(metaPath, manifest);
          if (opts.delayMs > 0) await sleep(opts.delayMs);
          continue;
        }

        manifest.results.push({
          routeId: s.routeId,
          label: s.label,
          urgency,
          url,
          status,
          ok,
          file: `${fileBase}.html`,
        });
        completed += 1;
        const pct2 = ((completed / total) * 100).toFixed(1);
        const tag = ok ? "OK" : `HTTP-${status}`;
        console.log(
          `[${completed}/${total}] ${pct2}% | ${tag} ${s.routeId}/${urgency}`,
        );
      } catch (err) {
        manifest.results.push({
          routeId: s.routeId,
          label: s.label,
          urgency,
          url,
          error: String(err?.message || err),
        });
        completed += 1;
        const pct2 = ((completed / total) * 100).toFixed(1);
        console.error(
          `[${completed}/${total}] ${pct2}% | FAIL ${s.routeId}/${urgency} | ${err?.message || err}`,
        );
      }

      writeManifest(metaPath, manifest);
      if (opts.delayMs > 0) await sleep(opts.delayMs);
    }
  }

  manifest.finishedAt = new Date().toISOString();
  writeManifest(metaPath, manifest);

  const { stats } = manifest;
  console.log("Done. Manifest:", metaPath);
  console.log(
    `Summary: ok=${stats.ok} skipped=${stats.skipped} httpErrors=${stats.httpError} failed=${stats.failed} (total rows=${manifest.results.length})`,
  );
}

main().catch((e) => {
  console.error("Fatal (not a single-request failure):", e);
  process.exit(1);
});
