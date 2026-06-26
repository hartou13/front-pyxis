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
        className="text-slate-900 hover:text-slate-600 hover:underline dark:text-slate-100 dark:hover:text-slate-400"
      >
        {accountName}
      </button>
    );
  };

  return (
    <tr className="border-b border-slate-200 transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50">
      <td className="px-4 py-3 text-sm text-slate-900 dark:text-slate-100">
        {description}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        {renderAccountCell(fromAccountId, fromAccountName)}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        {renderAccountCell(toAccountId, toAccountName)}
      </td>
      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-slate-100">
        {formatCurrency(amount)}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
        {formatDate(date)}
      </td>
      <td className="flex items-center justify-end gap-1 px-4 py-3">
        <button
          type="button"
          onClick={() => id && onView(id)}
          disabled={!id}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="View details"
          title={id ? "View details" : "Missing transaction id"}
        >
          <IconEye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(transaction)}
          disabled={!id}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="Edit transaction"
          title={id ? "Edit transaction" : "Missing transaction id"}
        >
          <IconPencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(transaction)}
          disabled={!id}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          aria-label="Delete transaction"
          title={id ? "Delete transaction" : "Missing transaction id"}
        >
          <IconTrash className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function PaginationPageNumbers({
  currentPage,
  totalPages,
  onPageChange,
  disabled,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled: boolean;
}) {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(totalPages);
  pages.add(currentPage);
  if (currentPage > 1) pages.add(currentPage - 1);
  if (currentPage < totalPages) pages.add(currentPage + 1);

  const sortedPages = Array.from(pages).sort((a, b) => a - b);

  const renderPages: (number | string)[] = [];
  for (let i = 0; i < sortedPages.length; i++) {
    renderPages.push(sortedPages[i]);
    if (i < sortedPages.length - 1 && sortedPages[i + 1] - sortedPages[i] > 1) {
      renderPages.push("...");
    }
  }

  return (
    <div className="flex items-center gap-1">
      {renderPages.map((page, idx) => {
        if (page === "...") {
          return (
            <div key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-slate-500 dark:text-slate-400">
              …
            </div>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            disabled={disabled}
            className={`h-8 min-w-8 rounded-lg px-2 text-sm font-medium transition ${
              isActive
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {pageNum}
          </button>
        );
      })}
    </div>
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

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-50">
                Description
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-50">
                From Account
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-50">
                To Account
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-50">
                Amount
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-50">
                Date
              </th>
              <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-700 dark:bg-slate-900">
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

      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <label htmlFor="pageSize" className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={loading}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {total > 0
              ? `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, total)} of ${total}`
              : "No items"
            }
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={loading || currentPage <= 1}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          <PaginationPageNumbers
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={loading || currentPage >= totalPages}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
