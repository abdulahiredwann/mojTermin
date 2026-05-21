export type SubscriptionPlan = "free" | "pro";

export const PLAN_QUERY_KEY = "plan";

export function parsePlanParam(value: string | null | undefined): SubscriptionPlan {
  return value === "pro" ? "pro" : "free";
}

export function signupPathForPlan(plan: SubscriptionPlan): string {
  return `/signup?${PLAN_QUERY_KEY}=${plan}`;
}
