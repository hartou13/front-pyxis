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
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="text-sm text-slate-900 dark:text-slate-100">{value}</dd>
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

  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </dt>
      <dd className="flex flex-col gap-1 text-sm text-slate-900 dark:text-slate-100">
        <span>{name}</span>
      </dd>
    </div>
  );
}

export function ViewMoveModal({
  open,
  moveId,
  onClose,
}: {
  open: boolean;
  moveId: string | undefined;
  onClose: () => void;
}) {
  const [move, setMove] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !moveId) {
      setMove(null);
      setError(null);
      return;
    }

    const loadMove = async () => {
      setLoading(true);
      setError(null);
      try {
        const raw = await fetchTransaction(moveId);
        if (raw && typeof raw === "object") {
          setMove(raw as Record<string, unknown>);
        } else {
          setError("Invalid move data");
        }
      } catch (err) {
        let msg = "Failed to load move.";
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
        setLoading(false);
      }
    };

    void loadMove();
  }, [open, moveId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            Move Details
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

        <div className="px-6 py-4">
          {loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading move details…
            </p>
          ) : error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          ) : move ? (
            <dl className="space-y-4">
              <DetailRow
                label="Description"
                value={getString(move, "description") || "—"}
              />
              <DetailRow
                label="Amount"
                value={formatCurrency(getNumber(move, "amount"))}
              />
              <DetailRow
                label="Date"
                value={formatDate(getString(move, "date"))}
              />
              <AccountInfo
                label="From Account"
                account={
                  move.from_account && typeof move.from_account === "object"
                    ? (move.from_account as Record<string, unknown>)
                    : undefined
                }
              />
              <AccountInfo
                label="To Account"
                account={
                  move.to_account && typeof move.to_account === "object"
                    ? (move.to_account as Record<string, unknown>)
                    : undefined
                }
              />
              <DetailRow
                label="Detail"
                value={getString(move, "detail") || "—"}
              />
              <DetailRow label="Move ID" value={getString(move, "id") || "—"} />
            </dl>
          ) : null}
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
