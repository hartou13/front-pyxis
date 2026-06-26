"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { DeleteTransactionModal } from "@/components/DeleteTransactionModal";
import { EditTransactionModal } from "@/components/EditTransactionModal";
import { ViewTransactionModal } from "@/components/ViewTransactionModal";
import { PaginatedTransactionsTable } from "@/components/PaginatedTransactionsTable";
import {
  fetchTransactions,
  transactionsResponseToList,
} from "@/lib/transactions-api";


function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m21.108-33.336a3.526 3.526 0 00-5.023-3.526m-36.144 3.528a3.528 3.528 0 005.022-3.528M2.991 20.263l4.992-4.991m21.315-21.015l-5.023 5.022M2.461 20.808l4.34-4.34m21.676-21.465l-4.34 4.34" />
    </svg>
  );
}

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Record<string, unknown>[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [viewTransactionId, setViewTransactionId] = useState<string | undefined>(undefined);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTransaction, setDeleteTransaction] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [editTransaction, setEditTransaction] = useState<Record<
    string,
    unknown
  > | null>(null);

  const load = useCallback(async (page: number = 1, limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchTransactions(page, limit);

      // Extract pagination metadata from pagination object
      let transactions = transactionsResponseToList(raw);
      let newTotal = 0;
      let newPageSize = limit;

      if (raw && typeof raw === "object") {
        const o = raw as Record<string, unknown>;
        // Check for pagination object first
        if (o.pagination && typeof o.pagination === "object") {
          const p = o.pagination as Record<string, unknown>;
          if (typeof p.total === "number") {
            newTotal = p.total;
          }
          if (typeof p.pageSize === "number") {
            newPageSize = p.pageSize;
          }
        } else {
          // Fallback to top-level properties
          if (typeof o.total === "number") {
            newTotal = o.total;
          }
          if (typeof o.pageSize === "number") {
            newPageSize = o.pageSize;
          }
        }
      }

      setTransactions(transactions);
      setCurrentPage(page);
      setPageSize(newPageSize);
      setTotal(newTotal);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data &&
          typeof err.response.data === "object" &&
          "message" in err.response.data &&
          typeof (err.response.data as { message: unknown }).message === "string"
            ? (err.response.data as { message: string }).message
            : err.response?.statusText || err.message;
        setError(typeof msg === "string" ? msg : "Failed to load transactions.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to load transactions.");
      }
      setTransactions(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1, 10);
  }, [load]);

  return (
    <div className="flex min-h-full flex-1 flex-col gap-6 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/30 px-6 py-8 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950">
      {/* Header */}
      <div className="animate-slide-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              📋 Transactions
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              All transactions from your Pyxis workspace
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void load(currentPage, pageSize)}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white/80 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold text-slate-900 transition-all duration-300 ease-out hover:bg-slate-50 hover:shadow-md disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {loading ? "⟳ Refreshing…" : "↻ Refresh"}
            </button>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5 dark:from-teal-600 dark:to-teal-700 dark:hover:from-teal-700 dark:hover:to-teal-800"
            >
              Add Transaction
            </button>
          </div>
        </div>
      </div>

      <AddTransactionModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => void load(1, pageSize)}
      />

      <EditTransactionModal
        open={editTransaction !== null}
        transaction={editTransaction as Record<string, unknown> | undefined}
        onClose={() => setEditTransaction(null)}
        onUpdated={() => void load(currentPage, pageSize)}
      />

      <DeleteTransactionModal
        open={deleteTransaction !== null}
        transaction={deleteTransaction as Record<string, unknown> | undefined}
        onClose={() => setDeleteTransaction(null)}
        onDeleted={() => void load(currentPage, pageSize)}
      />

      {error ? (
        <div className="animate-slide-up rounded-2xl border border-red-200/50 bg-gradient-to-r from-red-50/80 to-red-50/40 dark:from-red-950/30 dark:to-red-950/10 dark:border-red-900/50 backdrop-blur-sm px-6 py-4 text-sm text-red-900 dark:text-red-200">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold">Error loading transactions</p>
              <p className="mt-1 opacity-90">{error}</p>
            </div>
          </div>
        </div>
      ) : null}

      {loading && transactions === null ? (
        <div className="animate-pulse space-y-4">
          <div className="h-16 rounded-2xl bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 animate-shimmer" />
          <div className="h-16 rounded-2xl bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 animate-shimmer" />
          <div className="h-16 rounded-2xl bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 animate-shimmer" />
        </div>
      ) : null}

      {!loading && transactions && transactions.length === 0 ? (
        <div className="animate-fade-in rounded-2xl border border-slate-200/50 bg-gradient-to-br from-slate-50/80 to-slate-100/40 dark:from-slate-800/30 dark:to-slate-900/20 dark:border-slate-700/50 backdrop-blur-sm p-12 text-center">
          <p className="text-3xl mb-3">📭</p>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No transactions yet</p>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Start tracking your finances by adding your first transaction</p>
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-3 inline-block rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-0.5"
          >
            + Add Transaction
          </button>
        </div>
      ) : null}

      <ViewTransactionModal
        open={viewTransactionId !== undefined}
        transactionId={viewTransactionId}
        onClose={() => setViewTransactionId(undefined)}
      />

      {transactions && transactions.length > 0 && (
        <div className="animate-fade-in">
          <div className="rounded-2xl border border-slate-200/40 dark:border-slate-700/40 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm overflow-hidden elevation-2 hover-lift transition-all duration-300">
            <PaginatedTransactionsTable
              transactions={transactions}
              currentPage={currentPage}
              pageSize={pageSize}
              total={total}
              loading={loading}
              onPageChange={(page) => void load(page, pageSize)}
              onPageSizeChange={(limit) => void load(1, limit)}
              onViewTransaction={setViewTransactionId}
              onEditTransaction={setEditTransaction}
              onDeleteTransaction={setDeleteTransaction}
              onAccountClick={(accountId) => router.push(`/account/${accountId}`)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
