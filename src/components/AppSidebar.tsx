"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession } from "@/lib/session";

const STORAGE_KEY = "pyxis_sidebar_collapsed";

function IconHome({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function IconAccounts({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 18.75h.008v.008h-.008v-.008Zm0 0h.008v.008h-.008v-.008Zm0 0h.008v.008h-.008v-.008Zm0 0h.008v.008h-.008v-.008Z" />
    </svg>
  );
}

function IconTransactions({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21h9m0 0V3.75M16.5 21h2.25A2.25 2.25 0 0020.25 18.75V2.25A2.25 2.25 0 0018 0h-2.25m0 21H7.5m9-18v18m-10.875-2.625A2.625 2.625 0 115.25 15.375a2.625 2.625 0 013.75 3.75z" />
    </svg>
  );
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-9a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 4.5 21h9a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3 3m0 0-3 3m3-3H8.25" />
    </svg>
  );
}

function IconSettings({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94a6.059 6.059 0 0 1 1.362 2.847c.02.042.048.082.088.1.04.019.084.027.151.027.338 0 .635.235.761.593a6.061 6.061 0 0 1 .527 2.552c.025.462.049.942.061 1.428a.563.563 0 0 0 .553.573c.465.05.946.093 1.436.174.559.1 1.023.577 1.023 1.15v.695c0 .573-.464 1.05-1.023 1.149-.49.081-.971.124-1.436.174-.29.03-.544.19-.561.556-.064.737-.155 1.404-.26 2-.05.258-.278.45-.547.45-.08 0-.127-.008-.165-.027-.04-.019-.068-.059-.088-.1a6.059 6.059 0 0 1-1.362-2.847c-.02-.042-.048-.082-.088-.1-.04-.019-.084-.027-.151-.027-.338 0-.635-.235-.761-.593a6.061 6.061 0 0 1-.527-2.552 9.9 9.9 0 0 1-.061-1.428.563.563 0 0 0-.553-.573 9.9 9.9 0 0 0-1.436-.174C4.465 15.792 4 15.315 4 14.62v-.695c0-.573.464-1.05 1.023-1.149.49-.081.971-.124 1.436-.174.29-.03.544-.19.561-.556.064-.737.155-1.404.26-2 .05-.258.278-.45.547-.45.08 0 .127.008.165.027.04.019.068.059.088.1a6.059 6.059 0 0 1 1.362 2.847c.02.042.048.082.088.1.04.019.084.027.151.027.338 0 .635.235.761.593a6.061 6.061 0 0 1 .527 2.552c.025.462.049.942.061 1.428a.563.563 0 0 0 .553.573c.465.05.946.093 1.436.174.559.1 1.023.577 1.023 1.15v.695c0 .573-.464 1.05-1.023 1.149-.49.081-.971.124-1.436.174-.29.03-.544.19-.561.556-.064.737-.155 1.404-.26 2-.05.258-.278.45-.547.45-.08 0-.127-.008-.165-.027-.04-.019-.068-.059-.088-.1a6.059 6.059 0 0 1-1.362-2.847c-.02-.042-.048-.082-.088-.1-.04-.019-.084-.027-.151-.027-.338 0-.635-.235-.761-.593a6.061 6.061 0 0 1-.527-2.552 9.9 9.9 0 0 1-.061-1.428.563.563 0 0 0-.553-.573 9.9 9.9 0 0 0-1.436-.174C4.465 15.792 4 15.315 4 14.62v-.695c0-.573.464-1.05 1.023-1.149.49-.081.971-.124 1.436-.174.29-.03.544-.19.561-.556.064-.737.155-1.404.26-2 .05-.258.278-.45.547-.45.08 0 .127.008.165.027.04.019.068.059.088.1a6.059 6.059 0 0 1 1.362 2.847c.02.042.048.082.088.1.04.019.084.027.151.027.338 0 .635.235.761.593a6.061 6.061 0 0 1 .527 2.552c.025.462.049.942.061 1.428a.563.563 0 0 0 .553.573c.465.05.946.093 1.436.174.559.1 1.023.577 1.023 1.15v.695c0 .573-.464 1.05-1.023 1.149-.49.081-.971.124-1.436.174-.29.03-.544.19-.561.556-.064.737-.155 1.404-.26 2-.05.258-.278.45-.547.45-.08 0-.127-.008-.165-.027-.04-.019-.068-.059-.088-.1a6.059 6.059 0 0 1-1.362-2.847" />
    </svg>
  );
}

type NavItem =
  | { href: string; label: string; Icon: ({ className }: { className?: string }) => React.ReactNode; action?: false }
  | { href: string; label: string; Icon: ({ className }: { className?: string }) => React.ReactNode; action: true };

const nav: NavItem[] = [
  { href: "/welcome", label: "Welcome", Icon: IconHome },
  { href: "/accounts", label: "Accounts", Icon: IconAccounts },
  { href: "/transactions", label: "Transactions", Icon: IconTransactions },
  { href: "/parameters", label: "Parameters", Icon: IconSettings },
  { href: "#logoff", label: "Logoff", Icon: IconLogout, action: true },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "1") setCollapsed(true);
    } catch {
      /* ignore */
    }
  }, []);

  function toggle() {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function handleLogoff() {
    clearSession();
    router.push("/login");
  }

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ease-out dark:border-slate-800 dark:bg-slate-900 ${
        collapsed ? "w-[4.25rem]" : "w-56"
      }`}
    >
      <div className="flex h-14 items-center justify-end border-b border-slate-200 px-2 dark:border-slate-800">
        <button
          type="button"
          onClick={toggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <IconChevronRight className="h-5 w-5" />
          ) : (
            <IconChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-2" aria-label="Main">
        {nav.map(({ href, label, Icon, action }) => {
          const active = pathname === href;
          if (action) {
            return (
              <button
                key={label}
                onClick={handleLogoff}
                title={collapsed ? label : undefined}
                className={`flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition ${
                  collapsed ? "justify-center px-0" : "px-3"
                } text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span
                  className={`truncate transition-opacity duration-200 ${
                    collapsed ? "sr-only" : "opacity-100"
                  }`}
                >
                  {label}
                </span>
              </button>
            );
          }
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition ${
                collapsed ? "justify-center px-0" : "px-3"
              } ${
                active
                  ? "bg-teal-600 text-white dark:bg-teal-500 dark:text-slate-900"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span
                className={`truncate transition-opacity duration-200 ${
                  collapsed ? "sr-only" : "opacity-100"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
