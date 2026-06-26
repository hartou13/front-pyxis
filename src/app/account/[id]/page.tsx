"use client";

import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { EditAccountModal } from "@/components/EditAccountModal";
import { DeleteAccountModal } from "@/components/DeleteAccountModal";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { EditTransactionModal } from "@/components/EditTransactionModal";
import { DeleteMoveModal } from "@/components/DeleteMoveModal";
import { ViewMoveModal } from "@/components/ViewMoveModal";
import { AccountMoveHistoryTable } from "@/components/AccountMoveHistoryTable";
import { fetchAccount, fetchAccountMoveHistory, fetchAccountSolde, fetchAccountTendency, fetchAccountWeekTendency, fetchAccountDayTendency, deleteAccount } from "@/lib/accounts-api";
import { transactionsResponseToList } from "@/lib/transactions-api";

function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
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

function IconUnknown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
  );
}

function MoveTypeIcon({ value }: { value: string | undefined }) {
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
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-inset ${palette}`}
      title={`Move type: ${label}`}
    >
      <Icon className="h-5 w-5" />
      <span className="sr-only">Move type: {label}</span>
    </span>
  );
}

function AccountTypeIcon({ value }: { value: string | undefined }) {
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
      className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-inset ${palette}`}
      title={`Account type: ${label}`}
    >
      <Icon className="h-5 w-5" />
      <span className="sr-only">Account type: {label}</span>
    </span>
  );
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function formatCurrency(amount: number | undefined | null): string {
  if (typeof amount === "number") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return "—";
}

interface Account extends Record<string, unknown> {
  id: string;
  user_id: string;
  super_account_id: string | null;
  created_at: string;
  updated_at: string;
  account_name: string;
  account_move_type: string;
  account_type: string;
  super_account: unknown;
  sub_accounts: Account[];
}

interface MonthlyTendency {
  year: number;
  month: number;
  balance: number;
}

interface WeeklyTendency {
  monday: string;
  balance: number;
}

interface DailyTendency {
  date: string;
  balance: number;
}

type TendencyView = "monthly" | "weekly" | "daily";

