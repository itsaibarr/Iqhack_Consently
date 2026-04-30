"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Plus, Building2 } from "lucide-react";

interface ConnectServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (name: string, url: string) => void;
}

export function ConnectServiceModal({ isOpen, onClose, onConnect }: ConnectServiceModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (prevIsOpen !== isOpen) {
    if (!isOpen) {
      setName("");
      setUrl("");
    }
    setPrevIsOpen(isOpen);
  }

  // Focus trap & Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Add simple https:// prefix if missing for URL
    let finalUrl = url.trim();
    if (finalUrl && !finalUrl.startsWith("http")) {
      finalUrl = `https://${finalUrl}`;
    }

    onConnect(name.trim(), finalUrl);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="connect-modal-title"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-xl)] bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-500)]">
                  <Globe size={20} />
                </div>
                <h2 id="connect-modal-title" className="text-h4 text-neutral-900">
                  Connect Service
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-md p-2 text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-colors"
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="service-name" className="mb-1.5 block text-label-sm text-neutral-700">
                    Service Name *
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      id="service-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Acme Corp"
                      className="w-full rounded-[var(--radius-md)] border border-neutral-200 py-2.5 pl-10 pr-4 text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="service-url" className="mb-1.5 block text-label-sm text-neutral-700">
                    Website URL (Optional)
                  </label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      id="service-url"
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="e.g. acme.com"
                      className="w-full rounded-[var(--radius-md)] border border-neutral-200 py-2.5 pl-10 pr-4 text-body-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--color-primary-500)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost flex-1 border border-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus size={16} />
                  Connect
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
