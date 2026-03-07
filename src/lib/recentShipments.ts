const STORAGE_KEY = 'kestrel.recentShipments';
const MAX_TRACKED = 25;

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === 'string');
  } catch {
    return [];
  }
}

export function listTrackedShipmentIds(): string[] {
  return read();
}

export function trackShipment(id: string): void {
  const next = [id, ...read().filter((existing) => existing !== id)].slice(0, MAX_TRACKED);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage may be full or blocked; tracking is best-effort
  }
}

export function untrackShipment(id: string): void {
  const next = read().filter((existing) => existing !== id);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // best-effort
  }
}
