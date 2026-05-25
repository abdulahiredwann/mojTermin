const STORAGE_KEY = "mojtermin.pendingRequest";

export type PendingRequest = {
  email: string;
  query: string;
  intent: string;
  city: string | null;
  hospitalId: string;
  hospitalName: string;
  preferredDate: string;
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
    return JSON.parse(raw) as PendingRequest;
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
