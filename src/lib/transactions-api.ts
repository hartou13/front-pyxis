import axios from "axios";
import { getApiBaseUrl } from "@/lib/auth-client";
import { getSession } from "@/lib/session";

/** GET /move — Bearer token, fetch all transactions */
export async function fetchTransactions(): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.get(`${getApiBaseUrl()}/move`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });
  return data;
}

/** GET /move/{id} — Bearer token, fetch a single transaction */
export async function fetchTransaction(id: string): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.get(`${getApiBaseUrl()}/move/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${session.token}`,
    },
  });
  return data;
}

export type CreateTransactionBody = {
  amount: number;
  from_account_id: string;
  to_account_id: string;
  description: string;
  detail: string;
  date: string;
};

/** POST /move — Bearer token, create a new transaction */
export async function createTransaction(
  body: CreateTransactionBody,
): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.post(`${getApiBaseUrl()}/move`, body, {
    headers: {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json",
    },
  });
  return data;
}

/** PUT /move/{id} — Bearer token, update a transaction */
export async function updateTransaction(
  id: string,
  body: CreateTransactionBody,
): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.put(
    `${getApiBaseUrl()}/move/${encodeURIComponent(id)}`,
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

/** DELETE /move/{id} — Bearer token, delete a transaction */
export async function deleteTransaction(id: string): Promise<unknown> {
  const session = getSession();
  if (!session) {
    throw new Error("Not authenticated");
  }
  const { data } = await axios.delete(
    `${getApiBaseUrl()}/move/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    },
  );
  return data;
}

export function transactionsResponseToList(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data)) {
    return data.filter((x): x is Record<string, unknown> => !!x && typeof x === "object");
  }
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of ["transactions", "data", "items", "results"]) {
      const inner = o[key];
      if (Array.isArray(inner)) {
        return transactionsResponseToList(inner);
      }
    }
    if ("id" in o || "amount" in o) {
      return [o];
    }
  }
  return [];
}
