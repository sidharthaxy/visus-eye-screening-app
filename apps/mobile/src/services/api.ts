// The only place the app talks to the server. Screens call services/*,
// never fetch directly. Until a route is live, its service returns data
// from services/mock/ instead.

import { useAuth } from '@/store/auth';

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8787';
/** The web app: report links, terms and privacy pages. */
export const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? 'https://visus.app';

/** Flip per service to the real API once its route is live (see docs/API.md). */
export const USE_MOCK = true;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function request<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = useAuth.getState().token;
  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error ?? res.statusText);
  return data as T;
}

/** Simulates network delay for mock responses. */
export const mockDelay = <T>(value: T, ms = 400) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));
