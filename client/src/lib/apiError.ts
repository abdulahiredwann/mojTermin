import { AxiosError } from "axios";
import { toast } from "sonner";

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    return (err.response?.data as { error?: string })?.error || fallback;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

/** Inline error state + Sonner toast for failed API calls */
export function showApiError(err: unknown, fallback: string): string {
  const msg = getApiErrorMessage(err, fallback);
  toast.error(msg);
  return msg;
}
