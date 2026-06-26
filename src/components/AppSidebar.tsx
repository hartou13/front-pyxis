"use client";

import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Wallet, ArrowUpDown, Settings, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import { clearSession, getSession } from "@/lib/session";
import { apiClient } from "@/lib/api-client";

const STORAGE_KEY = "pyxis_sidebar_collapsed";

type NavItem = { href: string; label: string; Icon: React.ComponentType<{ className?: string }> };

const nav: NavItem[] = [
  { href: "/welcome", label: "Welcome", Icon: Home },
  { href: "/accounts", label: "Accounts", Icon: Wallet },
  { href: "/transactions", label: "Transactions", Icon: ArrowUpDown },
  { href: "/parameters", label: "Parameters", Icon: Settings },
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

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogoff() {
    setLoggingOut(true);
    try {
      const session = getSession();
      if (session) {
        await apiClient.post(
          "/auth/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${session.token}`,
            },
          }
        );
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Logout error:", err.response?.data ?? err.message);
      } else if (err instanceof Error) {
        console.error("Logout error:", err.message);
      }
    } finally {
      clearSession();
      router.push("/login");
    }
  }

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 ease-out dark:border-slate-800 dark:bg-slate-900 ${
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
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
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

      <div className="border-t border-slate-200 p-2 dark:border-slate-800">
        <button
          type="button"
          onClick={() => void handleLogoff()}
          disabled={loggingOut}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center gap-3 rounded-lg py-2.5 text-sm font-medium transition ${
            collapsed ? "justify-center px-0" : "px-3"
          } text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed dark:text-slate-300 dark:hover:bg-slate-800`}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span
            className={`truncate transition-opacity duration-200 ${
              collapsed ? "sr-only" : "opacity-100"
            }`}
          >
            {loggingOut ? "Logging out…" : "Logout"}
          </span>
        </button>
      </div>
    </aside>
  );
}
