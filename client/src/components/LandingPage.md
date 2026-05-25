# Track appointment → signup flow

How the landing page saves a tracking request when the user is not logged in, then submits it automatically after signup or login.

## Files involved

| File | Role |
|------|------|
| `LandingPage.tsx` | Search, pick hospital/date/email, click **Track** |
| `../lib/pendingRequest.ts` | Save / load / clear draft in `localStorage` |
| `SignupPage.tsx` | After register, submit pending request |
| `LoginPage.tsx` | After login, submit pending request |

## User flow

```
Landing page
  → Search (problem + city)
  → Pick hospital + preferred date
  → Enter email (required)
  → Click "Track"
       │
       ├─ Logged in?  → POST /appointments immediately → success dialog
       │
       └─ Not logged in?
            → savePendingRequest(...) in localStorage
            → navigate to /signup
                 │
                 ├─ Sign up or log in
                 │
                 └─ loadPendingRequest()
                      → POST /appointments with saved data (email from landing)
                      → clearPendingRequest()
                      → redirect to /user/appointments
```

## What gets saved (`PendingRequest`)

Stored under key `mojtermin.pendingRequest` in the browser:

- `email` — from the landing **Email** input (not from signup/login form for the appointment)
- `query` — what the user typed (problem)
- `intent` — from search API
- `city`, `hospitalId`, `hospitalName`, `preferredDate`
- `notifyEmail` — email notification checkbox state

Referral image files are **not** saved (browser cannot persist `File` objects in `localStorage`). User can add photos again from the dashboard after signing up.

## Landing page behavior (`handleConfirmRequest`)

1. Requires hospital, date, and **non-empty email**.
2. **Guest:** `savePendingRequest` + `navigate("/signup")` — no API call yet.
3. **Logged in:** `POST /appointments` with `email` from the input (prefilled from account, editable).

Email field is always visible. If the user is logged in, `user.email` prefills the input via `useEffect`.

## After auth (`SignupPage` / `LoginPage`)

On successful **register** or **login**:

1. `loadPendingRequest()`
2. If present → `POST /appointments` with `pending.email` and other fields
3. `clearPendingRequest()`
4. Redirect to **`/user/appointments`** (so they see the new request)

If there is no pending request, redirect goes to `/user/dashboard` as usual.

Signup/login forms also **prefill** the auth email field from `pending.email` when the user arrived from tracking.

If the user was **already logged in** and opens `/signup` or `/login` with a pending request still in storage, the same submit + redirect runs in a `useEffect`.

## API payload (after auth)

Same shape as a normal landing submit:

```json
{
  "email": "<from pending.email>",
  "query": "...",
  "intent": "...",
  "city": "...",
  "hospitalId": "...",
  "hospitalName": "...",
  "preferredDate": "YYYY-MM-DD",
  "notifyEmail": true,
  "notifyFasterRefresh": false,
  "notifySms": false
}
```

## Design notes

- **Simple:** one `localStorage` key, no backend session for drafts.
- **Marketing:** guests can try the product; account creation completes the track.
- **Email source:** always the landing email field for the appointment record, so it matches what they entered before signup.
