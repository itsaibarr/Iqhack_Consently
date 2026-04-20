"use client";

import { History, Shield, Settings, Zap, LogOut, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useConsent } from "@/context/ConsentContext";
import { signOut } from "@/actions/auth";

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
  const { user } = useConsent();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-72 border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] p-6">
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex items-center gap-3 pb-10">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-primary-500)] text-white shadow-sm">
            <Shield size={22} fill="currentColor" fillOpacity={0.2} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              Consently
            </h1>
            <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
              Security Protocol
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex h-10 items-center justify-between rounded-[var(--radius-md)] px-4 text-[13px] font-semibold transition-all",
                  isActive
                    ? "bg-[var(--color-neutral-0)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--text-primary)]"
                )}
              >
                <span>{item.name}</span>
                <Icon size={16} className={isActive ? "text-[var(--color-primary-500)]" : "text-[var(--text-tertiary)]"} />
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 border-t border-[var(--border-subtle)]">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex w-full items-center justify-between rounded-[var(--radius-md)] px-2 py-2 hover:bg-[var(--color-neutral-100)] transition-colors relative"
          >
            <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-500)] text-white">
                <span className="text-[10px] font-bold">
                    {user?.email?.substring(0, 2).toUpperCase() || "US"}
                </span>
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                    <span className="truncate text-[12px] font-bold text-[var(--text-primary)]">
                        {(user?.user_metadata?.full_name as string) || "User Account"}
                    </span>
                    <span className="truncate text-[10px] text-[var(--text-tertiary)]">
                        {user?.email || "No session"}
                    </span>
                </div>
            </div>
            <MoreHorizontal size={16} className="shrink-0 text-[var(--color-neutral-400)]" />

            {/* Simple Logout Dropup */}
            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-0 right-0 mb-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-white p-1 shadow-lg dark:bg-neutral-900"
                    >
                        <button
                            onClick={() => signOut()}
                            className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-[12px] font-semibold text-red-500 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                            <LogOut size={14} />
                            <span>Sign Out</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </aside>
  );
}
