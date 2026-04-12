export default function AccountsPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col gap-4 bg-zinc-50 px-6 py-8 dark:bg-zinc-950">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Accounts
      </h1>
      <p className="max-w-lg text-zinc-600 dark:text-zinc-400">
        Manage your accounts here. Connect this view to your account APIs when
        you are ready.
      </p>
    </div>
  );
}
