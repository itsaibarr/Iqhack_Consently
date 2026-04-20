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
        "group relative flex flex-col gap-6 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 shadow-sm transition-all hover:bg-[var(--bg-card-hover)] hover:shadow-md",
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
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-neutral-50)] font-bold text-lg text-[var(--text-primary)] border border-[var(--border-subtle)]"
          >
            {record.logoUid.substring(0, 2).toUpperCase()}
          </div>
          <div className="space-y-0.5">
            <h3 className="text-h4 text-[var(--text-primary)]">
              {record.name}
            </h3>
            <p className="text-[11px] font-medium text-[var(--text-secondary)] uppercase tracking-widest">
              {record.category}
            </p>
          </div>
        </div>

        <div 
          className="flex items-center rounded-full px-2.5 py-0.5 text-label-sm border"
          style={{ backgroundColor: config.bg, color: config.text, borderColor: config.border }}
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
          {isRevoked ? "REVOKED" : config.label}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {record.dataTypes.map((dt) => {
          const cat = dt.category.toLowerCase();
          const colors = CATEGORY_COLORS[cat] || { bg: "var(--color-neutral-100)", text: "var(--text-secondary)" };
          return (
            <span 
              key={dt.name}
              className="rounded-[var(--radius-sm)] px-2.5 py-1 text-label-md"
              style={{ backgroundColor: colors.bg, color: colors.text }}
            >
              {dt.name.replace("_", " ")}
            </span>
          );
        })}
      </div>

      <div className="space-y-1">
          <p className="text-body-sm text-[var(--text-secondary)]">
            Shared with: <span className="font-medium">{record.sharedWith.join(", ")}</span>
          </p>
          <p className="text-mono-sm text-[var(--text-tertiary)]">
            Connected: {record.connectedAt}
          </p>
      </div>

      <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button 
            onClick={() => onViewDetails?.(record.id)}
            className="text-label-md font-medium text-[var(--text-link)] hover:underline flex items-center gap-1"
          >
            View Details <ChevronRight size={14} />
          </button>
          
          {record.status === "ACTIVE" ? (
            <button
              onClick={handleRevoke}
              disabled={isRevoking}
              className="rounded-[var(--radius-md)] bg-[var(--color-risk-red-50)] border border-[var(--color-risk-red-100)] px-4 py-2 text-label-md font-semibold text-[var(--risk-high-text)] transition-all hover:bg-[var(--interactive-danger)] hover:text-white hover:border-transparent"
            >
              {isRevoking ? "Revoking..." : "Revoke"}
            </button>
          ) : (
             <div className="text-label-sm font-bold text-[var(--text-tertiary)]">
                Revoked
             </div>
          )}
      </div>
    </motion.div>
  );
}
