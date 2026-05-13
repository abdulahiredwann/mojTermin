const fs = require("fs/promises");
const { getOpenAIClient } = require("./patientSearchOpenAI");

const VISION_SYSTEM = `You are an expert assistant reading medical referrals, e-Napotnica printouts, prescriptions, lab slips, and clinical document photos. Text may be Slovenian, English, or mixed. Handwriting may be present.

Extract everything that is clearly visible. Do not invent patient names, identifiers, or dates that are not readable.

Return ONE JSON object only (no markdown fences), with these keys:
- "headline": string, one line, max ~140 characters, summarising what the referral is about.
- "detailsMarkdown": string, Markdown with short sections using **bold** labels, e.g. **Document type**, **Main request / diagnosis**, **Procedures or exams**, **Referred to / department**, **Validity or dates**, **Other**. Use bullet lines where helpful. If something is unreadable, write "unclear / not visible".
- "specialtyHints": array of English medical specialty names that best match (e.g. Radiology, Cardiology).
- "procedureHints": array of procedure or exam keywords in English.
- "rawEntities": array of short strings: diagnoses, drug names, ICD-like codes, clinics — only if visibly present.

Keep detailsMarkdown thorough but under about 3500 characters.`;

const MAX_PROMPT_CHARS = 12000;

/**
 * Analyze referral / medical images with a vision-capable OpenAI model.
 * @param {Express.Multer.File[]} files - multer disk files with .path and .mimetype
 * @returns {Promise<{ headline: string; detailsMarkdown: string; specialtyHints: string[]; procedureHints: string[]; rawEntities: string[]; model: string }>}
 */
async function analyzeReferralImagesFromFiles(files) {
  if (!files?.length) {
    throw new Error("No image files.");
  }

  const model =
    process.env.OPENAI_VISION_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-4o";

  const client = getOpenAIClient();

  const content = [
    {
      type: "text",
      text: `There ${files.length === 1 ? "is 1 image" : `are ${files.length} images`}. Read all of them; they relate to the same patient request.`,
    },
  ];

  for (const file of files) {
    const buf = await fs.readFile(file.path);
    const mime = file.mimetype && /^image\/(jpeg|png|gif|webp)$/i.test(file.mimetype)
      ? file.mimetype
      : "image/jpeg";
    content.push({
      type: "image_url",
      image_url: {
        url: `data:${mime};base64,${buf.toString("base64")}`,
      },
    });
  }

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.2,
    max_tokens: 4096,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: VISION_SYSTEM },
      { role: "user", content },
    ],
  });

  const rawText = completion.choices[0]?.message?.content;
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Vision model returned an empty response.");
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Vision model returned invalid JSON.");
  }

  return {
    headline: typeof parsed.headline === "string" ? parsed.headline.trim() : "Referral document",
    detailsMarkdown:
      typeof parsed.detailsMarkdown === "string" ? parsed.detailsMarkdown.trim() : rawText.trim(),
    specialtyHints: Array.isArray(parsed.specialtyHints)
      ? parsed.specialtyHints.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim())
      : [],
    procedureHints: Array.isArray(parsed.procedureHints)
      ? parsed.procedureHints.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim())
      : [],
    rawEntities: Array.isArray(parsed.rawEntities)
      ? parsed.rawEntities.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim())
      : [],
    model,
  };
}

/**
 * Build an augmented text query for the existing search classifier.
 * @param {string} userQuery
 * @param {Awaited<ReturnType<typeof analyzeReferralImagesFromFiles>> & { error?: string }} vision
 */
function buildAugmentedSearchQuery(userQuery, vision) {
  if (!vision || vision.error) return userQuery;
  const hintBlock = [
    vision.headline,
    vision.specialtyHints?.length ? `Specialties: ${vision.specialtyHints.join(", ")}` : "",
    vision.procedureHints?.length ? `Procedures: ${vision.procedureHints.join(", ")}` : "",
    vision.rawEntities?.length ? `Entities: ${vision.rawEntities.slice(0, 25).join(", ")}` : "",
    vision.detailsMarkdown ? `Details:\n${vision.detailsMarkdown}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const combined = `${userQuery}\n\n---\nInformation from uploaded referral image(s):\n${hintBlock}`;
  if (combined.length <= MAX_PROMPT_CHARS) return combined;
  return `${combined.slice(0, MAX_PROMPT_CHARS)}\n\n[…truncated for search]`;
}

module.exports = {
  analyzeReferralImagesFromFiles,
  buildAugmentedSearchQuery,
  MAX_PROMPT_CHARS,
};
