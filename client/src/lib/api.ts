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
    return `${window.location.protocol}//${window.location.hostname}:4000/api`;
  }

  // Production default
  return "https://moj-termin-1xbx.vercel.app/api";
}

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});
