"use client";

import axios from "axios";
import { type FormEvent, useEffect, useState } from "react";
import { createAccount } from "@/lib/accounts-api";

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

type Props = {
  open: boolean;
  onClose: () => void;
  accounts: Record<string, unknown>[];
  onCreated: () => void;
};

export function AddAccountModal({
  open,
  onClose,
  accounts,
  onCreated,
}: Props) {
  const [accountName, setAccountName] = useState("");
  const [moveType, setMoveType] = useState<
    "income" | "expense" | "movement"
  >("movement");
  const [accountType, setAccountType] = useState<"external" | "personal">(
    "personal",
  );
  const [superAccountId, setSuperAccountId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setAccountName("");
    setMoveType("movement");
    setAccountType("personal");
    const firstId = accounts.map(accountId).find(Boolean);
    setSuperAccountId(firstId ?? "");
  }, [open, accounts]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await createAccount({
        account_name: accountName.trim(),
        account_move_type: moveType,
        account_type: accountType,
        super_account_id: superAccountId,
      });
      onCreated();
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data &&
          typeof err.response.data === "object" &&
          "message" in err.response.data &&
          typeof (err.response.data as { message: unknown }).message ===
            "string"
            ? (err.response.data as { message: string }).message
            : err.response?.statusText || err.message;
        setError(typeof msg === "string" ? msg : "Could not create account.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not create account.");
      }
    } finally {
      setPending(false);
    }
  }

  const selectClass =
    "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500";

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
        aria-labelledby="add-account-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
      >
        <h2
          id="add-account-title"
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Add account
        </h2>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-account-name"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Account name
            </label>
            <input
              id="add-account-name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
              autoComplete="off"
              placeholder="subtest"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-move-type"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Move type
            </label>
            <select
              id="add-move-type"
              value={moveType}
              onChange={(e) =>
                setMoveType(e.target.value as "income" | "expense" | "movement")
              }
              className={selectClass}
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="movement">Movement</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-account-type"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Account type
            </label>
            <select
              id="add-account-type"
              value={accountType}
              onChange={(e) =>
                setAccountType(e.target.value as "external" | "personal")
              }
              className={selectClass}
            >
              <option value="external">External</option>
              <option value="personal">Personal</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="add-super-account"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Super account
            </label>
            <select
              id="add-super-account"
              value={superAccountId}
              onChange={(e) => setSuperAccountId(e.target.value)}
              className={selectClass}
            >
              <option value="">None</option>
              {accounts.map((acc, i) => {
                const id = accountId(acc);
                if (!id) return null;
                const label =
                  accountString(acc, "account_name") ||
                  accountString(acc, "name") ||
                  id;
                return (
                  <option key={id || i} value={id}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {error ? (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          ) : null}

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || !accountName.trim()}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {pending ? "Creating…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
