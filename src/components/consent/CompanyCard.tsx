"use client";

import { motion } from "framer-motion";
import { CompanyRecord } from "@/lib/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChevronRight, ShieldAlert, ShieldCheck, Shield, RotateCcw } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CompanyCardProps {
  record: CompanyRecord;
  onRevoke?: (id: string) => void;
  onReconnect?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const RISK_CONFIG = {
  HIGH: {
    bg: "var(--risk-high-bg)",
    text: "var(--risk-high-text)",
    border: "var(--risk-high-border)",
    label: "HIGH",
    color: "var(--color-risk-red-500)",
    icon: ShieldAlert,
  },
  MEDIUM: {
    bg: "var(--risk-medium-bg)",
    text: "var(--risk-medium-text)",
    border: "var(--risk-medium-border)",
    label: "MEDIUM",
    color: "var(--color-risk-amber-500)",
    icon: Shield,
  },
  LOW: {
    bg: "var(--risk-low-bg)",
    text: "var(--risk-low-text)",
    border: "var(--risk-low-border)",
    label: "LOW",
    color: "var(--color-success-500)",
    icon: ShieldCheck,
  },
};

export function CompanyCard({ record, onRevoke, onReconnect, onViewDetails }: CompanyCardProps) {
  const isRevoked = record.status === "REVOKED";
  const config = RISK_CONFIG[record.risk];
  const RiskIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: isRevoked ? 0 : -2 }}
      className={cn(
        "group relative flex h-[340px] w-full flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-sm transition-all",
        isRevoked
          ? "opacity-60 grayscale bg-[var(--color-neutral-50)]"
          : "hover:bg-[var(--bg-card-hover)] hover:shadow-md"
      )}
    >
      {/* Top Header: Logo + Title + Risk */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center font-bold text-white shadow-sm"
          style={{ backgroundColor: "var(--color-primary-500)" }}
        >
          {record.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[16px] font-semibold text-[var(--text-primary)] truncate">
              {record.name}
            </h3>
            <div
              className="flex-shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: config.bg, color: config.text, border: `1px solid ${config.border}` }}
            >
              <RiskIcon size={12} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
            </div>
          </div>
          <p className="text-[13px] text-[var(--text-secondary)] mt-0.5">{record.category}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Data Types */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {record.dataTypes.slice(0, 4).map((dt) => (
            <span
              key={dt.name}
              className="flex items-center rounded-[var(--radius-sm)] bg-[var(--color-neutral-50)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-secondary)] flex-shrink-0 border border-[var(--border-subtle)]"
            >
              {dt.name.replace("_", " ")}
            </span>
          ))}
          {record.dataTypes.length > 4 && (
            <span className="flex items-center rounded-[var(--radius-sm)] bg-[var(--color-neutral-50)] px-2.5 py-1 text-[12px] font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              +{record.dataTypes.length - 4}
            </span>
          )}
        </div>

        {/* Shared With / Meta */}
        <div className="space-y-1 mb-4">
          {record.sharedWith.length > 0 && (
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
              <span className="font-medium text-[var(--text-primary)]">Shared with:</span>{" "}
              {record.sharedWith.slice(0, 3).join(", ")}
              {record.sharedWith.length > 3 ? "..." : ""}
            </p>
          )}
          <p className="text-[12px] text-[var(--text-tertiary)] font-mono mt-1 pt-1">
            Connected: {record.connectedAt}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--border-subtle)]">
        {/* Left side */}
        {isRevoked ? (
          <button
            onClick={() => onReconnect?.(record.id)}
            className="text-[13px] font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw size={13} strokeWidth={2.5} />
            Reconnect
          </button>
        ) : (
          <button
            onClick={() => onViewDetails?.(record.id)}
            className="text-[13px] font-medium text-[var(--color-primary-500)] hover:text-[var(--color-primary-600)] flex items-center gap-1 transition-colors"
          >
            View Details <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        )}

        {/* Right side */}
        {isRevoked ? (
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] flex items-center gap-1.5">
            <ShieldCheck size={14} /> Revoked
          </div>
        ) : (
          record.status === "ACTIVE" && (
            <button
              onClick={() => onRevoke?.(record.id)}
              className="rounded-[var(--radius-md)] bg-[var(--color-risk-red-50)] border border-[var(--color-risk-red-100)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--color-risk-red-600)] transition-all hover:bg-[var(--color-risk-red-500)] hover:text-white hover:border-transparent active:scale-95"
            >
              Revoke
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}
