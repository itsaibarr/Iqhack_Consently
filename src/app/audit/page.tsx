"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { useConsent } from "@/context/ConsentContext";
import { Zap, AlertTriangle, ShieldCheck, History, ArrowRight, ExternalLink, Info, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { RevokeConfirmModal } from "@/components/consent/RevokeConfirmModal";
import { ServiceDetailView } from "@/components/consent/ServiceDetailView";
import { useToast, ToastContainer } from "@/components/ui/Toast";
import { CompanyRecord } from "@/lib/constants";

export default function AuditPage() {
  const { companies, history, revokeConsent, reconnectService } = useConsent();
  const { toasts, showToast, dismiss } = useToast();

  const [filterMode, setFilterMode] = useState<"ALL" | "HIGH_RISK">("ALL");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [isAutoAuditActive, setIsAutoAuditActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const activeHighRisk = companies.filter(c => c.risk === "HIGH" && c.status === "ACTIVE");
  const displayRisks = filterMode === "HIGH_RISK" 
    ? activeHighRisk 
    : companies.filter(c => c.status === "ACTIVE" && (c.risk === "HIGH" || c.risk === "MEDIUM"));

  const recentEvents = history.slice(0, 10);

  const selectedService = companies.find(c => c.id === selectedServiceId) ?? null;
  const pendingService = companies.find(c => c.id === pendingRevokeId) ?? null;

  const handleRevokeConfirm = async (reason?: string) => {
    if (!pendingRevokeId) return;
    setIsRevoking(true);
    const { success } = await revokeConsent(pendingRevokeId, reason);
    setIsRevoking(false);
    setPendingRevokeId(null);
    setSelectedServiceId(null);
    showToast(
      success ? "Access revoked successfully." : "Failed to revoke access.",
      success ? "success" : "error"
    );
  };

  const handleAutoAuditToggle = () => {
    if (isAutoAuditActive) {
      setIsAutoAuditActive(false);
      showToast("Continuous monitoring disabled.", "success");
      return;
    }

    setIsScanning(true);
    // Simulate a deep scan
    setTimeout(() => {
      setIsScanning(false);
      setIsAutoAuditActive(true);
      showToast("Security scan complete. Continuous monitoring active.", "success");
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-32">
      <AnimatePresence mode="wait">
        {selectedServiceId && selectedService ? (
          <ServiceDetailView 
            key="detail"
            service={selectedService as CompanyRecord}
            onBack={() => setSelectedServiceId(null)}
            onRevoke={(id) => setPendingRevokeId(id)}
            onReconnect={async (id) => {
                const { success } = await reconnectService(id);
                showToast(
                    success ? "Service reconnected." : "Failed to reconnect.",
                    success ? "success" : "error"
                );
            }}
          />
        ) : (
          <motion.div
            key="audit-main"
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
                <Zap size={12} className="text-amber-500" />
                Privacy Health Check
              </div>
              <h1 className="text-display-lg text-neutral-900">
                Privacy Health Check
              </h1>
              <p className="text-body-md text-neutral-500 max-w-lg">
                Deep analysis of service risks and your personal data history.
              </p>
            </div>

            <div className="flex items-center gap-2">
                <button 
                    onClick={() => setFilterMode(filterMode === "ALL" ? "HIGH_RISK" : "ALL")}
                    className={`btn-ghost flex items-center gap-2 px-6 py-2 border transition-all rounded-lg h-12 ${
                        filterMode === "HIGH_RISK" 
                        ? "bg-neutral-900 text-white border-neutral-900 hover:bg-neutral-800" 
                        : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                    }`}
                >
                    <Filter size={16} />
                    {filterMode === "HIGH_RISK" ? "Showing High Risk" : "Filter Report"}
                </button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="mt-16">
        <div className="flex flex-col gap-12">

          {/* Core Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard 
                label="Potential Risks" 
                value={activeHighRisk.length} 
                detail="High-risk services"
                isRisk={activeHighRisk.length > 0}
            />
            <SummaryCard 
                label="Recent Activity" 
                value={history.length} 
                detail="Past 30 days"
            />
            <SummaryCard 
                label="Trusted Services" 
                value={companies.filter(c => c.risk === "LOW" && c.status === "ACTIVE").length} 
                detail="Verified safe"
            />
            <SummaryCard 
                label="Privacy Health" 
                value="94%" 
                detail="Overall safety"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Risk Assessment Analysis */}
            <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center gap-6">
                    <h2 className="text-label-sm text-neutral-400 uppercase tracking-widest shrink-0">
                        {filterMode === "HIGH_RISK" ? "High Risk Priority" : "Assessment Analysis"}
                    </h2>
                    <div className="h-[1px] flex-1 bg-neutral-100" />
                </div>

                <div className="space-y-4">
                    {displayRisks.length > 0 ? (
                        displayRisks.map((service) => (
                            <motion.div 
                                key={service.id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex flex-col md:flex-row items-center gap-6 p-6 rounded-[var(--radius-xl)] border transition-all group ${
                                    service.risk === "HIGH" 
                                    ? "border-red-100 bg-red-50/10 hover:bg-red-50/20" 
                                    : "border-neutral-100 bg-white hover:bg-neutral-50/50"
                                }`}
                            >
                                <div className={`h-12 w-12 rounded-[var(--radius-lg)] border flex items-center justify-center shrink-0 shadow-sm ${
                                    service.risk === "HIGH" ? "bg-white border-red-100" : "bg-neutral-50 border-neutral-100"
                                }`}>
                                    {service.risk === "HIGH" ? (
                                        <AlertTriangle size={24} className="text-red-500" />
                                    ) : (
                                        <ShieldCheck size={24} className="text-neutral-400" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="text-label-md font-bold text-neutral-900 flex items-center gap-2">
                                        {service.name}
                                        {service.risk === "HIGH" && (
                                            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[9px] uppercase font-black">High Risk</span>
                                        )}
                                    </h4>
                                    <p className="text-body-sm text-neutral-500">
                                        {service.risk === "HIGH" 
                                            ? `Potential data obfuscation detected. Service shares data with ${service.sharedWith?.length || 3}+ unnamed third parties.`
                                            : `Standard data practices. Moderated sharing with ${service.sharedWith?.length || 1} partner(s).`
                                        }
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setSelectedServiceId(service.id)}
                                        className="btn-ghost px-4 py-2 text-[11px] font-bold text-neutral-500 hover:text-neutral-900"
                                    >
                                        Inspect
                                    </button>
                                    <button 
                                        onClick={() => setPendingRevokeId(service.id)}
                                        className="btn-danger-ghost px-6 py-2 text-[12px] font-bold shrink-0"
                                    >
                                        Revoke
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-12 text-center rounded-[var(--radius-xl)] border border-dashed border-neutral-100 bg-neutral-50/50">
                            <ShieldCheck size={40} className="text-emerald-500 mx-auto mb-4" />
                            <h3 className="text-h4 text-neutral-900">No matching risks</h3>
                            <p className="text-body-sm text-neutral-500 mt-2">All scanned services meet your current privacy baseline.</p>
                        </div>
                    )}
                </div>

                {/* Audit Log Table-ish */}
                <div className="mt-16 space-y-6">
                    <div className="flex items-center gap-6">
                        <h2 className="text-label-sm text-neutral-400 uppercase tracking-widest shrink-0">Event Timeline</h2>
                        <div className="h-[1px] flex-1 bg-neutral-100" />
                    </div>

                    <div className="rounded-[var(--radius-xl)] border border-neutral-100 bg-white overflow-hidden shadow-sm">
                        <div className="divide-y divide-neutral-100">
                            {recentEvents.map((event) => {
                                const relatedCompany = companies.find(c => c.name === event.companyName);
                                return (
                                    <div 
                                        key={event.id} 
                                        onClick={() => {
                                            if (relatedCompany) {
                                                setSelectedServiceId(relatedCompany.id);
                                            } else {
                                                showToast("Service details no longer available.", "error");
                                            }
                                        }}
                                        className="p-6 flex items-center gap-6 hover:bg-neutral-50/50 transition-colors cursor-pointer group/item"
                                    >
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                                            event.action === "REVOKED" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                                        }`}>
                                            <History size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="text-label-md font-bold text-neutral-900 group-hover/item:text-[var(--color-primary-500)] transition-colors">{event.companyName}</span>
                                                <span className="text-[10px] text-neutral-400 font-medium">{event.timestamp}</span>
                                            </div>
                                            <p className="text-body-sm text-neutral-500 mt-0.5 line-clamp-1">
                                                {event.action === "REVOKED" ? "Access ended" : "Connected"} — {event.reason || "Automatic detection"}
                                            </p>
                                        </div>
                                        <ArrowRight size={14} className="text-neutral-300 group-hover/item:text-[var(--color-primary-500)] transition-all" />
                                    </div>
                                );
                            })}
                        </div>
                        <Link href="/activity" className="block w-full p-4 text-center text-label-sm text-[var(--color-primary-500)] font-bold hover:bg-neutral-50 transition-colors border-t border-neutral-100">
                            View Full History
                        </Link>
                    </div>
                </div>
            </div>

            {/* Recommendations & Side Info */}
            <div className="lg:col-span-4 space-y-8">
                <div className="rounded-[var(--radius-xl)] border border-neutral-100 bg-white p-8 shadow-sm relative overflow-hidden">
                    <h3 className="text-label-sm text-neutral-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                        <Info size={14} />
                        Proactive Health
                    </h3>
                    
                    <div className="space-y-8 relative z-10">
                        <RecommendationItem 
                            title="Review School Data" 
                            desc="3 services have access to your GPA records. Re-evaluate if necessary."
                        />
                        <RecommendationItem 
                            title="Weekly Privacy Scan" 
                            desc="Run a deep scan of your browser extension for hidden data flows."
                        />
                        <RecommendationItem 
                            title="Revoke LinkedIn Path" 
                            desc="Microsoft has updated its terms. High exposure for professional nodes."
                        />
                    </div>

                    <div className="mt-12 pt-8 border-t border-neutral-100 space-y-4">
                        <div className="p-4 rounded-lg bg-neutral-50 border border-neutral-100">
                            <p className="text-[11px] text-neutral-500 leading-relaxed italic">
                                &quot;Continuous Guard monitors your browser for session hijacking and unauthorized data leaks in real-time.&quot;
                            </p>
                        </div>
                        <button 
                            onClick={handleAutoAuditToggle}
                            disabled={isScanning}
                            className={`w-full py-4 rounded-[var(--radius-md)] font-bold text-[12px] transition-all shadow-lg flex items-center justify-center gap-2 ${
                                isAutoAuditActive 
                                ? "bg-emerald-500 text-white hover:bg-emerald-600" 
                                : "bg-[var(--color-primary-500)] text-white hover:brightness-110"
                            }`}
                        >
                            {isScanning ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Scanning...
                                </>
                            ) : isAutoAuditActive ? (
                                <>
                                    <ShieldCheck size={16} />
                                    Continuous Guard Active
                                </>
                            ) : (
                                <>
                                    Enable Continuous Guard
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>


                <div className="rounded-[var(--radius-xl)] border border-neutral-100 bg-white p-8 shadow-sm">
                    <h4 className="text-label-sm text-neutral-400 uppercase tracking-widest mb-4">Encryption Level</h4>
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={20} className="text-emerald-500" />
                        <span className="text-label-md font-bold text-neutral-900">Personal Encryption</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-4 leading-relaxed">
                        All audit logs are stored locally using end-to-end encryption. Consently servers never see your raw audit events.
                    </p>
                </div>
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

function RecommendationItem({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="group cursor-pointer">
            <div className="flex items-center justify-between gap-4 mb-2">
                <h5 className="text-label-md font-bold text-neutral-900 group-hover:text-[var(--color-primary-500)] transition-colors">{title}</h5>
                <ExternalLink size={12} className="text-neutral-400" />
            </div>
            <p className="text-body-sm text-neutral-500 leading-relaxed font-medium">
                {desc}
            </p>
        </div>
    );
}

