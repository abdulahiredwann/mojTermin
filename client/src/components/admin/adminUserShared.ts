import { AxiosError } from "axios";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  effectivePlan: "free" | "pro";
  subscriptionPlan: string | null;
  restricted: boolean;
  createdAt: string;
  requestCount: number;
  lastActiveAt: string;
};

export type UserRequestRow = {
  id: string;
  query: string;
  intent: string | null;
  city: string | null;
  hospitalName: string | null;
  preferredDate: string;
  status: string;
  notifyEmail: boolean;
  notifyFasterRefresh: boolean;
  notifySms: boolean;
  createdAt: string;
};

export function fmtDateTime(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

export function fmtDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString();
}

export function apiError(err: unknown, fallback: string) {
  if (err instanceof AxiosError) {
    return (err.response?.data as { error?: string })?.error || fallback;
  }
  return fallback;
}
