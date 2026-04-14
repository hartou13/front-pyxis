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
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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
  onAccountClick,
}: {
  transaction: Record<string, unknown>;
  onView: (transactionId: string) => void;
  onEdit: (transaction: Record<string, unknown>) => void;
  onDelete: (transaction: Record<string, unknown>) => void;
  onAccountClick?: (accountId: string) => void;
}) {
  const id = typeof transaction.id === "string" ? transaction.id : undefined;
  const description = getString(transaction, "description") || "—";
  const amount = getNumber(transaction, "amount");
  const date = getString(transaction, "date");
  const fromAccount = transaction.from_account;
  const toAccount = transaction.to_account;
  const fromAccountId =
    fromAccount && typeof fromAccount === "object"
      ? getString(fromAccount as Record<string, unknown>, "id")
      : undefined;
  const fromAccountName =
    fromAccount && typeof fromAccount === "object"
      ? getString(fromAccount as Record<string, unknown>, "account_name")
      : undefined;
  const toAccountId =
    toAccount && typeof toAccount === "object"
      ? getString(toAccount as Record<string, unknown>, "id")
      : undefined;
  const toAccountName =
    toAccount && typeof toAccount === "object"
      ? getString(toAccount as Record<string, unknown>, "account_name")
      : undefined;

  const renderAccountCell = (accountId: string | undefined, accountName: string | undefined) => {
    if (!accountName) return "—";
    if (!accountId || !onAccountClick) return accountName;
    return (
      <button
        type="button"
        onClick={() => onAccountClick(accountId)}
        className="text-zinc-600 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
      >
        {accountName}
      </button>
    );
  };

  return (
    <tr className="border-b border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
      <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
        {description}
      </td>
      <td className="px-4 py-3 text-sm">
        {renderAccountCell(fromAccountId, fromAccountName)}
      </td>
      <td className="px-4 py-3 text-sm">
        {renderAccountCell(toAccountId, toAccountName)}
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

interface PaginatedTransactionsTableProps {
  transactions: Record<string, unknown>[] | null;
  currentPage: number;
  pageSize: number;
  total: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  onViewTransaction: (transactionId: string) => void;
  onEditTransaction: (transaction: Record<string, unknown>) => void;
  onDeleteTransaction: (transaction: Record<string, unknown>) => void;
  onAccountClick?: (accountId: string) => void;
}

export function PaginatedTransactionsTable({
  transactions,
  currentPage,
  pageSize,
  total,
  loading,
  onPageChange,
  onPageSizeChange,
  onViewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onAccountClick,
}: PaginatedTransactionsTableProps) {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  return (
    <>
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
                onView={onViewTransaction}
                onEdit={onEditTransaction}
                onDelete={onDeleteTransaction}
                onAccountClick={onAccountClick}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="pageSize" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Items per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={loading}
              className="ml-2 rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {total > 0 ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, total)} of ${total}` : "No items"}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={loading || currentPage <= 1}
            className="rounded border border-zinc-300 bg-white px-3 py-1 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.ceil(total / pageSize) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                disabled={loading}
                className={`h-8 w-8 rounded text-sm font-medium transition ${
                  page === currentPage
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={loading || currentPage >= Math.ceil(total / pageSize)}
            className="rounded border border-zinc-300 bg-white px-3 py-1 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
