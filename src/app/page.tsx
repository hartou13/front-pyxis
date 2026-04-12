import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 bg-zinc-50 px-6 py-24 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pyxis
        </h1>
        <p className="mt-3 max-w-md text-lg text-zinc-600 dark:text-zinc-400">
          Next.js app with Tailwind CSS.
        </p>
      </div>
      <Link
        href="/login"
        className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Go to login
      </Link>
    </div>
  );
}
