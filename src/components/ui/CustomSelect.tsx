"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function CustomSelect({ value, onChange, options, placeholder = "Select...", className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative z-10 min-w-[140px]", className)} ref={containerRef}>
      <button
        type="button"
        className="flex h-10 w-full items-center justify-between rounded-[var(--radius-md)] border border-neutral-200 bg-white px-4 text-body-sm text-neutral-700 hover:bg-neutral-50 focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] transition-all"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption?.label || placeholder}</span>
        <ChevronDown 
            size={16} 
            className={cn("ml-2 text-neutral-400 transition-transform duration-200 shrink-0", isOpen && "rotate-180")} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
            className="absolute left-0 top-[calc(100%+4px)] mt-1 w-full overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-white p-1.5 shadow-[var(--shadow-lg)]"
          >
            <ul className="max-h-60 overflow-y-auto outline-none" role="listbox">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-4 text-body-sm transition-colors",
                      isSelected
                        ? "bg-[var(--color-primary-50)] text-[var(--color-primary-600)] font-medium"
                        : "text-neutral-600 hover:bg-[var(--color-neutral-50)] hover:text-neutral-900"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                        <Check size={14} className="text-[var(--color-primary-500)]" />
                      </span>
                    )}
                    <span className="truncate block w-full">{option.label}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
