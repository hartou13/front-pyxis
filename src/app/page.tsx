import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-24 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center">
        <div className="mb-4 inline-block">
          <div className="rounded-lg bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">
            Financial Clarity
          </div>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Pyxis
        </h1>
        <p className="mt-4 max-w-md text-lg text-slate-600 dark:text-slate-400">
          A simple, smart way to understand your finances at a glance.
        </p>
      </div>
      <Link
        href="/login"
        className="rounded-lg bg-teal-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600"
      >
        Get Started
      </Link>
    </div>
  );
}
