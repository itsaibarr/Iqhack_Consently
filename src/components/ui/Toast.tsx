"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, X } from "lucide-react";

export interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error";
}

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, showToast, dismiss };
}

interface ToastContainerProps {
  toasts: ToastItem[];
  dismiss: (id: number) => void;
}

export function ToastContainer({ toasts, dismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="pointer-events-auto flex items-center gap-3 rounded-[var(--radius-lg)] border bg-white px-4 py-3 shadow-lg min-w-[280px] max-w-sm"
            style={{
              borderColor: toast.type === "success" ? "var(--color-success-100)" : "var(--color-risk-red-100)",
            }}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="shrink-0" style={{ color: "var(--color-success-500)" }} />
            ) : (
              <XCircle size={18} className="shrink-0" style={{ color: "var(--color-risk-red-500)" }} />
            )}
            <p className="flex-1 text-[13px] font-medium text-neutral-800">{toast.message}</p>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 rounded p-0.5 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
