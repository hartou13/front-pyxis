"use client";

import axios from "axios";
import { type FormEvent, useEffect, useState } from "react";
import { updateAccount } from "@/lib/accounts-api";

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

function parseMoveType(v: unknown): "income" | "expense" | "movement" {
  if (v === "income" || v === "expense" || v === "movement") return v;
  return "movement";
}

function parseAccountType(v: unknown): "external" | "personal" {
  if (v === "external" || v === "personal") return v;
  return "personal";
}

type Props = {
  open: boolean;
  onClose: () => void;
  account: Record<string, unknown> | null;
  accounts: Record<string, unknown>[];
  onUpdated: () => void;
};

export function EditAccountModal({
  open,
  onClose,
  account,
  accounts,
  onUpdated,
}: Props) {
  const [accountName, setAccountName] = useState("");
  const [moveType, setMoveType] = useState<
    "income" | "expense" | "movement"
  >("movement");
  const [accountType, setAccountType] = useState<"external" | "personal">(
    "personal",
  );
  const [superAccountId, setSuperAccountId] = useState<string | null >("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !account) return;
    setError(null);
    setAccountName(
      accountString(account, "account_name") ||
        accountString(account, "name") ||
        "",
    );
    setMoveType(parseMoveType(account.account_move_type));
    setAccountType(parseAccountType(account.account_type));
    const superId = accountString(account, "super_account_id");
    setSuperAccountId(superId ?? null);
  }, [open, account]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !account) return null;

  const editingId = accountId(account);
  if (!editingId) return null;

  const idForPut: string = editingId;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await updateAccount(idForPut, {
        account_name: accountName.trim(),
        account_move_type: moveType,
        account_type: accountType,
        super_account_id: superAccountId,
      });
      onUpdated();
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
        setError(typeof msg === "string" ? msg : "Could not update account.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Could not update account.");
      }
    } finally {
      setPending(false);
    }
  }

  const selectClass =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/30 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-500";

  const superOptions = accounts.filter((acc) => accountId(acc) !== idForPut);
  const superOptionIds = new Set(
    superOptions.map((acc) => accountId(acc)).filter(Boolean) as string[],
  );
  const orphanSuper =
    superAccountId &&
    !superOptionIds.has(superAccountId) ? superAccountId : null;

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
        aria-labelledby="edit-account-title"
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <h2
          id="edit-account-title"
          className="text-lg font-semibold text-slate-900 dark:text-slate-50"
        >
          Edit account
        </h2>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-account-name"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Account name
            </label>
            <input
              id="edit-account-name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              required
              autoComplete="off"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/30 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-50 dark:focus:border-slate-500"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-move-type"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Move type
            </label>
            <select
              id="edit-move-type"
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
              htmlFor="edit-account-type"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Account type
            </label>
            <select
              id="edit-account-type"
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
              htmlFor="edit-super-account"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Super account
            </label>
            <select
              id="edit-super-account"
              value={superAccountId ?? ""}
              onChange={(e) => setSuperAccountId(e.target.value)}
              className={selectClass}
            >
              <option value="">None</option>
              {orphanSuper ? (
                <option value={orphanSuper}>
                  {orphanSuper.slice(0, 8)}… (current)
                </option>
              ) : null}
              {superOptions.map((acc, i) => {
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
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending || !accountName.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
