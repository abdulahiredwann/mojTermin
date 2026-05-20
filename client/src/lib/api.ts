import axios from "axios";

/** Where the Express API is hosted (no trailing slash). Set in Vercel: VITE_API_BASE_URL */
const PRODUCTION_API_ORIGIN =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  "https://moj-termin-1xbx.vercel.app";

function getApiBaseUrl(): string {
  const raw =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_API_URL as string | undefined);

  if (raw?.trim()) {
    try {
      const origin = new URL(raw.trim()).origin;
      // Block misconfiguration: frontend URL + :5000 will hang on Vercel
      if (/\.vercel\.app:5000$/i.test(origin)) {
        console.error(
          "[api] VITE_API_BASE_URL must be your backend host, not the frontend with :5000",
        );
      }
      return `${origin}/api`;
    } catch {
      // ignore and fall back
    }
  }

  // Local dev only — never use :5000 on Vercel/production hostnames
  if (import.meta.env.DEV && typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return `${window.location.protocol}//${host}:5000/api`;
    }
  }

  try {
    return `${new URL(PRODUCTION_API_ORIGIN).origin}/api`;
  } catch {
    return "https://moj-termin-1xbx.vercel.app/api";
  }
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

/** API origin without trailing slash, e.g. http://localhost:4000 — for static uploads under /api/uploads */
export function getApiOrigin(): string {
  const baseURL = api.defaults.baseURL ?? "";
  return baseURL.replace(/\/?api\/?$/i, "").replace(/\/+$/, "") || "";
}

/** Built from DB-relative path such as referrals/<file> */
export function publicUploadUrl(storedRelativePath: string): string {
  const trimmed = storedRelativePath
    .replace(/^\/+/u, "")
    .replace(/^api\/uploads\/?/iu, "");
  const encoded = trimmed
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${getApiOrigin()}/api/uploads/${encoded}`;
}
