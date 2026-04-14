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

function getString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

function getNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const v = obj[key];
  return typeof v === "number" ? v : undefined;
}

function formatCurrency(amount: number, isOutgoing: boolean): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  const formatted = formatter.format(Math.abs(amount));
  return isOutgoing ? `-${formatted}` : `+${formatted}`;
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
  let palette =
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200";
  if (v === "income") {
    Icon = IconIncome;
    palette =
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
  } else if (v === "expense") {
    Icon = IconExpense;
    palette =
      "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300";
  } else if (v === "movement") {
    Icon = IconMovement;
    palette =
      "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300";
  }
  return (
    <span className={`inline-flex h-6 w-6 items-center justify-center rounded ${palette}`}>
      <Icon className="h-3 w-3" />
    </span>
  );
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

function MoveRow({
  move,
  currentAccountId,
  onView,
  onEdit,
  onDelete,
}: {
  move: Record<string, unknown>;
  currentAccountId: string;
  onView: (moveId: string) => void;
  onEdit: (move: Record<string, unknown>) => void;
  onDelete: (move: Record<string, unknown>) => void;
}) {
  const id = typeof move.id === "string" ? move.id : undefined;
  const description = getString(move, "description") || "—";
  const date = getString(move, "date");
  const amount = getNumber(move, "amount") || 0;

  const fromAccountId =
    move.from_account && typeof move.from_account === "object"
      ? getString(move.from_account as Record<string, unknown>, "id")
      : undefined;
  const fromAccountName =
    move.from_account && typeof move.from_account === "object"
      ? getString(move.from_account as Record<string, unknown>, "account_name")
      : undefined;

  const toAccountId =
    move.to_account && typeof move.to_account === "object"
      ? getString(move.to_account as Record<string, unknown>, "id")
      : undefined;
  const toAccountName =
    move.to_account && typeof move.to_account === "object"
      ? getString(move.to_account as Record<string, unknown>, "account_name")
      : undefined;

  // Determine if this is outgoing (current account is from_account)
  const isOutgoing = fromAccountId === currentAccountId;

  // Get the counterparty account details
  const counterpartyName = isOutgoing ? toAccountName : fromAccountName;
  const counterpartyLabel = isOutgoing ? "To" : "From";
  const moveType = getString((isOutgoing ? move.to_account:move.from_account) as Record<string, unknown>, "account_move_type")


  return (
    <tr className="border-b border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
      <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100">
        {description}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        {formatDate(date)}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <MoveTypeIcon value={moveType} />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500">
              {counterpartyLabel}
            </span>
            <span className="text-zinc-900 dark:text-zinc-100">
              {counterpartyName || "—"}
            </span>
          </div>
        </div>
      </td>
      <td
        className={`px-4 py-3 text-right text-sm font-medium ${
          isOutgoing
            ? "text-red-600 dark:text-red-400"
            : "text-emerald-600 dark:text-emerald-400"
        }`}
      >
        {formatCurrency(amount, isOutgoing)}
      </td>
      <td className="flex items-center justify-end gap-1 px-4 py-3">
        <button
          type="button"
          onClick={() => id && onView(id)}
          disabled={!id}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label="View details"
          title={id ? "View details" : "Missing move id"}
        >
          <IconEye className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onEdit(move)}
          disabled={!id}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          aria-label="Edit move"
          title={id ? "Edit move" : "Missing move id"}
        >
          <IconPencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(move)}
          disabled={!id}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          aria-label="Delete move"
          title={id ? "Delete move" : "Missing move id"}
        >
          <IconTrash className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

interface AccountMoveHistoryTableProps {
  moves: Record<string, unknown>[] | null;
  currentAccountId: string;
  currentPage: number;
  pageSize: number;
  total: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
  onViewMove: (moveId: string) => void;
  onEditMove: (move: Record<string, unknown>) => void;
  onDeleteMove: (move: Record<string, unknown>) => void;
}

export function AccountMoveHistoryTable({
  moves,
  currentAccountId,
  currentPage,
  pageSize,
  total,
  loading,
  onPageChange,
  onPageSizeChange,
  onViewMove,
  onEditMove,
  onDeleteMove,
}: AccountMoveHistoryTableProps) {
  if (!moves || moves.length === 0) {
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
                Date
              </th>
              <th className="px-4 py-3 text-left font-semibold text-zinc-900 dark:text-zinc-50">
                Account
              </th>
              <th className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                Amount
              </th>
              <th className="px-4 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {moves.map((move, index) => (
              <MoveRow
                key={
                  (typeof move.id === "string" && move.id) || `move-${index}`
                }
                move={move}
                currentAccountId={currentAccountId}
                onView={onViewMove}
                onEdit={onEditMove}
                onDelete={onDeleteMove}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <div>
            <label htmlFor="movePageSize" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Items per page:
            </label>
            <select
              id="movePageSize"
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
            {total > 0
              ? `${(currentPage - 1) * pageSize + 1}–${Math.min(
                  currentPage * pageSize,
                  total,
                )} of ${total}`
              : "No items"}
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
            {Array.from(
              { length: Math.ceil(total / pageSize) },
              (_, i) => i + 1,
            ).map((page) => (
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
