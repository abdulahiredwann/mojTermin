# MojTermin Admin Hospitals — Dynamic Editing + AI Flow Spec

This document defines the next step for the Hospitals admin page:
- dynamic table editing
- row selection and bulk actions
- AI chat workflow (UI + backend flow only, no real AI model yet)

Goal: make emulator data easy to manipulate for MVP operations.

---

## 1) Product intent

The admin should be able to:

1. Search/filter hospitals quickly.
2. Select one or many rows with checkboxes.
3. Edit hospital data inline (or row edit panel).
4. Add/edit/remove services per hospital.
5. Delete selected rows in bulk.
6. Open an "AI assistant" box and ask for data changes, optionally scoped to selected rows.

For now, AI is flow-only:
- we capture prompt + selected rows
- backend returns a "proposed action payload" (mock/stub)
- admin confirms before applying changes.

---

## 2) UX layout changes (Hospitals page)

## Top toolbar

- Left:
  - title + total count
- Center/top:
  - global search input
- Right:
  - `Add hospital` button
  - `AI command` button (opens side panel/chat drawer)

## Bulk action bar (visible when rows selected)

- `N selected`
- actions:
  - `Delete selected`
  - `Tag selected for AI`
  - `Clear selection`

## Table updates

- first column: checkbox per row + select-all checkbox in header
- action column:
  - edit pencil
  - add service
  - delete row

---

## 3) Row-level editing behavior

### Hospital row edit
- Click pencil -> row enters edit mode.
- Editable fields:
  - name
  - city
  - country
  - address
  - phone
  - email
  - website
  - emergency24h
  - bedCount
  - averageWaitDays
  - notes
  - status
- Save / Cancel controls.

### Services edit
- Expand row to show service list.
- For each service:
  - edit specialty, procedureName, estimatedWaitDays, earliestDate, active flag, notes
  - remove service
- Add service inline:
  - new empty service row + save

---

## 4) AI chat panel flow (without real AI yet)

### UI
- Right-side drawer panel with:
  - prompt textarea
  - selected rows summary
  - "Apply suggestion" button (disabled until response)
  - "Generate suggestion" button

### Modes
- `Global mode`: no selected rows, prompt applies to all dataset.
- `Scoped mode`: selected rows attached to prompt context.

### Stub backend response shape

```json
{
  "summary": "Would reduce wait times for selected radiology services by 10%.",
  "operations": [
    {
      "type": "update_service",
      "hospitalId": "...",
      "serviceId": "...",
      "patch": { "estimatedWaitDays": 18 }
    }
  ],
  "requiresConfirmation": true
}
```

Admin reviews operations, then confirms apply.

---

## 5) Required backend endpoints

Base: `/api/admin/hospitals`

### Existing
- `GET /` with `page`, `limit`, `q`

### New CRUD
- `POST /` create hospital
- `PATCH /:hospitalId` update hospital
- `DELETE /:hospitalId` delete one hospital
- `POST /bulk-delete` with `{ hospitalIds: [] }`

### Service CRUD
- `POST /:hospitalId/services`
- `PATCH /:hospitalId/services/:serviceId`
- `DELETE /:hospitalId/services/:serviceId`

### AI flow (stub)
- `POST /ai/preview`
  - body: `{ prompt: string, selectedHospitalIds?: string[] }`
  - returns mock operations proposal
- `POST /ai/apply`
  - body: `{ operations: [...] }`
  - applies operations in DB

---

## 6) Frontend state model

On Hospitals page keep:

- `selectedRowIds: Set<string>`
- `editingHospitalId: string | null`
- `editingServiceId: string | null`
- `expandedRows: Set<string>`
- `aiDraftPrompt: string`
- `aiPreviewOperations: []`
- `isApplyingAiOperations: boolean`

Use React Query for server state:
- list query key: `["admin-hospitals", page, limit, q]`
- mutations for create/update/delete
- invalidate list query after each mutation

---

## 7) Validation rules (MVP level)

- `name` required for hospital.
- Service requires at least one of:
  - `specialty`
  - `procedureName`
- numeric fields:
  - `bedCount >= 0`
  - `estimatedWaitDays >= 0`
  - `averageWaitDays >= 0`
- email/website basic format validation.

---

## 8) Security + safety

- All endpoints require admin auth cookie middleware.
- Bulk delete and AI apply must validate IDs belong to existing records.
- AI apply should run in transaction if multiple operations.
- Add simple audit log later (who changed what, when).

---

## 9) Implementation phases

### Phase 1 (quick win)
- Add row checkboxes + bulk delete.
- Add row edit for hospital basic fields.
- Add service add/edit/delete.

### Phase 2
- Add AI drawer UI + selected-row context.
- Add `/ai/preview` mock endpoint with deterministic fake proposal.
- Add confirm + apply flow.

### Phase 3
- Replace mock AI preview with real model integration.
- Add natural-language to operation parser + guardrails.

---

## 10) Definition of done for this feature

- Admin can select rows and bulk delete.
- Admin can edit hospital and services from table UX.
- AI panel accepts prompt and selected rows.
- AI preview returns operations and admin can apply them.
- Pagination/search remain functional after edits/deletes.

---

## Summary

This design gives a dynamic data-ops interface now, while keeping AI safe and reviewable:
- humans stay in control (preview -> confirm -> apply),
- dataset manipulation becomes fast,
- and later AI can be plugged in without redesigning the page.