export default function AccountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const accountId = typeof params.id === "string" ? params.id : "";

  const [account, setAccount] = useState<Account | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteAccount_, setDeleteAccount] = useState(false);
  const [addMoveOpen, setAddMoveOpen] = useState(false);

  // Move history state
  const [moveHistory, setMoveHistory] = useState<Record<string, unknown>[] | null>(null);
  const [moveHistoryError, setMoveHistoryError] = useState<string | null>(null);
  const [moveHistoryLoading, setMoveHistoryLoading] = useState(false);
  const [moveHistoryPage, setMoveHistoryPage] = useState(1);
  const [moveHistoryPageSize, setMoveHistoryPageSize] = useState(10);
  const [moveHistoryTotal, setMoveHistoryTotal] = useState(0);

  // Solde state
  const [solde, setSolde] = useState<number | null>(null);
  const [soldeError, setSoldeError] = useState<string | null>(null);
  const [soldeLoading, setSoldeLoading] = useState(false);

  // Tendency state
  const [tendencyView, setTendencyView] = useState<TendencyView>("monthly");
  const [monthlyData, setMonthlyData] = useState<MonthlyTendency[] | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyTendency[] | null>(null);
  const [dailyData, setDailyData] = useState<DailyTendency[] | null>(null);
  const [tendencyLoading, setTendencyLoading] = useState(false);
  const [tendencyError, setTendencyError] = useState<string | null>(null);

  // Move action states
  const [viewMoveId, setViewMoveId] = useState<string | undefined>(undefined);
  const [editMove, setEditMove] = useState<Record<string, unknown> | null>(null);
  const [deleteMove, setDeleteMove] = useState<Record<string, unknown> | null>(null);

  const load = useCallback(async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchAccount(accountId);
      if (raw && typeof raw === "object") {
        setAccount(raw as Account);
      } else {
        setError("Invalid account data");
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
        setError(typeof msg === "string" ? msg : "Failed to load account.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load account.");
      }
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  const loadMoveHistory = useCallback(
    async (page: number = 1, limit: number = 10) => {
      if (!accountId) return;
      setMoveHistoryLoading(true);
      setMoveHistoryError(null);
      try {
        const raw = await fetchAccountMoveHistory(accountId, page, limit);
        setMoveHistory(transactionsResponseToList(raw));
        setMoveHistoryPage(page);
        setMoveHistoryPageSize(limit);

        // Extract pagination metadata if available
        if (raw && typeof raw === "object") {
          const o = raw as Record<string, unknown>;
          // Check for pagination object first
          if (o.pagination && typeof o.pagination === "object") {
            const p = o.pagination as Record<string, unknown>;
            if (typeof p.total === "number") {
              setMoveHistoryTotal(p.total);
            }
            if (typeof p.pageSize === "number") {
              setMoveHistoryPageSize(p.pageSize);
            }
          } else {
            // Fallback to top-level properties
            if (typeof o.total === "number") {
              setMoveHistoryTotal(o.total);
            }
            if (typeof o.pageSize === "number") {
              setMoveHistoryPageSize(o.pageSize);
            }
          }
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
          setMoveHistoryError(typeof msg === "string" ? msg : "Failed to load move history.");
        } else if (err instanceof Error) {
          setMoveHistoryError(err.message);
        } else {
          setMoveHistoryError("Failed to load move history.");
        }
        setMoveHistory(null);
      } finally {
        setMoveHistoryLoading(false);
      }
    },
    [accountId],
  );

  const loadSolde = useCallback(async () => {
    if (!accountId) return;
    setSoldeLoading(true);
    setSoldeError(null);
    try {
      const raw = await fetchAccountSolde(accountId);
      if (raw && typeof raw === "object") {
        const o = raw as Record<string, unknown>;
        if (typeof o.remaining === "number") {
          setSolde(o.remaining);
        } else {
          setSoldeError("Invalid solde data");
        }
      } else {
        setSoldeError("Invalid solde data");
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
        setSoldeError(typeof msg === "string" ? msg : "Failed to load balance.");
      } else if (err instanceof Error) {
        setSoldeError(err.message);
      } else {
        setSoldeError("Failed to load balance.");
      }
      setSolde(null);
    } finally {
      setSoldeLoading(false);
    }
  }, [accountId]);

  const loadTendencies = useCallback(async () => {
    if (!accountId || !account) return;
    setTendencyLoading(true);
    setTendencyError(null);
    try {
      const [monthlyRaw, weeklyRaw, dailyRaw] = await Promise.all([
        fetchAccountTendency(accountId),
        fetchAccountWeekTendency(accountId),
        fetchAccountDayTendency(accountId),
      ]);

      const isIncome = account.account_move_type?.toLowerCase() === "income";
      const multiplier = isIncome ? -1 : 1;

      // Process monthly data
      if (Array.isArray(monthlyRaw)) {
        setMonthlyData(
          monthlyRaw
            .filter((x): x is MonthlyTendency =>
              !!x && typeof x === "object" && "year" in x && "month" in x && "balance" in x
            )
            .map((item) => ({ ...item, balance: item.balance * multiplier }))
        );
      }

      // Process weekly data
      if (Array.isArray(weeklyRaw)) {
        setWeeklyData(
          weeklyRaw
            .filter((x): x is WeeklyTendency =>
              !!x && typeof x === "object" && "monday" in x && "balance" in x
            )
            .map((item) => ({ ...item, balance: item.balance * multiplier }))
        );
      }

      // Process daily data
      if (Array.isArray(dailyRaw)) {
        setDailyData(
          dailyRaw
            .filter((x): x is DailyTendency =>
              !!x && typeof x === "object" && "date" in x && "balance" in x
            )
            .map((item) => ({ ...item, balance: item.balance * multiplier }))
        );
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
        setTendencyError(typeof msg === "string" ? msg : "Failed to load balance tendency.");
      } else if (err instanceof Error) {
        setTendencyError(err.message);
      } else {
        setTendencyError("Failed to load balance tendency.");
      }
      setMonthlyData(null);
      setWeeklyData(null);
      setDailyData(null);
    } finally {
      setTendencyLoading(false);
    }
  }, [accountId, account]);

  const handleDeleteAccount = useCallback(async () => {
    if (!accountId) return;
    const accountName = account?.account_name || accountId;
    if (!window.confirm(`Delete account "${accountName}"? This cannot be undone.`)) {
      setDeleteAccount(false);
      return;
    }
    try {
      await deleteAccount(accountId);
      setDeleteAccount(false);
      router.push("/accounts");
    } catch (err) {
      let msg = "Could not delete account.";
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
      window.alert(msg);
    }
  }, [accountId, account?.account_name, router]);

  // Load account and move history on mount
  useEffect(() => {
    void load();
    void loadMoveHistory(1, 10);
  }, [load, loadMoveHistory]);

  // Load solde or tendencies when account loads
  useEffect(() => {
    if (!account) return;
    if (account.account_move_type?.toLowerCase() === "movement") {
      void loadSolde();
    } else {
      void loadTendencies();
    }
  }, [account?.id, account?.account_move_type, loadSolde, loadTendencies]);

  if (loading && !account) {
    return (
      <div className="flex min-h-full flex-1 flex-col gap-6 bg-slate-50 px-6 py-8 dark:bg-slate-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading account…</p>
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="flex min-h-full flex-1 flex-col gap-6 bg-slate-50 px-6 py-8 dark:bg-slate-950">
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">Account not found.</p>
        )}
        <button
          type="button"
          onClick={() => router.back()}
          className="w-fit rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  const accountName =
    getString(account, "account_name") ||
    getString(account, "name") ||
    "Unnamed account";
  const moveType = getString(account, "account_move_type");
  const accType = getString(account, "account_type");
  const subAccounts = Array.isArray(account.sub_accounts)
    ? account.sub_accounts.filter((x): x is Account => !!x && typeof x === "object")
    : [];

  return (
    <div className="flex min-h-full flex-1 flex-col gap-6 bg-slate-50 px-6 py-8 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            aria-label="Go back"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            {accountName}
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteAccount(true)}
            className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-600 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            Delete
          </button>
        </div>
      </div>

      <EditAccountModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        account={account}
        accounts={[]}
        onUpdated={() => {
          setEditOpen(false);
          void load();
        }}
      />

      <DeleteAccountModal
        open={deleteAccount_}
        onClose={() => setDeleteAccount(false)}
        account={account}
        onDeleted={handleDeleteAccount}
      />

      <ViewMoveModal
        open={viewMoveId !== undefined}
        moveId={viewMoveId}
        onClose={() => setViewMoveId(undefined)}
      />

      <DeleteMoveModal
        open={deleteMove !== null}
        move={deleteMove}
        onClose={() => setDeleteMove(null)}
        onDeleted={() => {
          void loadMoveHistory(moveHistoryPage, moveHistoryPageSize);
          if (account?.account_move_type?.toLowerCase() === "movement") {
            void loadSolde();
          } else {
            void loadTendencies();
          }
        }}
      />

      <AddTransactionModal
        open={addMoveOpen}
        onClose={() => setAddMoveOpen(false)}
        onCreated={() => {
          void loadMoveHistory(moveHistoryPage, moveHistoryPageSize);
          void loadSolde();
        }}
      />

      <EditTransactionModal
        open={editMove !== null}
        transaction={editMove as Record<string, unknown> | undefined}
        onClose={() => setEditMove(null)}
        onUpdated={() => {
          void loadMoveHistory(moveHistoryPage, moveHistoryPageSize);
          if (account?.account_move_type?.toLowerCase() === "movement") {
            void loadSolde();
          } else {
            void loadTendencies();
          }
        }}
      />

      <div className="rounded-lg border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Account ID</p>
            <p className="mt-1 text-lg text-slate-900 dark:text-slate-100 font-mono text-xs break-all">
              {account.id}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">User ID</p>
            <p className="mt-1 text-lg text-slate-900 dark:text-slate-100 font-mono text-xs break-all">
              {account.user_id}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Move Type</p>
            <div className="mt-2">
              <MoveTypeIcon value={moveType} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Account Type</p>
            <div className="mt-2">
              <AccountTypeIcon value={accType} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Created At</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
              {formatDate(account.created_at)}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Updated At</p>
            <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
              {formatDate(account.updated_at)}
            </p>
          </div>

          {account.super_account_id && (
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Super Account ID</p>
              <p className="mt-1 text-sm text-slate-900 dark:text-slate-100 font-mono text-xs break-all">
                {account.super_account_id}
              </p>
            </div>
          )}
        </div>
      </div>

      {subAccounts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 mb-4">
            Sub-Accounts
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {subAccounts.map((subAccount) => {
              const subName =
                getString(subAccount, "account_name") ||
                getString(subAccount, "name") ||
                "Unnamed account";
              const subMoveType = getString(subAccount, "account_move_type");
              const subAccType = getString(subAccount, "account_type");

              return (
                <div
                  key={subAccount.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex gap-2">
                    <MoveTypeIcon value={subMoveType} />
                    <AccountTypeIcon value={subAccType} />
                  </div>
                  <p className="min-w-0 flex-1 text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {subName}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subAccounts.length === 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-400">No sub-accounts.</p>
      )}

      {moveType?.toLowerCase() === "movement" ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Balance</p>
          {soldeError ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{soldeError}</p>
          ) : soldeLoading ? (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Loading balance…</p>
          ) : solde !== null ? (
            <p
              className={`mt-2 text-3xl font-semibold ${
                solde >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(solde)}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">Balance Tendency</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTendencyView("monthly")}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  tendencyView === "monthly"
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setTendencyView("weekly")}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  tendencyView === "weekly"
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setTendencyView("daily")}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
                  tendencyView === "daily"
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                Daily
              </button>
            </div>
          </div>

          {tendencyError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{tendencyError}</p>
          ) : tendencyLoading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading balance tendency…</p>
          ) : tendencyView === "monthly" && monthlyData && monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(month) => {
                    const d = new Date(monthlyData[0].year, month - 1);
                    return d.toLocaleDateString("en-US", { month: "short" });
                  }}
                  stroke="#71717a"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#71717a"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => {
                    if (value === 0) return "0";
                    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value.toFixed(0);
                  }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.95)",
                    border: "1px solid rgba(113, 113, 122, 0.5)",
                    borderRadius: "8px",
                    color: "#fafafa",
                  }}
                />
                <Line type="monotone" dataKey="balance" stroke="#6366f1" dot={{ fill: "#6366f1", r: 4 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : tendencyView === "weekly" && weeklyData && weeklyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis
                  dataKey="monday"
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }}
                  stroke="#71717a"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#71717a"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => {
                    if (value === 0) return "0";
                    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value.toFixed(0);
                  }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.95)",
                    border: "1px solid rgba(113, 113, 122, 0.5)",
                    borderRadius: "8px",
                    color: "#fafafa",
                  }}
                />
                <Line type="monotone" dataKey="balance" stroke="#6366f1" dot={{ fill: "#6366f1", r: 4 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : tendencyView === "daily" && dailyData && dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }}
                  stroke="#71717a"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#71717a"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => {
                    if (value === 0) return "0";
                    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value.toFixed(0);
                  }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: "rgba(24, 24, 27, 0.95)",
                    border: "1px solid rgba(113, 113, 122, 0.5)",
                    borderRadius: "8px",
                    color: "#fafafa",
                  }}
                />
                <Line type="monotone" dataKey="balance" stroke="#6366f1" dot={{ fill: "#6366f1", r: 4 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">No balance data available.</p>
          )}
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Move History
          </h2>
          <button
            type="button"
            onClick={() => setAddMoveOpen(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Add Move
          </button>
        </div>

        {moveHistoryError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {moveHistoryError}
          </p>
        ) : null}

        {moveHistoryLoading && moveHistory === null ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading move history…
          </p>
        ) : null}

        {!moveHistoryLoading && moveHistory && moveHistory.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No moves found.
          </p>
        ) : null}

        <AccountMoveHistoryTable
          moves={moveHistory}
          currentAccountId={accountId}
          currentPage={moveHistoryPage}
          pageSize={moveHistoryPageSize}
          total={moveHistoryTotal}
          loading={moveHistoryLoading}
          onPageChange={(page) => void loadMoveHistory(page, moveHistoryPageSize)}
          onPageSizeChange={(limit) => void loadMoveHistory(1, limit)}
          onViewMove={setViewMoveId}
          onEditMove={setEditMove}
          onDeleteMove={setDeleteMove}
        />
      </div>
    </div>
  );
}
