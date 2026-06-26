"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { getSession } from "@/lib/session";
import { fetchSoldeEvolution } from "@/lib/accounts-api";

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

function IconPersonal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
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

function IconUnknown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
    </svg>
  );
}

function IconTrendUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12zm8.5-5a1.5 1.5 0 0 1 3 0v3.793l1.646-1.647a1.5 1.5 0 1 1 2.12 2.121l-5 5a1.5 1.5 0 0 1-2.121 0l-5-5a1.5 1.5 0 1 1 2.12-2.121L10.5 10.793V7z" />
    </svg>
  );
}

function IconTrendDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12zm8.5 5a1.5 1.5 0 0 1-3 0v-3.793l-1.646 1.647a1.5 1.5 0 1 1-2.12-2.121l5-5a1.5 1.5 0 0 1 2.121 0l5 5a1.5 1.5 0 1 1-2.12 2.121L10.5 13.207V17z" />
    </svg>
  );
}

function IconTrendFlat({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 12c0 5.523 4.477 10 10 10s10-4.477 10-10S17.523 2 12 2 2 6.477 2 12zm3-1.5a1.5 1.5 0 0 1 3 0 1.5 1.5 0 0 1-3 0zm5 0a1.5 1.5 0 0 1 3 0 1.5 1.5 0 0 1-3 0zm5 0a1.5 1.5 0 0 1 3 0 1.5 1.5 0 0 1-3 0z" />
    </svg>
  );
}

