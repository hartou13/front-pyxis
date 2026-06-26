"use client";

import { useTheme } from "@/components/ThemeProvider";

function IconSun({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m0 0v-2.25m-6.364.386 1.591 1.591M12 21v-2.25m6.364.386 1.591-1.591M3 12a9 9 0 1 1 18 0 9 9 0 0 1-18 0"
      />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    </svg>
  );
}

function IconSystem({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17.25v1.007a3 3 0 0 1-3 3H5.007a3 3 0 0 1-3-3V9.777a3 3 0 0 1 3-3h1.007a3 3 0 0 1 3 3v8.993m5-6.138a3 3 0 0 0-3-3h-1.007a3 3 0 0 0-3 3m6 0a3 3 0 0 1 3 3v8.993a3 3 0 0 1-3 3h-1.007a3 3 0 0 1-3-3V9.777a3 3 0 0 1 3-3h1.007a3 3 0 0 1 3 3m-6 0h6"
      />
    </svg>
  );
}

export default function ParametersPage() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { id: "light", label: "Light", Icon: IconSun },
    { id: "system", label: "System", Icon: IconSystem },
    { id: "dark", label: "Dark", Icon: IconMoon },
  ] as const;

  return (
    <div className="flex min-h-full flex-1 flex-col gap-8 bg-slate-50 px-6 py-8 dark:bg-slate-950 sm:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Settings
        </p>
        <h1 className="mt-1 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Parameters
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage your preferences
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/50">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">
          Appearance
        </h2>
        <div className="flex flex-wrap gap-3">
          {themeOptions.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id as "light" | "dark" | "system")}
              className={`flex items-center gap-2 rounded-lg px-4 py-3 font-medium transition ${
                theme === id
                  ? "ring-2 ring-teal-500 bg-teal-50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-50"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
