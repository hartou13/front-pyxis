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
    <div className="flex min-h-full flex-1 flex-col gap-6 bg-zinc-50 px-6 py-8 dark:bg-zinc-950">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Transactions
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            All transactions from your Pyxis workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => void load(currentPage, pageSize)}
            disabled={loading}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
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
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {loading && transactions === null ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading transactions…
        </p>
      ) : null}

      {!loading && transactions && transactions.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No transactions found.
        </p>
      ) : null}

      <ViewTransactionModal
        open={viewTransactionId !== undefined}
        transactionId={viewTransactionId}
        onClose={() => setViewTransactionId(undefined)}
      />

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
  );
}
