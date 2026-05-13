import axios from "axios";

function getApiBaseUrl(): string {
  const raw =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_API_URL as string | undefined);

  if (raw?.trim()) {
    try {
      return `${new URL(raw.trim()).origin}/api`;
    } catch {
      // ignore and fall back
    }
  }

  // Local dev: assume backend runs on :4000
  if (import.meta.env.DEV && typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }

  // Production default
  return "https://moj-termin-1xbx.vercel.app/api";
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
