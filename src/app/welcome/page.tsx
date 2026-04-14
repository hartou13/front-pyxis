"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { getApiBaseUrl } from "@/lib/auth-client";
import { getSession } from "@/lib/session";

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

function AccountTypeBadge({ value }: { value: string | undefined }) {
  const v = value?.toLowerCase().trim();
  let Icon = IconUnknown;
  let label = value ?? "Unknown";
  let palette =
    "bg-zinc-100 text-zinc-700 ring-zinc-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600/50";
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

interface AccountBalance {
  account_name: string;
  account_type: string;
  id: string;
  solde: {
    remaining: number;
  } | null;
}

export default function WelcomePage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountBalance[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBalances = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = getSession();
      if (!session) {
        throw new Error("Not authenticated");
      }
      const { data } = await axios.get(`${getApiBaseUrl()}/solde`, {
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

  useEffect(() => {
    void loadBalances();
  }, [loadBalances]);

  return (
    <div className="flex min-h-full flex-1 flex-col gap-6 bg-zinc-50 px-6 py-8 dark:bg-zinc-950">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          You are signed in.
        </p>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading && accounts === null ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading account balances…</p>
      ) : null}

      {!loading && accounts && accounts.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
                  Account Name
                </th>
                <th className="px-6 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
                  Type
                </th>
                <th className="px-6 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  className="border-b border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50"
                >
                  <td className="px-6 py-4 text-zinc-900 dark:text-zinc-50">
                    <button
                      type="button"
                      onClick={() => router.push(`/account/${account.id}`)}
                      className="text-zinc-600 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      {account.account_name}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <AccountTypeBadge value={account.account_type} />
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(account.solde?.remaining ?? 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!loading && accounts && accounts.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No accounts found.
        </p>
      ) : null}

      <Link
        href="/"
        className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
      >
        Home
      </Link>
    </div>
  );
}
