"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { NumericInput } from "@/components/NumericInput";
import { updateTransaction } from "@/lib/transactions-api";
import { fetchAccounts, accountsResponseToList } from "@/lib/accounts-api";

function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

function getNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const v = obj[key];
  return typeof v === "number" ? v : undefined;
}

function getAccountId(account: Record<string, unknown>): string | undefined {
  const v = account.id;
  return typeof v === "string" ? v : undefined;
}

function getAccountMoveType(account: Record<string, unknown>): string | undefined {
  return getString(account, "account_move_type");
}

function formatDateForInput(dateString: string | undefined): string {
  if (!dateString) return "";
  try {
    // Handle ISO format like "2026-04-11T08:00:00" and convert to datetime-local format
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

export function EditTransactionModal({
  open,
  transaction,
  onClose,
  onUpdated,
}: {
  open: boolean;
  transaction: Record<string, unknown> | undefined;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [accounts, setAccounts] = useState<Record<string, unknown>[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    amount: "",
    from_account_id: "",
    to_account_id: "",
    description: "",
    detail: "",
    date: "",
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        amount: "",
        from_account_id: "",
        to_account_id: "",
        description: "",
        detail: "",
        date: "",
      });
      setError(null);
      return;
    }

    const loadAccounts = async () => {
      setLoadingAccounts(true);
      setError(null);
      try {
        const raw = await fetchAccounts();
        setAccounts(accountsResponseToList(raw));

        // Pre-fill form with transaction data
        if (transaction) {
          setFormData({
            amount: String(getNumber(transaction, "amount") ?? ""),
            from_account_id: getString(transaction, "from_account_id") ?? "",
            to_account_id: getString(transaction, "to_account_id") ?? "",
            description: getString(transaction, "description") ?? "",
            detail: getString(transaction, "detail") ?? "",
            date: formatDateForInput(getString(transaction, "date")),
          });
        }
      } catch (err) {
        let msg = "Failed to load accounts.";
        if (axios.isAxiosError(err)) {
          const raw =
            err.response?.data &&
            typeof err.response.data === "object" &&
            "message" in err.response.data &&
            typeof (err.response.data as { message: unknown }).message === "string"
              ? (err.response.data as { message: string }).message
              : err.response?.statusText || err.message;
          if (typeof raw === "string") msg = raw;
        } else if (err instanceof Error) {
          msg = err.message;
        }
        setError(msg);
      } finally {
        setLoadingAccounts(false);
      }
    };

    void loadAccounts();
  }, [open, transaction]);

  const fromAccountOptions = accounts.filter((acc) => {
    const moveType = getAccountMoveType(acc);
    return moveType !== "expense";
  });

  const toAccountOptions = accounts.filter((acc) => {
    const moveType = getAccountMoveType(acc);
    return moveType !== "income";
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setError(null);

    try {
      if (!transaction) {
        throw new Error("Transaction data not available");
      }

      const transactionId = getString(transaction, "id");
      if (!transactionId) {
        throw new Error("Transaction ID not found");
      }

      const amount = parseFloat(formData.amount);
      if (!formData.from_account_id) {
        throw new Error("From account is required");
      }
      if (!formData.to_account_id) {
        throw new Error("To account is required");
      }
      if (!formData.date) {
        throw new Error("Date is required");
      }
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      await updateTransaction(transactionId, {
        amount,
        from_account_id: formData.from_account_id,
        to_account_id: formData.to_account_id,
        description: formData.description,
        detail: formData.detail,
        date: formData.date,
      });

      onClose();
      onUpdated();
    } catch (err) {
      let msg = "Failed to update transaction.";
      if (axios.isAxiosError(err)) {
        const raw =
          err.response?.data &&
          typeof err.response.data === "object" &&
          "message" in err.response.data &&
          typeof (err.response.data as { message: unknown }).message === "string"
            ? (err.response.data as { message: string }).message
            : err.response?.statusText || err.message;
        if (typeof raw === "string") msg = raw;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Edit Transaction
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Close modal"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          ) : null}

          {loadingAccounts ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading accounts…</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  Amount *
                </label>
                <NumericInput
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e })
                  }
                  allowDecimals
                  maxDecimals={2}
                  allowNegative={false}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-zinc-400 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-zinc-500 dark:focus:border-slate-400 dark:focus:ring-slate-400"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  From Account *
                </label>
                <select
                  required
                  value={formData.from_account_id}
                  onChange={(e) =>
                    setFormData({ ...formData, from_account_id: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-400 dark:focus:ring-slate-400"
                >
                  <option value="">Select an account</option>
                  {fromAccountOptions.map((acc) => {
                    const id = getAccountId(acc);
                    const name =
                      getString(acc, "account_name") ||
                      getString(acc, "name") ||
                      id ||
                      "Unnamed";
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  To Account *
                </label>
                <select
                  required
                  value={formData.to_account_id}
                  onChange={(e) =>
                    setFormData({ ...formData, to_account_id: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-400 dark:focus:ring-slate-400"
                >
                  <option value="">Select an account</option>
                  {toAccountOptions.map((acc) => {
                    const id = getAccountId(acc);
                    const name =
                      getString(acc, "account_name") ||
                      getString(acc, "name") ||
                      id ||
                      "Unnamed";
                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-zinc-400 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-zinc-500 dark:focus:border-slate-400 dark:focus:ring-slate-400"
                  placeholder="e.g., Monthly transfer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  Detail
                </label>
                <textarea
                  value={formData.detail}
                  onChange={(e) =>
                    setFormData({ ...formData, detail: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-zinc-400 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-zinc-500 dark:focus:border-slate-400 dark:focus:ring-slate-400"
                  placeholder="Additional details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 dark:text-slate-100">
                  Date *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-400 dark:focus:ring-slate-400"
                />
              </div>
            </div>
          )}
        </form>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loadingSubmit || loadingAccounts}
              onClick={handleSubmit}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {loadingSubmit ? "Updating…" : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
