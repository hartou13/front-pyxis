"use client";

import { useEffect } from "react";

function accountString(
  account: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = account[key];
  return typeof v === "string" ? v : undefined;
}

function accountId(account: Record<string, unknown>): string | undefined {
  const id = account.id;
  if (typeof id === "string" && id) return id;
  if (typeof id === "number") return String(id);
  return undefined;
}

function formatCharacteristicValue(
  key: string,
  value: unknown,
  accounts: Record<string, unknown>[],
): string {
  if (value === null || value === undefined) return "—";
  if (key === "super_account_id" && typeof value === "string" && value) {
    const parent = accounts.find((a) => accountId(a) === value);
    const label =
      parent &&
      (accountString(parent, "account_name") ||
        accountString(parent, "name") ||
        "");
    return label ? `${value} (${label})` : value;
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

type Props = {
  open: boolean;
  onClose: () => void;
  account: Record<string, unknown> | null;
  accounts: Record<string, unknown>[];
  onEditFromView: (account: Record<string, unknown>) => void;
};

export function ViewAccountModal({
  open,
  onClose,
  account,
  accounts,
  onEditFromView,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !account) return null;

  const title =
    accountString(account, "account_name") ||
    accountString(account, "name") ||
    "Account";

  const entries = Object.entries(account).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  const canEdit = Boolean(accountId(account));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-account-title"
        className="relative z-10 flex max-h-[min(90vh,36rem)] w-full max-w-lg flex-col rounded-2xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <h2
            id="view-account-title"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
          >
            {title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Account details
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <dl className="space-y-4">
            {entries.map(([key, value]) => (
              <div key={key}>
                <dt className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {key.replace(/_/g, " ")}
                </dt>
                <dd className="mt-1 whitespace-pre-wrap break-words text-sm text-zinc-900 dark:text-zinc-100">
                  {formatCharacteristicValue(key, value, accounts)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!canEdit}
            title={canEdit ? "Edit this account" : "Missing account id"}
            onClick={() => onEditFromView(account)}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
