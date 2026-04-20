"use client";

import { History, Shield, Settings, Zap, LogOut, Sun, Moon, ShieldAlert, MoreHorizontal, User, ChevronsLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useConsent } from "@/context/ConsentContext";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NAV_ITEMS = [
  { name: "Consent Map", icon: Shield, href: "/" },
  { name: "Activity", icon: History, href: "/activity" },
  { name: "Security Audit", icon: Zap, href: "/audit" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { companies, revokeConsent } = useConsent();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark";
    if (savedTheme) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-neutral-100 bg-white p-6 dark:border-neutral-800 dark:bg-black">
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex items-center justify-between pb-8">
          <div className="flex items-center gap-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-black">
              <Shield size={24} fill="currentColor" fillOpacity={0.2} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter text-neutral-900 dark:text-white">
                Consently
              </h1>
            </div>
          </div>
          <button className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            <ChevronsLeft size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-semibold transition-all",
                  isActive
                    ? "bg-neutral-50 text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
                )}
              >
                <span>{item.name}</span>
                <Icon size={18} className={isActive ? "text-brand-primary" : ""} />
              </Link>
            );
          })}
        </nav>

        {/* Profile / Bottom Action */}
        <div className="relative border-t border-neutral-50 pt-6 dark:border-neutral-800">
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-2 w-full origin-bottom rounded-xl border border-neutral-100 bg-white p-2 shadow-lg dark:border-neutral-800 dark:bg-black"
              >
                <div className="space-y-1">
                  <button
                    onClick={toggleTheme}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
                  >
                    <div className="flex items-center gap-2">
                      {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
                      {theme === "light" ? "Dark Mode" : "Light Mode"}
                    </div>
                    <div className={cn(
                      "h-4 w-8 rounded-full bg-neutral-200 p-0.5 transition-colors dark:bg-neutral-700",
                      theme === "dark" && "bg-brand-primary dark:bg-brand-primary"
                    )}>
                      <div className={cn(
                        "h-3 w-3 rounded-full bg-white transition-transform",
                        theme === "dark" ? "translate-x-4" : "translate-x-0"
                      )} />
                    </div>
                  </button>

                  <Link
                    href="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
                  >
                    <Settings size={14} />
                    Settings
                  </Link>

                  <div className="my-1 border-t border-neutral-50 dark:border-neutral-800" />

                  <button
                    onClick={() => {
                        const highRiskCompanies = companies.filter(c => c.risk === "HIGH" && c.status === "ACTIVE");
                        if (highRiskCompanies.length > 0) {
                          highRiskCompanies.forEach(c => revokeConsent(c.id));
                          // We could add a toast here in the future
                        }
                        setIsDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <ShieldAlert size={14} />
                    Revoke All High-Risk
                  </button>

                  <button
                    onClick={() => {
                        alert("Logging out...");
                        setIsDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
                  >
                    <LogOut size={14} />
                    Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-2 py-3 text-sm font-semibold transition-all",
              isDropdownOpen 
                ? "bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-white" 
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-200"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <User size={16} className="text-neutral-400" />
              </div>
              <span className="truncate text-xs">admin@consently.ai</span>
            </div>
            <MoreHorizontal size={16} className="shrink-0 text-neutral-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}
