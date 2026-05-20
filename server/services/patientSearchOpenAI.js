const OpenAI = require("openai");

const SYSTEM_PROMPT = `You are a medical appointment assistant for MojTermin in Slovenia. Analyze the user's search query and identify what medical services they might need.

The database contains Slovenian eZdrav waitlist entries. Service names are in Slovenian, e.g.:
"2022P - Paliativna obravnava - prvi pregled", "MRI glave", "Ultrazvok trebuha",
"Ortopedski pregled", "Dermatološki pregled", "Kardiološki pregled", "RTG pljuč", "CT glave",
"Ginekološki pregled", "Fizioterapija", "Nevrološki pregled", "Psihiatrični pregled",
"Urološki pregled", "Oftalmološki pregled", "Okulistični pregled", "Audiološki pregled".

Respond with a single JSON object (no markdown fences) with these keys:
- "intent": string describing what the user is looking for (e.g., "x-ray imaging", "cardiology consultation")
- "specialties": array of relevant medical specialties in English (e.g., ["Radiology", "Orthopedics"])
- "procedures": array of relevant procedure keywords in English (e.g., ["X-ray", "MRI", "ultrasound"])
- "serviceKeywords": array of SPECIFIC Slovenian keywords to match eZdrav service names — ORDER BY SPECIFICITY (most specific first)
- "primaryKeyword": the SINGLE most specific Slovenian keyword that MUST appear in matching services (for filtering)
- "cities": array of city names if user mentioned specific locations, otherwise empty array
- "explanation": brief explanation to show the user what we understood

CRITICAL RULES:
1. serviceKeywords must be SPECIFIC Slovenian medical terms. NEVER use generic "pregled" alone — always pair with specialty prefix:
   - GOOD: ["ginekološki", "ginekol"], ["fizioterapija", "fizikal"], ["nevrološki", "nevrol"], ["psihiatrični", "psihiatr"]
   - BAD: ["pregled"] alone — too generic, matches everything
2. primaryKeyword = the single most distinctive keyword. Examples:
   - Query "ginekološki" → primaryKeyword: "ginekol"
   - Query "fizioterapija" → primaryKeyword: "fizioter"
   - Query "nevrologija" → primaryKeyword: "nevrol"
   - Query "MRI" → primaryKeyword: "MRI"
   - Query "psihiatrija" → primaryKeyword: "psihiatr"
3. For NONSENSE or UNRECOGNIZABLE queries (random characters, gibberish, non-medical):
   - Set serviceKeywords: [] (empty array)
   - Set primaryKeyword: null
   - Set explanation: "We couldn't understand this query. Please describe your medical need."
4. Map English to Slovenian specialty prefixes:
   - gynecology → ginekol
   - physiotherapy → fizioter, fizikal
   - neurology → nevrol
   - psychiatry → psihiatr
   - ophthalmology/eye → oftalm, okulist, očes
   - urology → urolog
   - audiology/hearing → audiolog, sluh
   - dermatology/skin → dermat, kož
   - cardiology/heart → kardiol, srč
   - orthopedics → ortoped
5. Return valid JSON only`;

// Post-filter helper: check if serviceName contains at least one of the keywords
function serviceMatchesKeywords(serviceName, keywords) {
  if (!serviceName || !keywords?.length) return true; // no filter if no keywords
  const lower = serviceName.toLowerCase();
  return keywords.some((kw) => kw && lower.includes(kw.toLowerCase()));
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error("OPENAI_API_KEY is not configured.");
    err.code = "OPENAI_NOT_CONFIGURED";
    throw err;
  }
  return new OpenAI({ apiKey });
}

async function analyzePatientSearch(query) {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: query },
    ],
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

  return {
    intent: typeof parsed?.intent === "string" ? parsed.intent : "medical consultation",
    specialties: Array.isArray(parsed?.specialties) ? parsed.specialties : [],
    procedures: Array.isArray(parsed?.procedures) ? parsed.procedures : [],
    serviceKeywords: Array.isArray(parsed?.serviceKeywords) ? parsed.serviceKeywords : [],
    primaryKeyword: typeof parsed?.primaryKeyword === "string" ? parsed.primaryKeyword : null,
    cities: Array.isArray(parsed?.cities) ? parsed.cities : [],
    explanation: typeof parsed?.explanation === "string" ? parsed.explanation : "Searching for available appointments...",
  };
}

module.exports = {
  analyzePatientSearch,
  getOpenAIClient,
  serviceMatchesKeywords,
};
