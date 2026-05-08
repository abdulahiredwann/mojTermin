const crypto = require("crypto");
const OpenAI = require("openai");

const MAX_PROPOSED_HOSPITALS = 50;
const MAX_CONTEXT_MESSAGES = 48;

const SYSTEM_PROMPT = `You are an assistant for MojTermin admin hospital data. Your job is to understand requests about hospitals and emulator dataset operations in Slovenia (default country Slovenia unless stated).

Always respond with a single JSON object (no markdown fences) with exactly these keys:
- "summary": a concise, helpful assistant message for the admin (plain language).
- "proposedHospitals": an array of hospital drafts to add to the emulator. Each item MUST have:
  - "name": string (required)
  - "city": string or null
  - "country": string or null (default "Slovenia" when unspecified)
  - "averageWaitDays": integer or null (reasonable estimate)
  - "services": array (can be empty). Each service has:
      - "specialty": string or null
      - "procedureName": string or null
      - "estimatedWaitDays": integer or null

Rules:
- When the user asks to add N hospitals, produce exactly N distinct hospitals unless they specify fewer.
- Match specialties/cities from the user message; infer plausible procedure names.
- If the user asks questions without requesting new rows, use an empty proposedHospitals array and answer in summary only.
- Keep hospital names unique within your proposed batch when quantity > 1 (suffix #2, #3 or city names).
- Numbers must be integers where applicable.
- Output valid JSON only.`;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error("OPENAI_API_KEY is not configured.");
    err.code = "OPENAI_NOT_CONFIGURED";
    throw err;
  }
  return new OpenAI({ apiKey });
}

function normalizeAiPayload(raw) {
  const summary =
    typeof raw?.summary === "string" && raw.summary.trim()
      ? raw.summary.trim()
      : "Here is what I prepared based on your message.";

  let list = Array.isArray(raw?.proposedHospitals) ? raw.proposedHospitals : [];
  list = list.slice(0, MAX_PROPOSED_HOSPITALS);

  const proposedHospitals = list.map((h, i) => {
    let name =
      typeof h?.name === "string" && h.name.trim()
        ? h.name.trim()
        : `Draft hospital #${i + 1}`;

    const city =
      typeof h?.city === "string" && h.city.trim() ? h.city.trim() : null;
    const country =
      typeof h?.country === "string" && h.country.trim()
        ? h.country.trim()
        : "Slovenia";

    let averageWaitDays = null;
    if (h?.averageWaitDays !== undefined && h?.averageWaitDays !== null && h?.averageWaitDays !== "") {
      const n = Number(h.averageWaitDays);
      if (Number.isFinite(n)) averageWaitDays = Math.max(0, Math.trunc(n));
    }

    const servicesRaw = Array.isArray(h?.services) ? h.services : [];
    let services = servicesRaw.slice(0, 40).map((s) => {
      const specialty =
        typeof s?.specialty === "string" && s.specialty.trim() ? s.specialty.trim() : "General";
      const procedureName =
        typeof s?.procedureName === "string" && s.procedureName.trim()
          ? s.procedureName.trim()
          : `${specialty} — consultation`;
      let estimatedWaitDays = null;
      if (s?.estimatedWaitDays !== undefined && s?.estimatedWaitDays !== null && s?.estimatedWaitDays !== "") {
        const n = Number(s.estimatedWaitDays);
        if (Number.isFinite(n)) estimatedWaitDays = Math.max(0, Math.trunc(n));
      }
      return {
        tempServiceId: `pending-svc-${crypto.randomUUID()}`,
        specialty,
        procedureName,
        estimatedWaitDays,
      };
    });

    if (services.length === 0) {
      services.push({
        tempServiceId: `pending-svc-${crypto.randomUUID()}`,
        specialty: "General",
        procedureName: "General — initial visit",
        estimatedWaitDays: 14,
      });
    }

    return {
      tempId: `pending-${crypto.randomUUID()}`,
      name,
      city,
      country,
      averageWaitDays,
      services,
    };
  });

  // Post-processing to keep UX realistic even if the model repeats values.
  const seenNames = new Set();
  const genericDemoName = /^demo\s+hospital(?:\s*#?\s*\d+)?$/i;

  const patchedHospitals = proposedHospitals.map((h, idx) => {
    const primarySpecialty =
      h.services?.[0]?.specialty && typeof h.services[0].specialty === "string"
        ? h.services[0].specialty
        : "General";
    const cityPart = h.city ? h.city : "Slovenia";

    let nextName = h.name;
    if (genericDemoName.test(nextName) || genericDemoName.test(nextName.replace(/[—-].*$/, "").trim())) {
      nextName = `Demo hospital — ${cityPart} (${primarySpecialty}) #${idx + 1}`;
    }
    if (seenNames.has(nextName)) {
      nextName = `${nextName} #${idx + 1}`;
    }
    seenNames.add(nextName);

    // If averageWaitDays is missing, add a small variation.
    const nextAvgWait =
      h.averageWaitDays === null ? 12 + (idx % 9) * 2 : h.averageWaitDays;

    // If all services have same wait day across this hospital, vary slightly for realism.
    const waits = (h.services || [])
      .map((s) => s.estimatedWaitDays)
      .filter((v) => typeof v === "number");
    const allSame = waits.length > 0 && waits.every((v) => v === waits[0]);

    const nextServices = (h.services || []).map((s, sIdx) => {
      let w = s.estimatedWaitDays;
      if (w === null) {
        w = 5 + ((idx + sIdx) % 7);
      } else if (allSame) {
        w = Math.max(0, Math.trunc(w + ((idx + sIdx) % 5) - 2));
      }
      return { ...s, estimatedWaitDays: w };
    });

    return {
      ...h,
      name: nextName,
      averageWaitDays: nextAvgWait,
      services: nextServices,
    };
  });

  return { summary, proposedHospitals: patchedHospitals };
}

/**
 * @param {Array<{ role: string; content: string }>} history - user/assistant only, chronological (includes latest user message)
 */
async function runHospitalAssistantModel(history) {
  const model = process.env.OPENAI_MODEL || "gpt-4o";
  const client = getOpenAIClient();

  const recent = history.slice(-MAX_CONTEXT_MESSAGES);
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...recent.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages,
  });

  const rawText = completion.choices[0]?.message?.content;
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty model response.");
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Model returned invalid JSON.");
  }

  return normalizeAiPayload(parsed);
}

module.exports = {
  runHospitalAssistantModel,
  normalizeAiPayload,
  MAX_CONTEXT_MESSAGES,
};
