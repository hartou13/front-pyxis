import axios from "axios";
import { getApiBaseUrl } from "@/lib/auth-client";
import { getSession } from "@/lib/session";

/** GET /account — Bearer token, matches Pyxis Postman "get user accounts". */
export async function fetchAccounts(): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.get(`${getApiBaseUrl()}/account`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });
  return data;
}

export type CreateAccountBody = {
  account_name: string;
  account_move_type: string;
  account_type: string;
  super_account_id: string | null;
};

/** POST /account — Bearer token, matches Pyxis Postman "create account". */
export async function createAccount(
  body: CreateAccountBody,
): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.post(`${getApiBaseUrl()}/account`, body, {
    headers: {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json",
    },
  });
  return data;
}

/** PUT /account/{id} — Bearer token, matches Pyxis Postman "update account". */
export async function updateAccount(
  id: string,
  body: CreateAccountBody,
): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.put(
    `${getApiBaseUrl()}/account/${encodeURIComponent(id)}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
      },
    },
  );
  return data;
}

/** DELETE /account/{id} — Bearer token, matches Pyxis Postman "delete account". */
export async function deleteAccount(id: string): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.delete(
    `${getApiBaseUrl()}/account/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    },
  );
  return data;
}

export function accountsResponseToList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter((x): x is Record<string, unknown> => !!x && typeof x === "object");
  }
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["accounts", "data", "items", "results"]) {
      const inner = o[key];
      if (Array.isArray(inner)) {
        return accountsResponseToList(inner);
      }
    }
    if ("id" in o || "account_name" in o) {
      return [o];
    }
  }
  return [];
}
