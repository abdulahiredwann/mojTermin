# MojTermin V1 — Hospital Data Emulator Plan

This note describes how to emulate hospital appointment availability for the MVP, while keeping the same architecture that will later work with real provider data.

---

## 1) Goal for V1

For MVP we want a realistic flow:

1. User writes free text (pain/problem, referral context, or anything).
2. AI normalizes that query into structured intent.
3. Backend filters hospitals/services from our DB.
4. System returns ranked options (soonest + nearest + relevant).
5. Request and results are stored for tracking and future notifications.

For now, availability is **simulated** (fake but realistic changing data).

---

## 2) Why emulator first

- Faster shipping for MVP.
- Allows frontend/admin/demo testing end-to-end now.
- Lets us tune AI parsing and ranking logic before real integrations.
- Keeps same API contract for future real data sources.

---

## 3) Data model to emulate hospitals and slots

Add DB tables (names can be adjusted):

### `Hospital`
- `id`
- `name`
- `city`
- `address`
- `lat`
- `lng`
- `isActive`

### `Department` (or `HospitalService`)
- `id`
- `hospitalId`
- `specialty` (e.g. `radiology`, `dermatology`, `orthopedics`)
- `procedure` (e.g. `knee_mri`, `skin_exam`)
- `isActive`

### `AvailabilitySnapshot`
- `id`
- `departmentId`
- `earliestDate`
- `estimatedWaitDays`
- `source` (`emulator`, later `provider_api`, `manual`)
- `confidence` (0-1)
- `capturedAt`

### `SearchRequest` (already partially exists as `AvailabilityRequest`)
- `id`
- `rawQuery`
- `normalizedNeed`
- `locationText`
- `lat`
- `lng`
- `urgency`
- `locale`
- `createdAt`

### `SearchResult`
- `id`
- `searchRequestId`
- `hospitalId`
- `departmentId`
- `score`
- `rank`
- `estimatedWaitDays`
- `earliestDate`
- `distanceKm`
- `createdAt`

---

## 4) Emulator behavior (fake availability engine)

Create a simple job (cron every 5-15 min) that updates `AvailabilitySnapshot`:

1. For each department, keep a base wait range (example: 10-80 days).
2. Add random movement (+/- 1 to 5 days) each cycle.
3. Sometimes create a sudden "free slot" event (e.g. 10% chance): wait drops significantly.
4. Never go below 1 day.
5. Save snapshots for history (do not overwrite only one row).

This makes results look alive and realistic for demo/testing.

---

## 5) AI query understanding (input to filters)

User may input:
- pain ("koleno boli")
- symptom ("rash on arm")
- direct need ("MRI knee")
- mixed language / spelling mistakes

AI output should be normalized into:

```json
{
  "specialty": "radiology",
  "procedure": "knee_mri",
  "bodyPart": "knee",
  "urgency": "normal",
  "locationText": "Ljubljana"
}
```

If AI is uncertain:
- fallback to keyword rules and synonym map.
- store both `rawQuery` and normalized output.

---

## 6) Ranking formula (simple and explainable)

For each candidate department/hospital:

- `waitScore` (lower wait -> better)
- `distanceScore` (nearer -> better)
- `relevanceScore` (AI confidence + specialty/procedure match)

Example weighted total:

- `total = 0.55 * waitScore + 0.30 * relevanceScore + 0.15 * distanceScore`

For V1 this is enough and easy to tune.

---

## 7) Suggested API flow for this emulator

### `POST /api/availability`

Input:
- `need` (text)
- optional `imageUrl`
- optional `location`

Backend:
1. Save request.
2. AI normalize.
3. Query hospitals/departments by normalized need.
4. Join latest availability snapshot.
5. Rank and return top N.
6. Save `SearchResult` rows.

Response:
- requestId
- normalized interpretation
- ranked options

### Admin APIs (later)
- `POST /api/admin/hospitals/emulator/seed` (seed fake hospitals/services)
- `POST /api/admin/hospitals/emulator/tick` (run one emulator update manually)
- `GET /api/admin/hospitals/snapshots` (inspect simulated availability)

---

## 8) How to feed fake hospital data now

Two options:

1. **Prisma seed** (recommended first)
   - Seed 10-30 hospitals around Slovenia.
   - Seed key specialties/procedures.
   - Seed initial availability snapshots.

2. **Admin CSV upload** (next step)
   - Upload hospital/service baseline data.
   - Parse CSV and insert/update records.

Start with seed. Add CSV later.

---

## 9) Migration path to real providers (no rewrite)

Keep one interface:

- `AvailabilityProvider.getLatest(departmentId)`

Implementations:
- `EmulatorAvailabilityProvider` (today)
- `RealProviderApiAvailabilityProvider` (later)
- `ManualBackofficeAvailabilityProvider` (optional)

Because the API + DB + ranking stay the same, replacing data source is low risk.

---

## 10) Practical MVP phases

### Phase A (now)
- Add hospital + department + snapshot tables.
- Seed fake hospitals/services.
- Add emulator job.
- Return ranked simulated results from `/api/availability`.

### Phase B
- Add admin page for Hospitals:
  - hospital list
  - department list
  - current simulated waits
  - "run emulator tick" button

### Phase C
- Add basic notifications:
  - compare new best slot vs last known for request
  - if improved, send email.

---

## 11) Important MVP guardrails

- Keep logic transparent (avoid black-box scoring for now).
- Keep AI output schema strict and validated.
- Always store raw user query for debugging.
- Keep emulator deterministic enough for repeatable tests (optional seed value).

---

## Summary

Your idea is correct for V1:

- AI interprets user input.
- DB stores hospitals and availability.
- Emulator mimics changing slot availability.
- Backend filters and ranks by need + location.

This gives you a believable, testable MVP now, and a clean path to real hospital integrations later.
