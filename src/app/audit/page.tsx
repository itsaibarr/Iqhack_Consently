"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { useConsent } from "@/context/ConsentContext";
import { Zap, AlertTriangle, ShieldCheck, History, ArrowRight, ExternalLink, Info, Filter } from "lucide-react";
import { SummaryCard } from "@/components/ui/SummaryCard";

export default function AuditPage() {
  const { companies, history } = useConsent();

  const activeHighRisk = companies.filter(c => c.risk === "HIGH" && c.status === "ACTIVE");
  const recentEvents = history.slice(0, 10);

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-32">
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

            <button className="btn-ghost flex items-center gap-2 px-6 py-2 border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 transition-all rounded-lg h-12">
                <Filter size={16} />
                Filter Report
            </button>
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
                    <h2 className="text-label-sm text-neutral-400 uppercase tracking-widest shrink-0">Priority Risks</h2>
                    <div className="h-[1px] flex-1 bg-neutral-100" />
                </div>

                <div className="space-y-4">
                    {activeHighRisk.length > 0 ? (
                        activeHighRisk.map((service) => (
                            <motion.div 
                                key={service.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-[var(--radius-xl)] border border-red-100 bg-red-50/10 hover:bg-red-50/20 transition-all group"
                            >
                                <div className="h-12 w-12 rounded-[var(--radius-lg)] bg-white border border-red-100 flex items-center justify-center shrink-0 shadow-sm">
                                    <AlertTriangle size={24} className="text-red-500" />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="text-label-md font-bold text-neutral-900 flex items-center gap-2">
                                        {service.name}
                                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[9px] uppercase font-black">High Risk</span>
                                    </h4>
                                    <p className="text-body-sm text-neutral-500">
                                        Potential data obfuscation detected. Service shares data with {service.sharedWith?.length || 3}+ unnamed third parties.
                                    </p>
                                </div>
                                <button className="btn-danger-ghost px-6 py-3 text-[12px] font-bold shrink-0">
                                    Revoke Access
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-12 text-center rounded-[var(--radius-xl)] border border-dashed border-neutral-100 bg-neutral-50/50">
                            <ShieldCheck size={40} className="text-emerald-500 mx-auto mb-4" />
                            <h3 className="text-h4 text-neutral-900">No Critical Risks</h3>
                            <p className="text-body-sm text-neutral-500 mt-2">All active services currently meet your minimum security threshold.</p>
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
                            {recentEvents.map((event) => (
                                <div key={event.id} className="p-6 flex items-center gap-6 hover:bg-neutral-50/50 transition-colors">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                                        event.action === "REVOKED" ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                                    }`}>
                                        <History size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-label-md font-bold text-neutral-900">{event.companyName}</span>
                                            <span className="text-[10px] text-neutral-400 font-medium">{event.timestamp}</span>
                                        </div>
                                        <p className="text-body-sm text-neutral-500 mt-0.5 line-clamp-1">
                                            {event.action === "REVOKED" ? "Access ended" : "Connected"} — {event.reason || "Automatic detection"}
                                        </p>
                                    </div>
                                    <ArrowRight size={14} className="text-neutral-300" />
                                </div>
                            ))}
                        </div>
                        <button className="w-full p-4 text-center text-label-sm text-[var(--color-primary-500)] font-bold hover:bg-neutral-50 transition-colors border-t border-neutral-100">
                            View Full History
                        </button>
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

                    <div className="mt-12 pt-8 border-t border-neutral-100">
                        <button className="w-full py-4 rounded-[var(--radius-md)] bg-[var(--color-primary-500)] text-white font-bold text-[12px] hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2">
                            Enable Auto-Audit
                            <ArrowRight size={16} />
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

