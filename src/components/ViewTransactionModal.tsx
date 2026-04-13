"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { fetchTransaction } from "@/lib/transactions-api";

function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

function getNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const v = obj[key];
  return typeof v === "number" ? v : undefined;
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function formatCurrency(amount: unknown): string {
  if (typeof amount === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
  return String(amount ?? "—");
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="text-sm text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

function AccountInfo({
  account,
  label,
}: {
  account: Record<string, unknown> | undefined;
  label: string;
}) {
  if (!account || typeof account !== "object") {
    return <DetailRow label={label} value="—" />;
  }

  const name = getString(account as Record<string, unknown>, "account_name") || "—";
  const moveType = getString(account as Record<string, unknown>, "account_move_type") || "—";
  const accountType = getString(account as Record<string, unknown>, "account_type") || "—";

  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="flex flex-col gap-1 text-sm text-zinc-900 dark:text-zinc-100">
        <div>
          <span className="font-medium">{name}</span>
        </div>
        <div className="flex gap-2 text-xs text-zinc-600 dark:text-zinc-400">
          <span>Move: {moveType}</span>
          <span>Type: {accountType}</span>
        </div>
      </dd>
    </div>
  );
}

export function ViewTransactionModal({
  open,
  transactionId,
  onClose,
}: {
  open: boolean;
  transactionId: string | undefined;
  onClose: () => void;
}) {
  const [transaction, setTransaction] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !transactionId) {
      setTransaction(null);
      setError(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await fetchTransaction(transactionId);
        if (raw && typeof raw === "object") {
          setTransaction(raw as Record<string, unknown>);
        } else {
          setError("Invalid transaction data");
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const msg =
            err.response?.data &&
            typeof err.response.data === "object" &&
            "message" in err.response.data &&
            typeof (err.response.data as { message: unknown }).message === "string"
              ? (err.response.data as { message: string }).message
              : err.response?.statusText || err.message;
          setError(typeof msg === "string" ? msg : "Failed to load transaction.");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load transaction.");
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open, transactionId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
        <div className="sticky top-0 flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Transaction Details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 transition hover:text-zinc-600 dark:hover:text-zinc-300"
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

        <div className="px-6 py-4">
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          ) : loading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Loading transaction details…
            </p>
          ) : transaction ? (
            <dl className="grid gap-6 sm:grid-cols-2">
              <DetailRow
                label="Description"
                value={getString(transaction, "description") || "—"}
              />
              <DetailRow
                label="Amount"
                value={formatCurrency(getNumber(transaction, "amount"))}
              />
              <DetailRow
                label="Date"
                value={formatDate(getString(transaction, "date"))}
              />
              <DetailRow
                label="Created At"
                value={formatDate(getString(transaction, "created_at"))}
              />
              <DetailRow
                label="Updated At"
                value={formatDate(getString(transaction, "updated_at"))}
              />
              <DetailRow
                label="Detail"
                value={getString(transaction, "detail") || "—"}
              />
              <div className="sm:col-span-2">
                <AccountInfo
                  account={
                    transaction.from_account &&
                    typeof transaction.from_account === "object"
                      ? (transaction.from_account as Record<string, unknown>)
                      : undefined
                  }
                  label="From Account"
                />
              </div>
              <div className="sm:col-span-2">
                <AccountInfo
                  account={
                    transaction.to_account &&
                    typeof transaction.to_account === "object"
                      ? (transaction.to_account as Record<string, unknown>)
                      : undefined
                  }
                  label="To Account"
                />
              </div>
              <DetailRow label="ID" value={getString(transaction, "id") || "—"} />
              <DetailRow
                label="User ID"
                value={getString(transaction, "user_id") || "—"}
              />
            </dl>
          ) : null}
        </div>

        <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
