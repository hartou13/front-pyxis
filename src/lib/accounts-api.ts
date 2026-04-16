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

/** GET /account/{id} — Bearer token, fetch a single account with sub_accounts */
export async function fetchAccount(id: string): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.get(`${getApiBaseUrl()}/account/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });
  return data;
}

/** GET /account/{id}/move-history — Bearer token, fetch move history for an account with pagination */
export async function fetchAccountMoveHistory(id: string, page?: number, limit?: number): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const params = new URLSearchParams();
  if (page !== undefined) {
    params.append("page", String(page));
  }
  if (limit !== undefined) {
    params.append("limit", String(limit));
  }
  const query = params.toString();
  const url = query
    ? `${getApiBaseUrl()}/account/${encodeURIComponent(id)}/move-history?${query}`
    : `${getApiBaseUrl()}/account/${encodeURIComponent(id)}/move-history`;
  const { data } = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });
  return data;
}

/** GET /account/{id}/solde — Bearer token, fetch account balance */
export async function fetchAccountSolde(id: string): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.get(`${getApiBaseUrl()}/account/${encodeURIComponent(id)}/solde`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });
  return data;
}

/** GET /account/{id}/tendency — Bearer token, fetch monthly balance tendency */
export async function fetchAccountTendency(id: string): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.get(`${getApiBaseUrl()}/account/${encodeURIComponent(id)}/tendency`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });
  return data;
}

/** GET /account/{id}/week-tendency — Bearer token, fetch weekly balance tendency */
export async function fetchAccountWeekTendency(id: string): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.get(`${getApiBaseUrl()}/account/${encodeURIComponent(id)}/week-tendency`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });
  return data;
}

/** GET /account/{id}/day-tendency — Bearer token, fetch daily balance tendency */
export async function fetchAccountDayTendency(id: string): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.get(`${getApiBaseUrl()}/account/${encodeURIComponent(id)}/day-tendency`, {
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

/** GET /solde/evolution — Bearer token, fetch account balances with filtering by date range */
export async function fetchSoldeEvolution(startDate: string, endDate: string): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const params = new URLSearchParams();
  params.append("start_date", startDate);
  params.append("end_date", endDate);
  const { data } = await axios.get(`${getApiBaseUrl()}/solde/evolution?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });
  return data;
}
