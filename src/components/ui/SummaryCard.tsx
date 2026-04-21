import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SummaryCardProps {
  label: string;
  value: React.ReactNode;
  detail: string;
  isRisk?: boolean;
  className?: string;
}

export function SummaryCard({ 
  label, 
  value, 
  detail,
  isRisk,
  className
}: SummaryCardProps) {
  return (
    <div className={cn(
      "group relative flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.06)] transition-all hover:shadow-md",
      className
    )}>
      <span className="text-display-lg font-bold text-neutral-900 leading-none">
        {value}
      </span>
      <span className="mt-2 text-body-sm font-medium text-neutral-600">
        {label}
      </span>
      <span className={cn(
        "mt-1 text-label-sm tracking-tight",
        isRisk ? "text-[var(--color-risk-red-500)] font-bold" : "text-neutral-400"
      )}>
        {isRisk && "⚠ "}{detail}
      </span>
    </div>
  );
}
