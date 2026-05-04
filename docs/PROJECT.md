# MojTermin — project overview

This document describes the **product idea**, **MVP scope**, and **what has been implemented so far** in this repository.

---

## 1. What MojTermin is

**MojTermin** is a web application that helps people get **faster healthcare appointments**. Patients often do not know where waiting times are shortest, and they miss newly freed slots. The product lets users describe what they need, then **monitors availability in the background** and **notifies them** when a better (earlier) option appears.

For **V1**, the focus is **not** a heavy UI. The success criterion is an **end-to-end loop**:

1. User submits a request (what they need + contact).
2. The system interprets the request (e.g. with AI), maps it to **predefined providers** in a database.
3. A **background process** runs on a schedule (e.g. every 5–15 minutes), checks availability or waiting times (initially **simulated** or **manually maintained**).
4. When a **better** slot is found, the system sends an **email** to the user.

No booking integration is required for the MVP; alerting is enough.

---

## 2. Problem

- Users do not know which providers have the shortest queues.
- Comparing providers is hard.
- Cancelled appointments are easy to miss.
- People spend time calling clinics repeatedly.

---

## 3. Goals (MVP)

| Priority | Goal |
|----------|------|
| Primary | Request in → user gets notified when an earlier appointment is possible. |
| Secondary | Simple inputs, automated monitoring, email notifications. |

**Out of scope for MVP (examples):** SMS (planned later), real booking flows, large real-time provider integrations, complex dashboards (beyond minimal status if needed).

---

## 4. Target users

- Patients with referrals.
- Parents arranging care for children.
- Chronic patients who need repeated appointments.

---

## 5. Product surface (roadmap vs V1)

The full product conversation included several routes. **V1 frontend** can stay minimal; the list below is the **intended** surface over time.

| Area | Purpose |
|------|---------|
| **Landing** | Explain the product; primary CTA to start. |
| **`/request`** | Query (e.g. “knee MRI”), optional location, priority; “start monitoring”. |
| **`/dashboard`** | Active requests, status (e.g. ACTIVE / FOUND); stop monitoring. |
| **`/alerts`** | Found appointments: provider, date, location. |
| **Notifications** | Email in MVP; SMS in a later version. |

**Core backend behaviour (conceptual):**

1. Parse / classify the user request (AI-assisted).
2. Fetch matching providers from the database.
3. Check availability or waiting-time signals.
4. Rank options; when something improves vs what the user already “knows”, notify.

---

## 6. Technical direction (agreed at high level)

These choices were discussed with the client; **the stack can evolve** (e.g. Supabase, Railway, Resend, OpenAI). The important split is:

| Layer | Role |
|-------|------|
| **Frontend** | Marketing / landing, then minimal forms for request + confirmation. |
| **Backend** | APIs, persistence, AI interpretation, scheduler / worker, email sending. |
| **Database** | Users, requests, providers, availability snapshots, alert history. |
| **Scheduler / agent** | Long-running or periodic job that keeps checking after a request is created. |

**Illustrative API ideas** (not all implemented yet):

- `POST /request` — create a monitoring request.
- `GET /status/:id` — check status.
- `POST /cancel` — stop monitoring.

---

## 7. Repository — what exists today

### 7.1 Client (React + Vite)

The **`client/`** app is the current focus for **UI**. It uses **React**, **TypeScript**, **Tailwind CSS**, and **Vite**.

### 7.2 Steps completed so far (documentation of work done)

The following items were done while aligning the client with MojTermin and the landing mockup:

1. **Replaced placeholder app shell** — `App.tsx` now renders a dedicated landing page instead of a stub.
2. **Added a Slovenian marketing landing page** — sections: header + logo, hero (headline, subcopy, CTA), “Kako deluje” (3 steps), decorative divider, “Prednosti storitve” (3 benefits), footer with links and copyright.
3. **Fixed `index.html` metadata** — title, description, keywords, Open Graph, Twitter card, theme colour, `lang="sl"`, favicon reference; removed unrelated content from a previous template.
4. **Theming** — `index.css` and `tailwind.config.ts` updated toward MojTermin greens and Inter as the primary typeface.
5. **Simplified Vite setup** — removed PWA-only wiring from `main.tsx` / config where it blocked a clean dev run for this MVP slice.
6. **Favicon** — added `public/favicon.svg` for the MojTermin mark in the browser tab.

**Not done yet in this doc’s sense** (still part of the product idea, not the current client-only slice):

- Backend APIs, database schema, real scheduler, OpenAI integration, Resend (or other) email, `/request`, `/dashboard`, `/alerts` routes wired to live data.

---

## 8. How to run the client locally

From the repository root:

```bash
cd client
npm install
npm run dev
```

Follow the URL printed in the terminal (port may vary if 8080 is busy).

---

## 9. Language

User-facing copy on the landing page is **Slovenian** (`sl`). Meta tags use Slovenian descriptions where applicable.

---

## 10. Related files (landing + meta)

| File | Role |
|------|------|
| `client/index.html` | Document language, SEO and social meta, favicon link. |
| `client/src/components/LandingPage.tsx` | Landing layout and copy. |
| `client/src/App.tsx` | Entry to the landing page. |
| `client/src/index.css` | Global CSS variables and base styles. |
| `client/tailwind.config.ts` | Tailwind theme extensions. |
| `client/public/favicon.svg` | Tab icon. |

---

*Last updated to reflect the client landing slice and agreed MVP concept. Extend this file when backend and monitoring are added.*
