"use client";

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { AddTransactionModal } from "@/components/AddTransactionModal";
import { DeleteTransactionModal } from "@/components/DeleteTransactionModal";
import { EditTransactionModal } from "@/components/EditTransactionModal";
import { ViewTransactionModal } from "@/components/ViewTransactionModal";
import {
  fetchTransactions,
  transactionsResponseToList,
} from "@/lib/transactions-api";

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatCurrency(amount: unknown): string {
  if (typeof amount === "number") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
  return String(amount ?? "—");
}

function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

function getNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const v = obj[key];
  return typeof v === "number" ? v : undefined;
}

function IconEye({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}

function IconPencil({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
      />
    </svg>
  );
}

function IconTrash({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}

function TransactionRow({
  transaction,
  onView,
  onEdit,
  onDelete,
}: {
  transaction: Record<string, unknown>;
  onView: (transactionId: string) => void;
  onEdit: (transaction: Record<string, unknown>) => void;
  onDelete: (transaction: Record<string, unknown>) => void;
}) {
  const id = typeof transaction.id === "string" ? transaction.id : undefined;
  const description = getString(transaction, "description") || "—";
  const amount = getNumber(transaction, "amount");
  const date = getString(transaction, "date");
  const fromAccount = transaction.from_account;
  const toAccount = transaction.to_account;
  const fromAccountName =
    fromAccount && typeof fromAccount === "object"
      ? getString(fromAccount as Record<string, unknown>, "account_name")
      : undefined;
  const toAccountName =
    toAccount && typeof toAccount === "object"
      ? getString(toAccount as Record<string, unknown>, "account_name")
      : undefined;

  return (
    <tr className="border-b border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
      <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
        {description}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {fromAccountName || "—"}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {toAccountName || "—"}
      </td>
      <td className="px-4 py-3 text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {formatCurrency(amount)}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {formatDate(date)}
      </td>
      <td className="flex items-center justify-end gap-1 px-4 py-3">
        <button
          type="button"
          onClick={() => id && onView(id)}
          disabled={!id}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label="View details"
          title={id ? "View details" : "Missing transaction id"}
        >
          <IconEye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(transaction)}
          disabled={!id}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label="Edit transaction"
          title={id ? "Edit transaction" : "Missing transaction id"}
        >
          <IconPencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(transaction)}
          disabled={!id}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          aria-label="Delete transaction"
          title={id ? "Delete transaction" : "Missing transaction id"}
        >
          <IconTrash className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Record<string, unknown>[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await fetchTransactions();
      setTransactions(transactionsResponseToList(raw));
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
    void load();
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
            onClick={() => void load()}
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
        onCreated={() => void load()}
      />

      <EditTransactionModal
        open={editTransaction !== null}
        transaction={editTransaction}
        onClose={() => setEditTransaction(null)}
        onUpdated={() => void load()}
      />

      <DeleteTransactionModal
        open={deleteTransaction !== null}
        transaction={deleteTransaction}
        onClose={() => setDeleteTransaction(null)}
        onDeleted={() => void load()}
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

      {transactions && transactions.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
                  From Account
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
                  To Account
                </th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                  Amount
                </th>
                <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
                  Date
                </th>
                <th className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
              {transactions.map((transaction, index) => (
                <TransactionRow
                  key={
                    (typeof transaction.id === "string" && transaction.id) ||
                    `transaction-${index}`
                  }
                  transaction={transaction}
                  onView={setViewTransactionId}
                  onEdit={setEditTransaction}
                  onDelete={setDeleteTransaction}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
