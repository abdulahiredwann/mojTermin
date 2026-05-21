const VALID_PLANS = new Set(["free", "pro"]);

/** Plan from signup body; defaults to free. */
function parseSignupPlan(raw) {
  if (typeof raw !== "string") return "free";
  const v = raw.trim().toLowerCase();
  return VALID_PLANS.has(v) ? v : "free";
}

/** Effective tier for API/UI: null or unknown stored value => free. */
function effectiveSubscriptionPlan(rec) {
  if (!rec || rec.subscriptionPlan == null) return "free";
  const v = String(rec.subscriptionPlan).trim().toLowerCase();
  return v === "pro" ? "pro" : "free";
}

function toIsoOrNull(value) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
}

module.exports = {
  parseSignupPlan,
  effectiveSubscriptionPlan,
  toIsoOrNull,
};
