"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/layout/Container";
import { ShieldCheck, ShieldAlert, Shield, Filter, Calendar, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ACTION_CONFIG = {
  GRANTED: { 
    icon: ShieldCheck, 
    color: "var(--color-success-500)",
    label: "Access Granted",
    bg: "var(--color-success-50)"
  },
  REVOKED: { 
    icon: ShieldAlert, 
    color: "var(--color-risk-red-500)",
    label: "Access Revoked",
    bg: "var(--color-risk-red-50)"
  },
  UPDATED: { 
    icon: Shield, 
    color: "var(--color-risk-amber-500)",
    label: "Settings Updated",
    bg: "var(--color-risk-amber-50)"
  },
} as const;

type ActionType = keyof typeof ACTION_CONFIG;

import { useConsent } from "@/context/ConsentContext";
import { RevokeConfirmModal } from "@/components/consent/RevokeConfirmModal";
import { ServiceDetailView } from "@/components/consent/ServiceDetailView";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { CompanyRecord } from "@/lib/constants";

export default function ActivityPage() {
  const { history, companies, revokeConsent, reconnectService, user } = useConsent();
  const { toasts, showToast, dismiss } = useToast();
  
  const [filter, setFilter] = useState<"ALL" | ActionType>("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Revocation state if needed in detail view
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      return filter === "ALL" || item.action === filter;
    });
  }, [filter, history]);

  const selectedService = companies.find(c => c.id === selectedId) ?? null;
  const pendingService = companies.find((c) => c.id === pendingRevokeId) ?? null;

  const handleRevokeConfirm = async (reason?: string) => {
    if (!pendingRevokeId) return;
    setIsRevoking(true);
    const { success } = await revokeConsent(pendingRevokeId, reason);
    setIsRevoking(false);
    setPendingRevokeId(null);
    setSelectedId(null);
    showToast(
      success ? "Access revoked successfully." : "Failed to revoke access.",
      success ? "success" : "error"
    );
  };

  const handleReconnect = async (id: string) => {
    const { success } = await reconnectService(id);
    showToast(
      success ? "Service reconnected." : "Failed to reconnect.",
      success ? "success" : "error"
    );
  };

  const handleDownloadHistory = () => {
    if (history.length === 0) {
      showToast("No history to download.", "error");
      return;
    }

    const reportHeader = `CONSENTLY SECURITY AUDIT REPORT\nGenerated: ${new Date().toLocaleString()}\nUser: ${user?.email || "Demo User"}\n-------------------------------------------\n\n`;
    const reportBody = history.map(item => {
      return `[${item.timestamp}] ${item.companyName}\nAction: ${item.action}\nData Shared: ${item.dataTypes.join(", ")}\nReason: ${item.reason || "N/A"}\n-------------------------------------------`;
    }).join("\n\n");

    const fullReport = reportHeader + reportBody;
    const blob = new Blob([fullReport], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `consently-audit-log-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("Audit log exported successfully.", "success");
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-32">
      <AnimatePresence mode="wait">
        {selectedId && selectedService ? (
          <ServiceDetailView
            key="detail"
            service={selectedService as CompanyRecord}
            onBack={() => setSelectedId(null)}
            onRevoke={(id) => setPendingRevokeId(id)}
            onReconnect={handleReconnect}
          />
        ) : (
          <motion.div
            key="activity-main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
      {/* Header Section */}
      <div className="border-b border-neutral-100 bg-white pt-24 pb-12">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-label-sm text-neutral-500">
                <Calendar size={12} />
                Your History
              </div>
              <h1 className="text-display-lg text-neutral-900">
                Permission History
              </h1>
              <p className="text-body-md text-neutral-500 max-w-lg">
                Your complete history of your data. See exactly when and why services accessed your information.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2">
              {(["ALL", "GRANTED", "REVOKED"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-4 py-2 text-label-md transition-all",
                    filter === type
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
                  )}
                >
                  {type === "ALL" && <Filter size={14} />}
                  {type === "GRANTED" && <ShieldCheck size={14} />}
                  {type === "REVOKED" && <ShieldAlert size={14} />}
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Timeline Section */}
          <div className="lg:col-span-8">
            <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-8px)] before:w-[1px] before:bg-neutral-100">
              <AnimatePresence mode="popLayout">
                {filteredHistory.map((item, index) => {
                  const config = ACTION_CONFIG[item.action as ActionType] || ACTION_CONFIG.UPDATED;

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: index * 0.03 }}
                      key={item.id}
                      className="relative pl-12 group"
                    >
                      {/* Timeline Indicator - 8px dot as per spec */}
                      <div className="absolute left-[15px] top-[22px] z-10 flex h-2 w-2 items-center justify-center rounded-full ring-4 ring-white bg-white">
                        <div 
                          className="h-2 w-2 rounded-full" 
                          style={{ backgroundColor: config.color }} 
                        />
                      </div>

                      {/* Content Card */}
                      <div className="rounded-[var(--radius-lg)] border border-transparent bg-transparent p-4 transition-all hover:bg-white hover:border-neutral-100 hover:shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                             <div className="flex items-center gap-3">
                              <h3 className="text-h4 text-neutral-900">
                                {item.companyName}
                              </h3>
                              <div 
                                className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-label-sm border"
                                style={{ backgroundColor: config.bg, color: config.color, borderColor: "transparent" }}
                              >
                                {config.label}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-mono-sm text-neutral-400">
                            {item.timestamp}
                          </p>
                        </div>

                        {/* Plain Language Summary */}
                        <div className="mt-4">
                          <p className="text-body-sm text-neutral-600 leading-relaxed">
                            {item.action === "GRANTED" 
                              ? `You gave ${item.companyName} access to your ${item.dataTypes.join(", ").replace(/_/g, " ")}.`
                              : `${item.companyName}'s access to your ${item.dataTypes.join(", ").replace(/_/g, " ")} was revoked.`
                            }
                          </p>
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            {item.dataTypes.map((type) => (
                              <span 
                                key={type}
                                className="rounded-[var(--radius-sm)] bg-neutral-50 px-2 py-0.5 text-label-sm text-neutral-500"
                              >
                                {type.replace("_", " ")}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={() => {
                                const relatedCompany = companies.find(c => 
                                    c.name.toLowerCase().trim() === item.companyName.toLowerCase().trim()
                                );
                                if (relatedCompany) {
                                    setSelectedId(relatedCompany.id);
                                } else {
                                    showToast("Service details no longer available.", "error");
                                }
                            }}
                            className="flex items-center gap-1 text-label-sm text-neutral-400 transition-colors hover:text-neutral-900"
                          >
                            Details <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredHistory.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-body-sm text-neutral-500">No events match your current filter.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Summary */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 rounded-[var(--radius-lg)] border border-neutral-100 bg-white p-8 shadow-sm">
              <h4 className="text-h3 text-neutral-900">Account Security</h4>
              <p className="mt-2 text-body-sm text-neutral-500">
                This log is permanent and cannot be modified by third parties. It serves as your official record of your data privacy.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-neutral-50 p-4">
                  <span className="text-label-md text-neutral-600">Total Events</span>
                  <span className="text-h4 text-neutral-900">{history.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-success-50)] p-4">
                  <span className="text-label-md text-[var(--color-success-500)]">Secure Access</span>
                  <span className="text-h4 text-[var(--color-success-500)]">100% Verified</span>
                </div>
              </div>
              
              <button 
                onClick={handleDownloadHistory}
                className="btn-primary mt-8 w-full"
              >
                Download History (PDF)
              </button>
            </div>
          </div>
        </div>
      </Container>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Revoke confirmation modal */}
      {pendingService && (
        <RevokeConfirmModal
          isOpen={!!pendingRevokeId}
          mode="single"
          service={pendingService as CompanyRecord}
          onConfirm={handleRevokeConfirm}
          onCancel={() => setPendingRevokeId(null)}
          isLoading={isRevoking}
        />
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </main>
  );
}
