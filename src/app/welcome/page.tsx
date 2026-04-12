import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 bg-zinc-50 px-6 py-24 dark:bg-zinc-950">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Welcome
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        You are signed in.
      </p>
      <Link
        href="/"
        className="text-sm font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
      >
        Home
      </Link>
    </div>
  );
}
