"use client";

import { History, Shield, Settings, Zap, LogOut, MoreHorizontal, Globe, User as UserIcon, ChevronLeft, ChevronRight } from "lucide-react";
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
  { name: "Live Map", icon: Globe, href: "/map" },
  { name: "Activity", icon: History, href: "/activity" },
  { name: "Security Audit", icon: Zap, href: "/audit" },
];

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useConsent();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <motion.aside 
        initial={false}
        animate={{ width: isCollapsed ? 80 : 288 }}
        className="fixed left-0 top-0 z-40 h-screen border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)] p-4 flex flex-col"
    >
      <div className="flex h-full flex-col">
        {/* Brand */}
        <div className="flex items-center justify-between pb-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-primary-500)] text-white shadow-sm">
              <Shield size={22} fill="currentColor" fillOpacity={0.2} />
            </div>
            {!isCollapsed && (
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-lg font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap"
              >
                Consently
              </motion.h1>
            )}
          </div>
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-tertiary)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--text-primary)] transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
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
                  "flex h-10 items-center rounded-[var(--radius-md)] px-3 text-[13px] font-semibold transition-all",
                  isCollapsed ? "justify-center" : "justify-between",
                  isActive
                    ? "bg-[var(--color-neutral-0)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-secondary)] hover:bg-[var(--color-neutral-100)] hover:text-[var(--text-primary)]"
                )}
              >
                {!isCollapsed && <span className="truncate">{item.name}</span>}
                <Icon size={16} className={cn(
                    "shrink-0",
                    isActive ? "text-[var(--color-primary-500)]" : "text-[var(--text-tertiary)]"
                )} />
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 border-t border-[var(--border-subtle)]">
          <div className="relative">
            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={cn(
                            "absolute bottom-full mb-2 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white p-1.5 shadow-lg",
                            isCollapsed ? "left-full ml-2 w-48" : "left-0 right-0"
                        )}
                    >
                        <Link
                            href="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-[12px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--color-neutral-50)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <UserIcon size={14} />
                            <span>View Profile</span>
                        </Link>
                        <Link
                            href="/settings"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-[12px] font-semibold text-[var(--text-secondary)] hover:bg-[var(--color-neutral-50)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <Settings size={14} />
                            <span>Settings</span>
                        </Link>
                        <div className="my-1 h-[1px] bg-[var(--border-subtle)]" />
                        <button
                            onClick={() => signOut()}
                            className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={14} />
                            <span>Sign Out</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={cn(
                    "flex w-full items-center rounded-[var(--radius-md)] py-2 px-2 transition-all overflow-hidden",
                    isCollapsed ? "justify-center" : "justify-between",
                    isDropdownOpen ? "bg-[var(--color-neutral-100)]" : "hover:bg-[var(--color-neutral-100)]"
                )}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-500)] text-white shadow-sm font-bold text-[10px]">
                        {user?.email?.substring(0, 2).toUpperCase() || "US"}
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col items-start overflow-hidden">
                            <span className="truncate text-[12px] font-bold text-[var(--text-primary)]">
                                {(user?.user_metadata?.full_name as string) || "User Account"}
                            </span>
                            <span className="truncate text-[10px] text-[var(--text-tertiary)]">
                                {user?.email || "No session"}
                            </span>
                        </div>
                    )}
                </div>
                {!isCollapsed && (
                    <MoreHorizontal 
                        size={16} 
                        className={cn(
                            "shrink-0 transition-transform", 
                            isDropdownOpen && "rotate-90 text-[var(--color-primary-500)]"
                        )} 
                    />
                )}
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}
