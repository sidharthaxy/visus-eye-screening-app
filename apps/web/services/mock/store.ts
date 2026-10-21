// Tiny localStorage-backed store so mock data survives a refresh.

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem("visus.mock." + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem("visus.mock." + key, JSON.stringify(value));
  } catch {}
}

export const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

export const uid = () => Math.random().toString(36).slice(2, 10);
