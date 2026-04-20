"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, ShieldCheck, ExternalLink, Trash2 } from "lucide-react";
import { PLAIN_LANGUAGE_MAP } from "@/lib/privacy";
import { RISK_CONFIG_MAP } from "@/lib/constants";

interface ServiceDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  service: {
    id: string;
    name: string;
    risk: "LOW" | "MEDIUM" | "HIGH";
    dataTypes: { name: string; category: string }[];
    description: string;
  } | null;
  onRevoke: (id: string) => void;
}

export function ServiceDetailDrawer({
  isOpen,
  onClose,
  service,
  onRevoke,
}: ServiceDetailDrawerProps) {
  if (!service) return null;

  const riskConfig = RISK_CONFIG_MAP[service.risk];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0F1115] border-l border-white/10 z-[60] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-lg">
                  {service.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{service.name}</h2>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: riskConfig.color }}
                    />
                    <span className="text-xs font-medium uppercase tracking-wider" style={{ color: riskConfig.color }}>
                      {service.risk} Risk
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors group"
              >
                <X className="w-6 h-6 text-white/40 group-hover:text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Privacy Summary */}
              <section>
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-4">
                  What they know
                </h3>
                <div className="space-y-4">
                  {(service.dataTypes || []).map((item) => (
                    <div key={item.name} className="flex gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-[#00A3FF]" />
                      </div>
                      <div>
                        <p className="font-medium text-white capitalize">
                          {item.name.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-white/60 leading-relaxed mt-1">
                          {PLAIN_LANGUAGE_MAP[item.name] || "General data collection for service operational needs."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Impact Analysis */}
              <section className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <ShieldAlert className="w-5 h-5" />
                  <h3 className="font-bold">Privacy Impact</h3>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">
                  {service.risk === "HIGH" 
                    ? "This service has wide-reaching permissions that could be used to build a comprehensive profile of your daily life and identity."
                    : service.risk === "MEDIUM"
                    ? "Significant data is collected, primarily for service functionality, but with potential for secondary usage or advertising profiling."
                    : "Minimal data collection focused on essential service delivery. Generally considered safe for casual use."}
                </p>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10 space-y-3 bg-[#0F1115]">
              <button
                onClick={() => onRevoke(service.id)}
                className="w-full py-4 bg-[#FF4D4D] hover:bg-[#FF3333] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 active:scale-[0.98]"
              >
                <Trash2 className="w-5 h-5" />
                Disconnect & Revoke
              </button>
              <button
                onClick={onClose}
                className="w-full py-4 text-white/40 hover:text-white font-medium transition-colors"
              >
                Keep for now
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
