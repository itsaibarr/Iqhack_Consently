"use client";

import { motion } from "framer-motion";
import { Shield, ShieldAlert, ShieldCheck, ChevronRight, Share2, Info } from "lucide-react";
import { CompanyRecord } from "@/lib/constants";
import { revokeConsent } from "@/actions/consent";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CompanyCardProps {
  record: CompanyRecord;
  onRevoke?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const CATEGORY_COLORS = {
  PII: { bg: "var(--tag-pii-bg)", border: "var(--tag-pii-border)" },
  HEALTH: { bg: "var(--tag-health-bg)", border: "var(--tag-health-border)" },
  FINANCIAL: { bg: "var(--tag-financial-bg)", border: "var(--tag-financial-border)" },
  DIGITAL: { bg: "var(--tag-digital-bg)", border: "var(--tag-digital-border)" },
  SOCIAL: { bg: "var(--tag-social-bg)", border: "var(--tag-social-border)" },
};

const RISK_CONFIG = {
  HIGH: {
    icon: ShieldAlert,
    bg: "var(--status-risk-high-bg)",
    border: "var(--status-risk-high)",
    text: "var(--status-risk-high-text)",
    label: "High Risk",
  },
  MEDIUM: {
    icon: Shield,
    bg: "var(--status-risk-medium-bg)",
    border: "var(--status-risk-medium)",
    text: "var(--status-risk-medium-text)",
    label: "Medium Risk",
  },
  LOW: {
    icon: ShieldCheck,
    bg: "var(--status-risk-low-bg)",
    border: "var(--status-risk-low)",
    text: "var(--status-risk-low-text)",
    label: "Low Risk",
  },
};

export function CompanyCard({ record, onRevoke, onViewDetails }: CompanyCardProps) {
  const [isRevoking, setIsRevoking] = useState(false);
  const config = RISK_CONFIG[record.risk];
  const Icon = config.icon;

  const handleRevoke = async () => {
    setIsRevoking(true);
    if (onRevoke) {
      await onRevoke(record.id);
    } else {
      await revokeConsent(record.id);
    }
    setIsRevoking(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative flex flex-col gap-4 rounded-[12px] border border-neutral-100 bg-white p-5 shadow-sm transition-all hover:border-neutral-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-50 font-mono text-[10px] font-bold uppercase dark:bg-neutral-800"
          >
            {record.logoUid.substring(0, 2)}
          </div>
          <div className="space-y-0.5">
            <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
              {record.name}
            </h3>
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest">
              {record.category}
            </p>
          </div>
        </div>

        <div 
          className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: config.bg, color: config.text }}
        >
          <Icon size={12} />
          {config.label}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        {record.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {record.dataTypes.map((dt) => {
          const colors = CATEGORY_COLORS[dt.category];
          return (
            <span 
              key={dt.name}
              className="rounded-[6px] border px-2 py-0.5 text-[10px] font-bold text-neutral-800 dark:text-neutral-200"
              style={{ backgroundColor: colors.bg, borderColor: colors.border }}
            >
              {dt.name.replace("_", " ")}
            </span>
          );
        })}
      </div>

      <div className="mt-auto space-y-4 pt-4">
        <div className="flex items-center justify-between border-t border-neutral-50 pt-4 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Share2 size={12} className="text-neutral-400" />
            <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-tight">
              Shared with {record.sharedWith.length} entities
            </p>
          </div>
          <button 
            onClick={() => onViewDetails?.(record.id)}
            className="text-neutral-300 hover:text-neutral-500 transition-colors"
          >
            <Info size={14} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] text-neutral-400">
            SECURED: {record.connectedAt}
          </span>
          {record.status === "ACTIVE" ? (
            <button
              onClick={handleRevoke}
              disabled={isRevoking}
              className="group/btn flex items-center gap-1.5 rounded-[8px] bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-brand-primary disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-brand-primary dark:hover:text-white"
            >
              {isRevoking ? "Updating..." : "Revoke Access"}
              <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-[8px] bg-neutral-50 px-3 py-1.5 text-xs font-bold text-neutral-400 dark:bg-neutral-800">
              <ShieldCheck size={14} className="text-brand-primary" />
              Sovereignty Restored
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
