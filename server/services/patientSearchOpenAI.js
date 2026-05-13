const OpenAI = require("openai");

const SYSTEM_PROMPT = `You are a medical appointment assistant for MojTermin in Slovenia. Analyze the user's search query and identify what medical services they might need.

Respond with a single JSON object (no markdown fences) with these keys:
- "intent": string describing what the user is looking for (e.g., "x-ray imaging", "cardiology consultation", "dermatology check")
- "specialties": array of relevant medical specialties to search for (e.g., ["Radiology", "Orthopedics"] for x-ray)
- "procedures": array of relevant procedure keywords (e.g., ["X-ray", "MRI", "ultrasound"])
- "cities": array of city names if user mentioned specific locations, otherwise empty array
- "explanation": brief explanation to show the user what we understood

Rules:
- Map common terms to medical specialties (xray/X-ray → Radiology, heart → Cardiology, skin → Dermatology, bones → Orthopedics, etc.)
- Return valid JSON only
- Keep explanation concise and helpful`;

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
    cities: Array.isArray(parsed?.cities) ? parsed.cities : [],
    explanation: typeof parsed?.explanation === "string" ? parsed.explanation : "Searching for available appointments...",
  };
}

module.exports = {
  analyzePatientSearch,
  getOpenAIClient,
};
