"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AddAccountModal } from "@/components/AddAccountModal";
import { EditAccountModal } from "@/components/EditAccountModal";
import {
  accountsResponseToList,
  deleteAccount,
  fetchAccounts,
} from "@/lib/accounts-api";

type MoveTypeFilter = "income" | "expense" | "movement";
type AccountTypeFilter = "external" | "personal";

function parseMoveTypeFilter(v: unknown): MoveTypeFilter | null {
  if (v === "income" || v === "expense" || v === "movement") return v;
  return null;
}

function parseAccountTypeFilter(v: unknown): AccountTypeFilter | null {
  if (v === "external" || v === "personal") return v;
  return null;
}

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

function moveTypeBorderClass(moveType: string | undefined): string {
  const v = moveType?.toLowerCase().trim();
  if (v === "income") return "border-l-emerald-500 dark:border-l-emerald-600";
  if (v === "expense") return "border-l-rose-500 dark:border-l-rose-600";
  if (v === "movement") return "border-l-sky-500 dark:border-l-sky-600";
  return "border-l-slate-300 dark:border-l-slate-700";
}

function getMoveTypePalette(
  value: string | undefined,
): { palette: string; label: string; Icon: React.FC<{ className?: string }> | null } {
  const v = value?.toLowerCase().trim();
  if (v === "income") {
    return {
      palette:
        "bg-emerald-100/60 text-emerald-900 ring-1 ring-emerald-300/50 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-800/60",
      label: "Income",
      Icon: IconIncome,
    };
  } else if (v === "expense") {
    return {
      palette:
        "bg-rose-100/60 text-rose-900 ring-1 ring-rose-300/50 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-800/60",
      label: "Expense",
      Icon: IconExpense,
    };
  } else if (v === "movement") {
    return {
      palette:
        "bg-sky-100/60 text-sky-900 ring-1 ring-sky-300/50 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-800/60",
      label: "Movement",
      Icon: IconMovement,
    };
  }
  return {
    palette:
      "bg-slate-100/60 text-slate-700 ring-1 ring-slate-300/50 dark:bg-slate-800/40 dark:text-slate-300 dark:ring-slate-700/60",
    label: value ?? "Unknown",
    Icon: null,
  };
}

function getAccountTypePalette(
  value: string | undefined,
): { palette: string; label: string; Icon: React.FC<{ className?: string }> } {
  const v = value?.toLowerCase().trim();
  if (v === "external") {
    return {
      palette:
        "bg-amber-100/60 text-amber-900 ring-1 ring-amber-300/50 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-800/60",
      label: "External",
      Icon: IconExternal,
    };
  } else if (v === "personal") {
    return {
      palette:
        "bg-indigo-100/60 text-indigo-900 ring-1 ring-indigo-300/50 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-800/60",
      label: "Personal",
      Icon: IconPersonal,
    };
  }
  return {
    palette:
      "bg-slate-100/60 text-slate-700 ring-1 ring-slate-300/50 dark:bg-slate-800/40 dark:text-slate-300 dark:ring-slate-700/60",
    label: "Unknown",
    Icon: IconPersonal,
  };
}

function MoveTypeChip({ value }: { value: string | undefined }) {
  const { palette, label, Icon } = getMoveTypePalette(value);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset transition-all duration-300 ease-out hover:shadow-md ${palette}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </span>
  );
}

