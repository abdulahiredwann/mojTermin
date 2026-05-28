const STORAGE_KEY = "mojtermin.pendingRequest";

export type PendingRequest = {
  email: string;
  query: string;
  intent: string;
  requests: Array<{
    city: string | null;
    hospitalId: string;
    hospitalName: string;
    preferredDate: string;
  }>;
  notifyEmail: boolean;
};

export function savePendingRequest(data: PendingRequest): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function loadPendingRequest(): PendingRequest | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as
      | PendingRequest
      | (PendingRequest & {
          city?: string | null;
          hospitalId?: string;
          hospitalName?: string;
          preferredDate?: string;
        });

    // Backward compatibility with old single-request shape.
    if (!Array.isArray(parsed.requests) && parsed.hospitalId && parsed.hospitalName && parsed.preferredDate) {
      return {
        email: parsed.email,
        query: parsed.query,
        intent: parsed.intent,
        notifyEmail: parsed.notifyEmail,
        requests: [
          {
            city: parsed.city ?? null,
            hospitalId: parsed.hospitalId,
            hospitalName: parsed.hospitalName,
            preferredDate: parsed.preferredDate,
          },
        ],
      };
    }

    if (!Array.isArray(parsed.requests)) return null;
    return parsed as PendingRequest;
  } catch {
    return null;
  }
}

export function clearPendingRequest(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
