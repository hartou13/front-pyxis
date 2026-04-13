"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

const nav = [
  { href: "/welcome", label: "Welcome", Icon: IconHome },
  { href: "/accounts", label: "Accounts", Icon: IconAccounts },
  { href: "/transactions", label: "Transactions", Icon: IconTransactions },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
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

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-zinc-200 bg-white transition-[width] duration-200 ease-out dark:border-zinc-800 dark:bg-zinc-900 ${
        collapsed ? "w-[4.25rem]" : "w-56"
      }`}
    >
      <div className="flex h-14 items-center justify-end border-b border-zinc-200 px-2 dark:border-zinc-800">
        <button
          type="button"
          onClick={toggle}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
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
        {nav.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition ${
                collapsed ? "justify-center px-0" : "px-3"
              } ${
                active
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
