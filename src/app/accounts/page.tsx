"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AddAccountModal } from "@/components/AddAccountModal";
import { EditAccountModal } from "@/components/EditAccountModal";
import {
  accountsResponseToList,
  deleteAccount,
  fetchAccounts,
} from "@/lib/accounts-api";

function accountString(
  account: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = account[key];
  return typeof v === "string" ? v : undefined;
}

function IconIncome({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  );
}

function IconExpense({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.508 5.684 6.07 6.07 0 0 1 1.49 8.153c1.87-1.13 3.31-3.01 3.31-5.307 0-3.45-2.805-6.25-6.25-6.25S6.75 8.505 6.75 12c0 .996.232 1.935.649 2.773-.67.45-1.39.82-2.149 1.09" />
    </svg>
  );
}

function IconMovement({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  );
}

function IconExternal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function IconPersonal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );
}

function IconPencil({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function IconUnknown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
  );
}

function MoveTypeBadge({ value }: { value: string | undefined }) {
  const v = value?.toLowerCase().trim();
  let Icon = IconUnknown;
  let label = value ?? "Unknown";
  let palette =
    "bg-slate-100 text-slate-700 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600/50";
  if (v === "income") {
    Icon = IconIncome;
    label = "Income";
    palette =
      "bg-emerald-100 text-emerald-800 ring-emerald-200/90 dark:bg-emerald-950/55 dark:text-emerald-300 dark:ring-emerald-700/50";
  } else if (v === "expense") {
    Icon = IconExpense;
    label = "Expense";
    palette =
      "bg-rose-100 text-rose-800 ring-rose-200/90 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-800/50";
  } else if (v === "movement") {
    Icon = IconMovement;
    label = "Movement";
    palette =
      "bg-sky-100 text-sky-800 ring-sky-200/90 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-700/50";
  }
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset ${palette}`}
      title={`Move type: ${label}`}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Move type: {label}</span>
    </span>
  );
}

function AccountTypeBadge({ value }: { value: string | undefined }) {
  const v = value?.toLowerCase().trim();
  let Icon = IconUnknown;
  let label = value ?? "Unknown";
  let palette =
    "bg-slate-100 text-slate-700 ring-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-600/50";
  if (v === "external") {
    Icon = IconExternal;
    label = "External";
    palette =
      "bg-amber-100 text-amber-900 ring-amber-200/90 dark:bg-amber-950/45 dark:text-amber-300 dark:ring-amber-800/45";
  } else if (v === "personal") {
    Icon = IconPersonal;
    label = "Personal";
    palette =
      "bg-violet-100 text-violet-800 ring-violet-200/90 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-700/50";
  }
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ring-1 ring-inset ${palette}`}
      title={`Account type: ${label}`}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Account type: {label}</span>
    </span>
  );
}

function accountRowId(account: Record<string, unknown>): string | undefined {
  if (typeof account.id === "string") return account.id;
  if (typeof account.id === "number") return String(account.id);
  return undefined;
}

function AccountCard({
  account,
  onView,
  onEdit,
  onDelete,
}: {
  account: Record<string, unknown>;
  onView: (id: string) => void;
  onEdit: (account: Record<string, unknown>) => void;
  onDelete: (account: Record<string, unknown>) => void;
}) {
  const name =
    accountString(account, "account_name") ||
    accountString(account, "name") ||
    "Unnamed account";

  const moveType = accountString(account, "account_move_type");
  const accType = accountString(account, "account_type");
  const rowId = accountRowId(account);

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {name}
        </h2>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={() => rowId && onView(rowId)}
            disabled={!rowId}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="View details"
            title={rowId ? "View details" : "Missing account id"}
          >
            <IconEye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(account)}
            disabled={!rowId}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            aria-label="Edit account"
            title={rowId ? "Edit account" : "Missing account id"}
          >
            <IconPencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(account)}
            disabled={!rowId}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
            aria-label="Delete account"
            title={rowId ? "Delete account" : "Missing account id"}
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <MoveTypeBadge value={moveType} />
        <AccountTypeBadge value={accType} />
      </div>
    </article>
  );
}

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Record<string, unknown>[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Record<
    string,
    unknown
  > | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchAccounts();
      setAccounts(accountsResponseToList(raw));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data &&
          typeof err.response.data === "object" &&
          "message" in err.response.data &&
          typeof (err.response.data as { message: unknown }).message === "string"
            ? (err.response.data as { message: string }).message
            : err.response?.statusText || err.message;
        setError(typeof msg === "string" ? msg : "Failed to load accounts.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load accounts.");
      }
      setAccounts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDeleteAccount = useCallback(
    async (account: Record<string, unknown>) => {
      const id = accountRowId(account);
      if (!id) return;
      const label =
        accountString(account, "account_name") ||
        accountString(account, "name") ||
        id;
      if (
        !window.confirm(
          `Delete account "${label}"? This cannot be undone.`,
        )
      ) {
        return;
      }
      try {
        await deleteAccount(id);
        setEditAccount((e) => (e && accountRowId(e) === id ? null : e));
        await load();
      } catch (err) {
        let msg = "Could not delete account.";
        if (axios.isAxiosError(err)) {
          const raw =
            err.response?.data &&
            typeof err.response.data === "object" &&
            "message" in err.response.data &&
            typeof (err.response.data as { message: unknown }).message ===
              "string"
              ? (err.response.data as { message: string }).message
              : err.response?.statusText || err.message;
          if (typeof raw === "string") msg = raw;
        } else if (err instanceof Error) {
          msg = err.message;
        }
        window.alert(msg);
      }
    },
    [load],
  );

  return (
    <div className="flex min-h-full flex-1 flex-col gap-6 bg-slate-50 px-6 py-8 dark:bg-slate-950">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Accounts
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Accounts from your Pyxis workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <AddAccountModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        accounts={accounts ?? []}
        onCreated={() => void load()}
      />

      <EditAccountModal
        open={editAccount !== null}
        onClose={() => setEditAccount(null)}
        account={editAccount}
        accounts={accounts ?? []}
        onUpdated={() => void load()}
      />

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading && accounts === null ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading accounts…</p>
      ) : null}

      {!loading && accounts && accounts.length === 0 ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          No accounts returned.
        </p>
      ) : null}

      {accounts && accounts.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account, index) => (
            <AccountCard
              key={
                (typeof account.id === "string" && account.id) ||
                `account-${index}`
              }
              account={account}
              onView={(id) => router.push(`/account/${id}`)}
              onEdit={setEditAccount}
              onDelete={handleDeleteAccount}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
