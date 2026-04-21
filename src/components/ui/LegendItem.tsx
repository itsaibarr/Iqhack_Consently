import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LegendItemProps {
  color: string;
  label: string;
  animate?: boolean;
  className?: string;
}

export function LegendItem({ color, label, animate, className }: LegendItemProps) {
  return (
    <div className={cn("flex items-center gap-4 group cursor-default", className)}>
      <div 
        className={cn(
          "h-2.5 w-2.5 rounded-full ring-4 ring-offset-2 ring-transparent transition-all group-hover:ring-neutral-100", 
          animate && "animate-pulse"
        )} 
        style={{ backgroundColor: color }} 
      />
      <span className="text-label-sm text-neutral-500">{label}</span>
    </div>
  );
}
