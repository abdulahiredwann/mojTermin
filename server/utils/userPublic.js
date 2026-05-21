const { effectiveSubscriptionPlan, toIsoOrNull } = require("./userSubscription");

function sanitizePublicUser(rec) {
  const storedPlan = rec.subscriptionPlan ?? null;
  return {
    id: rec.id,
    name: rec.name,
    email: rec.email,
    phone: rec.phone ?? null,
    subscriptionPlan: storedPlan,
    effectivePlan: effectiveSubscriptionPlan(rec),
    subscriptionStartedAt: toIsoOrNull(rec.subscriptionStartedAt),
    subscriptionEndsAt: toIsoOrNull(rec.subscriptionEndsAt),
  };
}

module.exports = { sanitizePublicUser };