function AccountTypeChip({ value }: { value: string | undefined }) {
  const { palette, label, Icon } = getAccountTypePalette(value);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset transition-all duration-300 ease-out hover:shadow-md ${palette}`}>
      {Icon && <Icon className="h-3 w-3" />}
      {label}
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
    <article
      className="group relative flex flex-col rounded-lg border border-slate-200/40 bg-white/80 backdrop-blur-sm px-2 py-2 elevation-2 transition-all duration-300 ease-out hover-lift dark:border-slate-700/40 dark:bg-slate-900/60 animate-slide-up overflow-hidden"
      style={{ animationDuration: '0.4s' }}
    >
      {/* Gradient accent bar - top */}
      <div className={`absolute top-0 left-0 h-1 rounded-tl-lg rounded-tr-lg w-full bg-gradient-to-r ${
        moveType?.toLowerCase() === "income"
          ? "from-emerald-400 to-teal-500"
          : moveType?.toLowerCase() === "expense"
          ? "from-rose-400 to-pink-500"
          : "from-sky-400 to-cyan-500"
      }`} />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-50 group-hover:text-primary transition-colors truncate">
            {name}
          </h4>
        </div>
        <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => rowId && onView(rowId)}
            disabled={!rowId}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-primary/10 hover:text-primary transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-primary/20 dark:hover:text-primary"
            aria-label="View details"
            title={rowId ? "View details" : "Missing account id"}
          >
            <IconEye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(account)}
            disabled={!rowId}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-amber-50 hover:text-amber-600 transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-amber-950/30 dark:hover:text-amber-400"
            aria-label="Edit account"
            title={rowId ? "Edit account" : "Missing account id"}
          >
            <IconPencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(account)}
            disabled={!rowId}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
            aria-label="Delete account"
            title={rowId ? "Delete account" : "Missing account id"}
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <MoveTypeChip value={moveType} />
        <AccountTypeChip value={accType} />
      </div>
    </article>
  );
}

function AccountsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  const moveTypeFilter = parseMoveTypeFilter(searchParams.get("account_move_type"));
  const accountTypeFilter = parseAccountTypeFilter(searchParams.get("account_type"));

  function setFilter(key: "account_move_type" | "account_type", value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    const qs = next.toString();
    router.push(qs ? `/accounts?${qs}` : "/accounts", { scroll: false });
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchAccounts({
        account_move_type: moveTypeFilter ?? undefined,
        account_type: accountTypeFilter ?? undefined,
      });
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
  }, [moveTypeFilter, accountTypeFilter]);

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
    <div className="flex min-h-full flex-1 flex-col gap-4 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/30 px-4 py-4 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
      <div className="flex flex-wrap items-end justify-between gap-3 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            💰 Accounts
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Manage all your accounts in one place
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5 dark:from-teal-600 dark:to-teal-700 dark:hover:from-teal-700 dark:hover:to-teal-800"
          >
            + Add Account
          </button>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-slate-900 transition-all duration-300 ease-out hover:bg-slate-50 hover:shadow-md disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            {loading ? "⟳ Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      <section aria-label="Filter accounts" className="flex flex-col gap-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Transaction Type
          </span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by move type">
            {[
              { value: null, label: "All" },
              { value: "income", label: "Income", Icon: IconIncome, color: "emerald" },
              { value: "expense", label: "Expense", Icon: IconExpense, color: "rose" },
              { value: "movement", label: "Movement", Icon: IconMovement, color: "sky" },
            ].map((pill, idx) => {
              const isActive = moveTypeFilter === pill.value;
              const inactivePalette = "bg-white/60 text-slate-600 ring-1 ring-slate-200/60 hover:bg-slate-50 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700/60 dark:hover:bg-slate-800";
              const activePalette = pill.value === null
                ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white ring-slate-900 shadow-lg dark:from-slate-100 dark:to-slate-200 dark:text-slate-900 dark:ring-slate-100"
                : pill.color === "income"
                  ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900 ring-emerald-300/50 shadow-md dark:from-emerald-950/50 dark:to-teal-950/50 dark:text-emerald-300 dark:ring-emerald-700/60"
                  : pill.color === "expense"
                    ? "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-900 ring-rose-300/50 shadow-md dark:from-rose-950/50 dark:to-pink-950/50 dark:text-rose-300 dark:ring-rose-700/60"
                    : "bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-900 ring-sky-300/50 shadow-md dark:from-sky-950/50 dark:to-cyan-950/50 dark:text-sky-300 dark:ring-sky-700/60";

              return (
                <button
                  key={pill.value ?? "all"}
                  type="button"
                  onClick={() => setFilter("account_move_type", pill.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-all duration-300 ease-out hover:shadow-md ${isActive ? activePalette : inactivePalette}`}
                  aria-pressed={isActive}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {"Icon" in pill && pill.Icon && <pill.Icon className="h-3 w-3" />}
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            Account Type
          </span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by account type">
            {[
              { value: null, label: "All" },
              { value: "external", label: "External", Icon: IconExternal, color: "amber" },
              { value: "personal", label: "Personal", Icon: IconPersonal, color: "indigo" },
            ].map((pill, idx) => {
              const isActive = accountTypeFilter === pill.value;
              const inactivePalette = "bg-white/60 text-slate-600 ring-1 ring-slate-200/60 hover:bg-slate-50 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700/60 dark:hover:bg-slate-800";
              const activePalette = pill.value === null
                ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white ring-slate-900 shadow-lg dark:from-slate-100 dark:to-slate-200 dark:text-slate-900 dark:ring-slate-100"
                : pill.color === "amber"
                  ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-900 ring-amber-300/50 shadow-md dark:from-amber-950/50 dark:to-yellow-950/50 dark:text-amber-300 dark:ring-amber-700/60"
                  : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-900 ring-indigo-300/50 shadow-md dark:from-indigo-950/50 dark:to-purple-950/50 dark:text-indigo-300 dark:ring-indigo-700/60";

              return (
                <button
                  key={pill.value ?? "all"}
                  type="button"
                  onClick={() => setFilter("account_type", pill.value)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset transition-all duration-300 ease-out hover:shadow-md ${isActive ? activePalette : inactivePalette}`}
                  aria-pressed={isActive}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {"Icon" in pill && pill.Icon && <pill.Icon className="h-3 w-3" />}
                  {pill.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

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
        <div className="rounded-lg border border-rose-300/50 bg-gradient-to-r from-rose-50 to-rose-50/50 px-4 py-2 text-sm text-rose-900 dark:border-rose-900/50 dark:from-rose-950/30 dark:to-rose-950/20 dark:text-rose-200 elevation-1 animate-slide-up">
          <div className="flex items-start gap-2">
            <span className="text-lg">⚠</span>
            <div>{error}</div>
          </div>
        </div>
      ) : null}

      {loading && accounts === null ? (
        <div className="space-y-2 animate-fade-in">
          <div className="h-16 rounded-lg bg-gradient-to-br from-slate-200/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50 animate-shimmer"></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg bg-gradient-to-br from-slate-200/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50 animate-shimmer"></div>
            ))}
          </div>
        </div>
      ) : null}

      {!loading && accounts && accounts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-8 text-center animate-fade-in">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {moveTypeFilter || accountTypeFilter ? "No accounts match your filters" : "No accounts yet"}
          </p>
          {!moveTypeFilter && !accountTypeFilter && (
            <button
              onClick={() => setAddOpen(true)}
              className="mt-3 inline-block rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5"
            >
              Create Your First Account
            </button>
          )}
        </div>
      ) : null}

      {accounts && accounts.length > 0 ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 stagger-items">
          {accounts.map((account) => (
            <AccountCard
              key={
                (typeof account.id === "string" && account.id) ||
                `account-${Math.random()}`
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

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 flex-col gap-3 bg-slate-50 px-4 py-4 dark:bg-slate-950">
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading…</p>
        </div>
      }
    >
      <AccountsContent />
    </Suspense>
  );
}