function AccountTypeBadge({ value }: { value: string | undefined }) {
  const v = value?.toLowerCase().trim();
  let Icon = IconUnknown;
  let label = value ?? "Unknown";
  let palette = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  if (v === "external") {
    Icon = IconExternal;
    label = "External";
    palette = "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
  } else if (v === "personal") {
    Icon = IconPersonal;
    label = "Personal";
    palette = "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300";
  }
  return (
    <span
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${palette}`}
      title={`Account type: ${label}`}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">Account type: {label}</span>
    </span>
  );
}

function TrendIndicator({ value }: { value: number | undefined }) {
  if (value === undefined || value === 0) {
    return (
      <div className="flex items-center gap-1">
        <IconTrendFlat className="h-4 w-4 text-slate-400 dark:text-slate-500" />
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Stable</span>
      </div>
    );
  }
  if (value > 0) {
    return (
      <div className="flex items-center gap-1">
        <IconTrendUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">+{formatCurrency(value)}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <IconTrendDown className="h-4 w-4 text-rose-600 dark:text-rose-400" />
      <span className="text-xs font-medium text-rose-600 dark:text-rose-400">{formatCurrency(value)}</span>
    </div>
  );
}

interface AccountBalance {
  account_name: string;
  account_type: string;
  id: string;
  solde: {
    remaining: number;
  } | null;
}

interface EvolutionAccount {
  id: string;
  super_account_id: string | null;
  account_name: string;
  account_move_type: string;
  account_type: string;
  solde: {
    id: string;
    account_name: string;
    account_move_type: string;
    balance: number;
  };
}

interface SoldeEvolution {
  income: EvolutionAccount[];
  expense: EvolutionAccount[];
  movement: EvolutionAccount[];
}

export default function WelcomePage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountBalance[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Evolution filters and data
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [evolution, setEvolution] = useState<SoldeEvolution | null>(null);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);
  const [evolutionLoading, setEvolutionLoading] = useState(false);

  // Get end date as tomorrow
  const getEndDate = (): string => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  const loadBalances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }
      const { data } = await apiClient.get(`/solde`, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      setAccounts(
        Array.isArray(data)
          ? data.filter((x): x is AccountBalance => !!x && typeof x === "object")
          : []
      );
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data &&
            typeof err.response.data === "object" &&
            "message" in err.response.data &&
            typeof (err.response.data as { message: unknown }).message === "string"
            ? (err.response.data as { message: string }).message
            : err.response?.statusText || err.message;
        setError(typeof msg === "string" ? msg : "Failed to load balances.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load balances.");
      }
      setAccounts(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEvolution = useCallback(async () => {
    setEvolutionLoading(true);
    setEvolutionError(null);
    try {
      const startISO = `${startDate}T00:00`;
      const endISO = `${getEndDate()}T00:00`;
      const data = await fetchSoldeEvolution(startISO, endISO);
      if (data && typeof data === "object") {
        const evo = data as Record<string, unknown>;
        setEvolution({
          income: Array.isArray(evo.income)
            ? evo.income.filter((x): x is EvolutionAccount => !!x && typeof x === "object")
            : [],
          expense: Array.isArray(evo.expense)
            ? evo.expense.filter((x): x is EvolutionAccount => !!x && typeof x === "object")
            : [],
          movement: Array.isArray(evo.movement)
            ? evo.movement.filter((x): x is EvolutionAccount => !!x && typeof x === "object")
            : [],
        });
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
        setEvolutionError(typeof msg === "string" ? msg : "Failed to load evolution data.");
      } else if (err instanceof Error) {
        setEvolutionError(err.message);
      } else {
        setEvolutionError("Failed to load evolution data.");
      }
      setEvolution(null);
    } finally {
      setEvolutionLoading(false);
    }
  }, [startDate]);

  const refreshSolde = useCallback(async () => {
    setRefreshing(true);
    setRefreshError(null);
    try {
      const session = getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }
      await apiClient.post(`/solde/refresh`, {}, {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      await loadBalances();
      await loadEvolution();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data &&
            typeof err.response.data === "object" &&
            "message" in err.response.data &&
            typeof (err.response.data as { message: unknown }).message === "string"
            ? (err.response.data as { message: string }).message
            : err.response?.statusText || err.message;
        setRefreshError(typeof msg === "string" ? msg : "Failed to refresh balance.");
      } else if (err instanceof Error) {
        setRefreshError(err.message);
      } else {
        setRefreshError("Failed to refresh balance.");
      }
    } finally {
      setRefreshing(false);
    }
  }, [loadBalances, loadEvolution]);

  useEffect(() => {
    void loadBalances();
  }, [loadBalances]);

  useEffect(() => {
    void loadEvolution();
  }, [loadEvolution]);

  const totalBalance = accounts?.reduce((sum, acc) => sum + (acc.solde?.remaining ?? 0), 0) ?? 0;
  const totalEvolution =
    evolution?.movement.reduce((sum, acc) => sum + (acc.solde?.balance ?? 0), 0) ?? 0;

  return (
    <div className="flex min-h-full flex-1 flex-col gap-8 bg-slate-50 px-6 py-8 dark:bg-slate-950 sm:px-8">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Your Balance
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {formatCurrency(totalBalance)}
          </h1>
          {totalEvolution !== 0 && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              <span className={totalEvolution > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                {totalEvolution > 0 ? "+" : ""}
                {formatCurrency(totalEvolution)}
              </span>
              {" "}this period
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void refreshSolde()}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-teal-500 dark:hover:bg-teal-600"
            title="Refresh balance from server"
          >
            {refreshing ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Refreshing…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2-8.83" />
                </svg>
                Refresh
              </>
            )}
          </button>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Period Start
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Errors */}
      {error || refreshError || evolutionError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
          {error || refreshError || evolutionError}
        </div>
      ) : null}

      {/* Content */}
      {!loading && accounts && accounts.length > 0 ? (
        <div className="grid gap-8">
          {/* Accounts Section */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">All Accounts</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {accounts.map((account) => {
                const movementAccount = evolution?.movement.find((m) => m.id === account.id);
                const evolution_value = movementAccount?.solde?.balance;
                return (
                  <button
                    key={account.id}
                    onClick={() => router.push(`/account/${account.id}`)}
                    className="group rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-teal-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-teal-600"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
                          {account.account_name}
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
                          {formatCurrency(account.solde?.remaining ?? 0)}
                        </p>
                      </div>
                      <AccountTypeBadge value={account.account_type} />
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <TrendIndicator value={evolution_value} />
                      <svg className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-600 dark:group-hover:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Income & Expense Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Income */}
            {evolution && evolution.income.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-emerald-900 dark:text-emerald-50">Income</h3>
                <div className="space-y-2">
                  {evolution.income.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => router.push(`/account/${account.id}`)}
                      className="group w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-emerald-600 dark:hover:bg-emerald-950/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{account.account_name}</p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{account.account_type}</p>
                        </div>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                          +{formatCurrency(-(account.solde?.balance))}
                        </p>
                      </div>
                    </button>
                  ))}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800/50 dark:bg-emerald-950/20">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-emerald-900 dark:text-emerald-100">Total Income</p>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(
                          -evolution.income.reduce((sum, acc) => sum + (acc.solde?.balance ?? 0), 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Expense */}
            {evolution && evolution.expense.length > 0 && (
              <div>
                <h3 className="mb-4 text-lg font-semibold text-rose-900 dark:text-rose-50">Expenses</h3>
                <div className="space-y-2">
                  {evolution.expense.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => router.push(`/account/${account.id}`)}
                      className="group w-full rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-rose-300 hover:bg-rose-50 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-rose-600 dark:hover:bg-rose-950/20"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{account.account_name}</p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{account.account_type}</p>
                        </div>
                        <p className="font-semibold text-rose-600 dark:text-rose-400">
                          {formatCurrency(account.solde?.balance)}
                        </p>
                      </div>
                    </button>
                  ))}
                  <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-800/50 dark:bg-rose-950/20">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-rose-900 dark:text-rose-100">Total Expenses</p>
                      <p className="font-semibold text-rose-600 dark:text-rose-400">
                        {formatCurrency(
                          evolution.expense.reduce((sum, acc) => sum + (acc.solde?.balance ?? 0), 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : loading && accounts === null ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600 dark:border-slate-600 dark:border-t-teal-400" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading account balances…</p>
          </div>
        </div>
      ) : !loading && accounts && accounts.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <p className="text-sm text-slate-600 dark:text-slate-400">No accounts found.</p>
        </div>
      ) : null}
    </div>
  );
}
