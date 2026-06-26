export const PYXIS_SESSION_KEY = "pyxis_session";

export type PyxisSession = {
  token: string;
  first_name: string;
  last_name: string;
  email: string;
};

export function saveSession(data: PyxisSession): void {
  localStorage.setItem(PYXIS_SESSION_KEY, JSON.stringify(data));
}

export function getSession(): PyxisSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PYXIS_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;
    if (typeof o.token !== "string" || !o.token) return null;
    return {
      token: o.token,
      first_name: typeof o.first_name === "string" ? o.first_name : "",
      last_name: typeof o.last_name === "string" ? o.last_name : "",
      email: typeof o.email === "string" ? o.email : "",
    };
  } catch {
    return null;
  }
}

export function hasValidSession(): boolean {
  return getSession() !== null;
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(PYXIS_SESSION_KEY);
  }
}
