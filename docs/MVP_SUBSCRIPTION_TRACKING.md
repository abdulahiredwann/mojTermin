# Current MVP Task Overview — Subscription & Tracking

This document is the **implementation guide** for the subscription-based tracking and notification workflow. UI (pricing on the landing page) can ship first; backend steps below are **planned**, not all implemented yet.

---

## Goal

Build the subscription-based tracking and notification workflow for the appointment availability system.

---

## Current product logic

- Users search for medical services/providers
- AI search/optimization is already working for V1
- Users can select a provider/hospital and click **Start Tracking** or **Notify Me**
- System stores the tracking request
- System periodically checks waiting-time/availability updates from the source website
- If waiting time improves or a better appointment appears, users receive notifications

**Important**

- We are **not** booking appointments
- We are **not** confirming with hospitals
- Users contact hospitals directly themselves
- Current data comes from scraping/public sources
- Future versions may use live partner/hospital data integrations

---

## Subscription logic

### FREE users

- Limited tracking (e.g. 1 active request)
- Slower refresh interval
- Email notifications only

### PRO users

- Multiple tracking requests
- Daily refresh checks (faster refresh, multiple times per day)
- SMS + email notifications
- Priority processing

---

## Main backend tasks (step by step)

| Step | Area | Notes |
|------|------|--------|
| 1 | User subscription management | Plan tier on user record; enforce limits |
| 2 | Tracking request system | Persist requests linked to user + hospital/service |
| 3 | Scheduled refresh / cron jobs | Tier-based intervals (FREE slower, PRO faster) |
| 4 | Waiting-time comparison logic | Detect improvement vs last snapshot |
| 5 | Notification workflow | Email (FREE); email + SMS (PRO) |
| 6 | Admin-side subscription management | Manual tier changes for now |
| 7 | Payment integration | Later — Stripe or similar |

---

## Example workflow

```
User → Search Provider → Start Tracking → Save Tracking Request
  → Cron checks updates → Detect better availability → Send notification
```

---

## Landing page (done first)

- **Pricing section** on home (`#pricing`): FREE vs PRO cards + comparison table (Slovenian/English copy)
- Nav link **Paketi / Pricing** scrolls to `#pricing`
- Signup passes `?plan=free|pro` and sends `plan` on `POST /auth/register`

## Database (User subscription fields)

| Column | Type | Notes |
|--------|------|--------|
| `subscriptionPlan` | `String?` | `"free"` or `"pro"`. **Null** = legacy user → treated as **free** |
| `subscriptionStartedAt` | `DateTime?` | Set on signup |
| `subscriptionEndsAt` | `DateTime?` | Null until billing/cancel (PRO trial for now) |

API user object includes `effectivePlan` (always `free` or `pro`) plus raw nullable fields.

---

## Out of scope for this MVP phase

- Real payment checkout (placeholder CTAs only)
- Hospital booking or confirmation
- Live hospital API integrations (future)
