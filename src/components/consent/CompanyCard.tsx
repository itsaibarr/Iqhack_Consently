"use client";

import { motion } from "framer-motion";
import { CompanyRecord } from "@/lib/constants";
import { revokeConsent } from "@/actions/consent";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChevronRight } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CompanyCardProps {
  record: CompanyRecord;
  onRevoke?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, { bg: string, text: string }> = {
  identity: { bg: "var(--datatype-identity)", text: "#3730A3" },
  location: { bg: "var(--datatype-location)", text: "#92400E" },
  financial: { bg: "var(--datatype-financial)", text: "#166534" },
  academic: { bg: "var(--datatype-academic)", text: "#5B21B6" },
  behavioral: { bg: "var(--datatype-behavioral)", text: "#9A3412" },
  health: { bg: "var(--datatype-health)", text: "#831843" },
  biometric: { bg: "var(--datatype-biometric)", text: "#881337" },
  contacts: { bg: "var(--datatype-contacts)", text: "#0C4A6E" },
};

const RISK_CONFIG = {
  HIGH: {
    bg: "var(--risk-high-bg)",
    text: "var(--risk-high-text)",
    border: "var(--risk-high-border)",
    label: "HIGH",
    color: "var(--color-risk-red-500)"
  },
  MEDIUM: {
    bg: "var(--risk-medium-bg)",
    text: "var(--risk-medium-text)",
    border: "var(--risk-medium-border)",
    label: "MEDIUM",
    color: "var(--color-risk-amber-500)"
  },
  LOW: {
    bg: "var(--risk-low-bg)",
    text: "var(--risk-low-text)",
    border: "var(--risk-low-border)",
    label: "LOW",
    color: "var(--color-success-500)"
  },
};

export function CompanyCard({ record, onRevoke, onViewDetails }: CompanyCardProps) {
  const [isRevoking, setIsRevoking] = useState(false);
  const isRevoked = record.status === "REVOKED";
  const config = RISK_CONFIG[record.risk];

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
      className={cn(
        "group relative flex h-[380px] w-full flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-sm transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-md",
        isRevoked && "opacity-60 grayscale bg-[var(--color-neutral-50)]",
        isRevoking && "animate-revoke"
      )}
      style={{
        borderLeft: !isRevoked ? `4px solid ${config.color}` : "4px solid var(--color-neutral-200)"
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div 
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-neutral-50)] font-bold text-lg text-[var(--text-primary)] border border-[var(--border-subtle)]"
          >
            {record.logoUid.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 space-y-0.5">
            <h3 className="text-h4 text-[var(--text-primary)] truncate line-clamp-1">
              {record.name}
            </h3>
            <p className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-widest truncate">
              {record.category}
            </p>
          </div>
        </div>

        <div 
          className="flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-label-sm border"
          style={{ backgroundColor: config.bg, color: config.text, borderColor: config.border }}
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
          {isRevoked ? "REVOKED" : config.label}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 h-[72px] overflow-hidden content-start">
        {record.dataTypes.slice(0, 4).map((dt) => {
          const cat = dt.category.toLowerCase();
          const colors = CATEGORY_COLORS[cat] || { bg: "var(--color-neutral-100)", text: "var(--text-secondary)" };
          return (
            <span 
              key={dt.name}
              className="rounded-[var(--radius-sm)] px-2.5 py-1 text-label-md whitespace-nowrap"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {dt.name.replace("_", " ")}
            </span>
          );
        })}
        {record.dataTypes.length > 4 && (
          <span className="rounded-[var(--radius-sm)] bg-[var(--color-neutral-50)] border border-[var(--border-subtle)] px-2.5 py-1 text-label-md text-[var(--text-tertiary)]">
            +{record.dataTypes.length - 4} more
          </span>
        )}
      </div>

      <div className="space-y-1.5">
          <p className="text-body-sm text-[var(--text-secondary)] line-clamp-2">
            Shared with: <span className="font-semibold text-[var(--text-primary)]">
              {record.sharedWith.slice(0, 3).join(", ")}
              {record.sharedWith.length > 3 && ` and ${record.sharedWith.length - 3} others`}
            </span>
          </p>
          <p className="text-mono-sm text-[var(--text-tertiary)] font-medium">
            Connected: {record.connectedAt.split("T")[0]}
          </p>
      </div>

      <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button 
            onClick={() => onViewDetails?.(record.id)}
            className="text-label-md font-bold text-[var(--text-link)] hover:underline flex items-center gap-1"
          >
            View Details <ChevronRight size={14} />
          </button>
          
          {record.status === "ACTIVE" ? (
            <button
              onClick={handleRevoke}
              disabled={isRevoking}
              className="rounded-[var(--radius-md)] bg-[var(--color-risk-red-50)] border border-[var(--color-risk-red-100)] px-4 py-2 text-label-md font-bold text-[var(--risk-high-text)] transition-all hover:bg-[var(--color-risk-red-600)] hover:text-white hover:border-transparent active:scale-95"
            >
              {isRevoking ? "Revoking..." : "Revoke"}
            </button>
          ) : (
             <div className="text-label-sm font-black uppercase tracking-widest text-[var(--text-tertiary)]">
                Revoked
             </div>
          )}
      </div>
    </motion.div>

  );
}
