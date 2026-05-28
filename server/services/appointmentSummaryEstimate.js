function stripDiacritics(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeText(value) {
  return stripDiacritics(value).toLowerCase();
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toWaitDaysFromDate(targetDate, now = new Date()) {
  const from = startOfDay(now);
  const to = startOfDay(targetDate);
  const diffMs = to.getTime() - from.getTime();
  const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
  return Math.max(0, days);
}

const MONTH_PATTERNS = [
  { re: /\bjanuar(?:ja)?\b/i, index: 0 },
  { re: /\bfebruar(?:ja)?\b/i, index: 1 },
  { re: /\bmarec\b|\bmarca\b/i, index: 2 },
  { re: /\bapril(?:a)?\b/i, index: 3 },
  { re: /\bmaj(?:a)?\b/i, index: 4 },
  { re: /\bjunij(?:a)?\b/i, index: 5 },
  { re: /\bjulij(?:a)?\b/i, index: 6 },
  { re: /\bavgust(?:a)?\b/i, index: 7 },
  { re: /\bseptember(?:a)?\b/i, index: 8 },
  { re: /\boktober(?:a)?\b/i, index: 9 },
  { re: /\bnovember(?:a)?\b/i, index: 10 },
  { re: /\bdecember(?:a)?\b/i, index: 11 },
];

function parseMonthDateEstimate(summaryText, now = new Date()) {
  const normalized = normalizeText(summaryText);
  const monthEntry = MONTH_PATTERNS.find((m) => m.re.test(normalized));
  if (!monthEntry) return null;
  const monthIdx = monthEntry.index;
  if (monthIdx == null) return null;

  const currentYear = now.getFullYear();
  const yearMatch = normalized.match(/\b(20\d{2})\b/);
  let year = yearMatch ? Number(yearMatch[1]) : currentYear;
  if (!Number.isFinite(year)) year = currentYear;

  if (!yearMatch && monthIdx < now.getMonth()) {
    year += 1;
  }

  let day = 15;
  if (normalized.includes("prva polovica")) day = 8;
  if (normalized.includes("druga polovica")) day = 22;

  return toWaitDaysFromDate(new Date(year, monthIdx, day), now);
}

function parseDaysEstimate(summaryText) {
  const normalized = normalizeText(summaryText);
  const daysMatch = normalized.match(/\b(\d{1,4})\s*dni\b/i);
  if (!daysMatch) return null;
  const value = Number(daysMatch[1]);
  if (!Number.isFinite(value)) return null;
  return Math.max(0, Math.trunc(value));
}

function estimateWaitDaysFromAppointmentSummary(summaryText, now = new Date()) {
  if (typeof summaryText !== "string" || !summaryText.trim()) return null;
  const normalized = normalizeText(summaryText);

  // Explicit "walk-in" means no waiting window.
  if (normalized.includes("prosti sprejem")) return 0;

  const fromDays = parseDaysEstimate(summaryText);
  if (fromDays != null) return fromDays;

  const fromMonthDate = parseMonthDateEstimate(summaryText, now);
  if (fromMonthDate != null) return fromMonthDate;

  return null;
}

module.exports = {
  estimateWaitDaysFromAppointmentSummary,
};
