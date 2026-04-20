"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/layout/Container";
import { MOCK_HISTORY } from "@/lib/constants";
import { ShieldCheck, ShieldAlert, Shield, Filter, Search, Calendar, ChevronRight } from "lucide-react";
import { PLAIN_LANGUAGE_MAP } from "@/lib/privacy";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ACTION_CONFIG = {
  GRANTED: { 
    icon: ShieldCheck, 
    color: "#10B981", // Emerald 500
    label: "Access Granted",
    bg: "bg-emerald-500/10"
  },
  REVOKED: { 
    icon: ShieldAlert, 
    color: "#EF4444", // Red 500
    label: "Access Revoked",
    bg: "bg-red-500/10"
  },
  UPDATED: { 
    icon: Shield, 
    color: "#F59E0B", // Amber 500
    label: "Settings Updated",
    bg: "bg-amber-500/10"
  },
} as const;

type ActionType = keyof typeof ACTION_CONFIG;

import { useConsent } from "@/context/ConsentContext";

export default function ActivityPage() {
  const { history } = useConsent();
  const [filter, setFilter] = useState<"ALL" | ActionType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchFilter = filter === "ALL" || item.action === filter;
      const matchSearch = item.companyName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [filter, searchQuery]);

  return (
    <main className="min-h-screen bg-[#FDFDFD] dark:bg-black pb-32">
      {/* Header Section */}
      <div className="border-b border-neutral-100 bg-white pt-24 pb-12 dark:bg-neutral-950 dark:border-neutral-900">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800">
                <Calendar size={12} />
                Audit Trail
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white lg:text-6xl">
                Permission History
              </h1>
              <p className="text-base text-neutral-500 max-w-lg leading-relaxed">
                A chronological, jargon-free log of your digital footprint. Monitor exactly when and why your data access changed.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2">
              {(["ALL", "GRANTED", "REVOKED"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-bold transition-all",
                    filter === type
                      ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
                  )}
                >
                  {type === "ALL" && <Filter size={14} />}
                  {type === "GRANTED" && <ShieldCheck size={14} />}
                  {type === "REVOKED" && <ShieldAlert size={14} />}
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Timeline Section */}
          <div className="lg:col-span-8">
            <div className="relative space-y-12 before:absolute before:left-[23px] before:top-2 before:h-[calc(100%-8px)] before:w-[2px] before:bg-neutral-100 dark:before:bg-neutral-800">
              <AnimatePresence mode="popLayout">
                {filteredHistory.map((item, index) => {
                  const config = ACTION_CONFIG[item.action as ActionType] || ACTION_CONFIG.UPDATED;
                  const Icon = config.icon;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      key={item.id}
                      className="relative pl-16 group"
                    >
                      {/* Timeline Indicator */}
                      <div className={cn(
                        "absolute left-0 z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#FDFDFD] shadow-sm transition-transform group-hover:scale-110 dark:border-black",
                        config.bg
                      )}>
                        <Icon size={20} style={{ color: config.color }} />
                      </div>

                      {/* Content Card */}
                      <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-neutral-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900/50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                                {item.companyName}
                              </h3>
                              <div className={cn(
                                "flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider",
                                config.bg
                              )} style={{ color: config.color }}>
                                {config.label}
                              </div>
                            </div>
                            <p className="mt-1 text-sm font-medium text-neutral-400">
                              {item.timestamp}
                            </p>
                          </div>
                          
                          <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:text-neutral-900 dark:hover:text-white">
                            Details <ChevronRight size={14} />
                          </button>
                        </div>

                        {/* Data Types with Explanations */}
                        <div className="mt-6 space-y-3">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                            Affected Data Points
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {item.dataTypes.map((type) => {
                              const explanation = PLAIN_LANGUAGE_MAP[type];
                              return (
                                <div 
                                  key={type}
                                  className="group/tag relative"
                                >
                                  <span className="cursor-help rounded-lg bg-neutral-50 px-3 py-1.5 text-xs font-bold text-neutral-700 transition-colors hover:bg-neutral-900 hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-white dark:hover:text-black">
                                    {type.replace("_", " ")}
                                  </span>
                                  
                                  {/* Tooltip on hover */}
                                  {explanation && (
                                    <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 scale-95 opacity-0 transition-all group-hover/tag:scale-100 group-hover/tag:opacity-100 pointer-events-none z-20">
                                      <div className="rounded-lg bg-neutral-900 p-3 text-[10px] leading-relaxed text-white shadow-xl dark:bg-neutral-800">
                                        {explanation}
                                        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-neutral-900 dark:bg-neutral-800" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredHistory.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-sm font-medium text-neutral-500">No events match your current filter.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Summary */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 rounded-3xl border border-neutral-100 bg-white p-8 shadow-sm dark:border-neutral-900 dark:bg-neutral-950">
              <h4 className="text-lg font-bold text-neutral-900 dark:text-white">Account Security</h4>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                This log is permanent and cannot be modified by third parties. It serves as your official record of data sovereignty.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-4 dark:bg-neutral-900">
                  <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">Total Events</span>
                  <span className="text-sm font-black text-neutral-900 dark:text-white">{MOCK_HISTORY.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Secure Access</span>
                  <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">100% Verified</span>
                </div>
              </div>
              
              <button className="mt-8 w-full rounded-2xl bg-neutral-900 py-4 text-xs font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-black">
                Export Audit Log (PDF)
              </button>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
