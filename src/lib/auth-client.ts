import axios from "axios";

function apiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_PYXIS_HOST?.trim();
  if (!raw) {
    throw new Error("NEXT_PUBLIC_PYXIS_HOST is not set");
  }
  return raw.replace(/\/$/, "");
}

/** POST /auth/login — matches Pyxis Postman collection. */
export async function loginRequest(email: string, password: string) {
  return axios.post(`${apiBaseUrl()}/auth/login`, { email, password });
}
