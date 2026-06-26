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
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path fill={isDark ? "black" : "white"} d="M12 8l4 5h-3v3h-2v-3H8l4-5z" />
    </svg>
  );
}

function IconTrendDown({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path fill={isDark ? "black" : "white"} d="M12 16l-4-5h3v-3h2v3h3l-4 5z" />
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
        <IconTrendFlat className="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-slate-500" />
        <span className="text-xs font-medium leading-none text-slate-500 dark:text-slate-400">Stable</span>
      </div>
    );
  }
  if (value > 0) {
    return (
      <div className="flex items-center gap-1">
        <IconTrendUp className="h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-medium leading-none text-emerald-600 dark:text-emerald-400">+{formatCurrency(value)}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <IconTrendDown className="h-4 w-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
      <span className="text-xs font-medium leading-none text-rose-600 dark:text-rose-400">{formatCurrency(value)}</span>
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
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  });
  const [evolution, setEvolution] = useState<SoldeEvolution | null>(null);
  const [evolutionError, setEvolutionError] = useState<string | null>(null);
  const [evolutionLoading, setEvolutionLoading] = useState(false);

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
      const endISO = `${endDate}T00:00`;
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
  }, [startDate, endDate]);

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
    <div className="flex min-h-full flex-1 flex-col gap-4 bg-gradient-to-br from-slate-50/80 via-white to-slate-50/40 px-4 py-4 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 sm:px-4">
      {/* Header - Hero Balance Card */}
      <div className="animate-fade-in">
        <div className="group relative rounded-2xl bg-gradient-to-br from-white/80 to-white/60 dark:from-slate-900/80 dark:to-slate-900/60 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 p-4 sm:p-5 shadow-lg hover:shadow-2xl transition-all duration-300 ease-out overflow-hidden">
          {/* Accent gradient background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400/10 to-cyan-400/5 rounded-full blur-3xl -z-0 dark:from-teal-500/5 dark:to-cyan-500/2"></div>

          <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                Total Balance
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tighter text-slate-900 dark:text-slate-50 font-mono">
                {formatCurrency(totalBalance)}
              </h1>
              {totalEvolution !== 0 && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className={`font-bold text-base ${totalEvolution > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {totalEvolution > 0 ? "↑ +" : "↓ "}
                    {formatCurrency(totalEvolution)}
                  </span>
                  <span className="text-slate-500 dark:text-slate-500"> this period</span>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => void refreshSolde()}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 px-4 py-2 text-xs font-bold text-white transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed dark:from-teal-600 dark:to-teal-700 dark:hover:from-teal-700 dark:hover:to-teal-800"
                title="Refresh balance from server"
              >
                {refreshing ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Refreshing…</span>
                  </>
                ) : (
                  <>
                    <span>↻</span>
                    <span>Refresh</span>
                  </>
                )}
              </button>
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-0.5 uppercase tracking-wide">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 dark:border-slate-600 transition-all duration-300 ease-out focus-ring hover:border-teal-300 dark:hover:border-teal-700"
                />
              </div>
              <div className="flex flex-col">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-0.5 uppercase tracking-wide">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-slate-900 dark:text-slate-100 dark:border-slate-600 transition-all duration-300 ease-out focus-ring hover:border-teal-300 dark:hover:border-teal-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {error || refreshError || evolutionError ? (
        <div className="rounded-2xl border border-rose-300/50 bg-gradient-to-r from-rose-50 to-rose-50/50 dark:border-rose-900/50 dark:from-rose-950/30 dark:to-rose-950/20 px-6 py-4 text-base text-rose-900 dark:text-rose-200 elevation-1 animate-slide-up">
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">⚠</span>
            <div>{error || refreshError || evolutionError}</div>
          </div>
        </div>
      ) : null}

      {/* Content */}
      {!loading && accounts && accounts.length > 0 ? (
        <div className="grid gap-10">
          {/* Accounts Section */}
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">💰 Accounts</h2>
                <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">Monitor your financial positions</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 stagger-items">
              {accounts.map((account) => {
                const movementAccount = evolution?.movement.find((m) => m.id === account.id);
                const evolution_value = movementAccount?.solde?.balance;
                return (
                  <button
                    key={account.id}
                    onClick={() => router.push(`/account/${account.id}`)}
                    className="group relative rounded-lg border border-slate-200/40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm p-3 text-left transition-all duration-300 ease-out hover-lift dark:border-slate-700/40 elevation-2 overflow-hidden"
                  >
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 h-1 rounded-tl-lg rounded-tr-lg w-full bg-gradient-to-r from-teal-400 to-cyan-400 dark:from-teal-500 dark:to-cyan-500"></div>

                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400 truncate">
                          {account.account_name}
                        </p>
                        <p className="mt-0.5 text-sm font-black text-slate-900 dark:text-slate-50 font-mono truncate">
                          {formatCurrency(account.solde?.remaining ?? 0)}
                        </p>
                      </div>
                      <AccountTypeBadge value={account.account_type} />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100/50 dark:border-slate-700/50">
                      <TrendIndicator value={evolution_value} />
                      <svg className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-600 dark:group-hover:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Income & Expense Grid */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Income */}
            {evolution && evolution.income.length > 0 && (
              <div className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-50">📈 Income</h3>
                  <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">Money flowing in</p>
                </div>
                <div className="space-y-2 stagger-items">
                  {evolution.income.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => router.push(`/account/${account.id}`)}
                      className="group w-full rounded-lg border border-emerald-200/50 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800/30 p-1.5 text-left transition-all duration-300 ease-out hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100 truncate">{account.account_name}</p>
                          <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-0.5">{account.account_type}</p>
                        </div>
                        <p className="ml-2 font-bold text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                          +{formatCurrency(-(account.solde?.balance))}
                        </p>
                      </div>
                    </button>
                  ))}
                  <div className="rounded-lg border-2 border-emerald-300/60 bg-gradient-to-br from-emerald-100/60 to-emerald-50/40 dark:from-emerald-900/40 dark:to-emerald-950/30 dark:border-emerald-700/40 p-3 mt-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">Total Income</p>
                      <p className="font-black text-emerald-600 dark:text-emerald-400 text-base font-mono">
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
              <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-rose-900 dark:text-rose-50">📉 Expenses</h3>
                  <p className="text-xs text-rose-700/70 dark:text-rose-400/70 mt-0.5">Money flowing out</p>
                </div>
                <div className="space-y-2 stagger-items">
                  {evolution.expense.map((account) => (
                    <button
                      key={account.id}
                      onClick={() => router.push(`/account/${account.id}`)}
                      className="group w-full rounded-lg border border-rose-200/50 bg-rose-50/50 dark:bg-rose-950/20 dark:border-rose-800/30 p-1.5 text-left transition-all duration-300 ease-out hover:bg-rose-100/60 dark:hover:bg-rose-950/40 hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-rose-900 dark:text-rose-100 truncate">{account.account_name}</p>
                          <p className="text-xs text-rose-700/70 dark:text-rose-400/70 mt-0.5">{account.account_type}</p>
                        </div>
                        <p className="ml-2 font-bold text-rose-600 dark:text-rose-400 text-sm font-mono">
                          {formatCurrency(account.solde?.balance)}
                        </p>
                      </div>
                    </button>
                  ))}
                  <div className="rounded-lg border-2 border-rose-300/60 bg-gradient-to-br from-rose-100/60 to-rose-50/40 dark:from-rose-900/40 dark:to-rose-950/30 dark:border-rose-700/40 p-3 mt-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-rose-900 dark:text-rose-100 text-sm">Total Expenses</p>
                      <p className="font-black text-rose-600 dark:text-rose-400 text-base font-mono">
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
        <div className="flex items-center justify-center py-10 animate-fade-in">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600 dark:border-slate-600 dark:border-t-teal-400"></div>
            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Loading your finances…</p>
          </div>
        </div>
      ) : !loading && accounts && accounts.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 px-4 py-8 text-center animate-fade-in">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">No accounts found</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Add your first account to get started</p>
        </div>
      ) : null}
    </div>
  );
}
