const crypto = require("crypto");

const KNOWN_SPECIALTIES = [
  "Radiology",
  "Dermatology",
  "Cardiology",
  "Orthopedics",
  "Neurology",
  "Gynecology",
  "General Surgery",
];

const KNOWN_CITIES = [
  "Ljubljana",
  "Maribor",
  "Celje",
  "Koper",
  "Novo Mesto",
  "Nova Gorica",
  "Murska Sobota",
];

/**
 * MVP “AI” parser: extracts count + specialty (+ optional city) from free text.
 * Replace with real LLM later; response shape stays the same.
 */
function simulateProposedHospitals(message) {
  const text = typeof message === "string" ? message : "";
  const lower = text.toLowerCase();

  let count = 3;
  const countMatch = lower.match(/(\d+)\s*(?:new\s*)?(?:hospital|hospitals|entries|rows)/i);
  if (countMatch) {
    count = Math.min(Math.max(parseInt(countMatch[1], 10), 1), 50);
  } else if (/\badd\s+(?:a\s+)?hospital\b/.test(lower)) {
    count = 1;
  }

  let specialty = "General practice";
  for (const s of KNOWN_SPECIALTIES) {
    if (lower.includes(s.toLowerCase())) {
      specialty = s;
      break;
    }
  }

  let cityHint = null;
  for (const c of KNOWN_CITIES) {
    if (lower.includes(c.toLowerCase())) {
      cityHint = c;
      break;
    }
  }

  const proposedHospitals = [];
  for (let i = 0; i < count; i += 1) {
    const city = cityHint ?? KNOWN_CITIES[i % KNOWN_CITIES.length];
    const seq = i + 1;
    proposedHospitals.push({
      tempId: `pending-${crypto.randomUUID()}`,
      name: `Draft hospital — ${city} (${specialty}) #${seq}`,
      city,
      country: "Slovenia",
      averageWaitDays: 18 + (i % 20),
      services: [
        {
          tempServiceId: `pending-svc-${crypto.randomUUID()}`,
          specialty,
          procedureName: `${specialty} — simulated consultation`,
          estimatedWaitDays: 12 + (i % 18),
        },
      ],
    });
  }

  const summary = `Simulator prepared ${count} draft hospital(s) with specialty “${specialty}”. Review highlighted rows and click Save to persist.`;

  return { summary, proposedHospitals };
}

module.exports = { simulateProposedHospitals };
