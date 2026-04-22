"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  ShieldAlert,
  Trash2,
  ExternalLink,
  Database,
  Search,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { PLAIN_LANGUAGE_MAP } from "@/lib/privacy";
import { RISK_CONFIG_MAP, CompanyRecord, PrivacyPolicyReport } from "@/lib/constants";
import { Container } from "@/components/layout/Container";

interface ServiceDetailViewProps {
  service: CompanyRecord;
  onBack: () => void;
  onRevoke: (id: string) => void;
  onReconnect?: (id: string) => void;
}

const MOCK_REPORT: PrivacyPolicyReport = {
  summary: "Comprehensive data collection policy with significant third-party sharing. The service retains data indefinitely unless explicitly requested for deletion.",
  lastAnalyzed: "April 21, 2026",
  policyUrl: "#",
  keyFindings: [
    {
      category: "DATA_RETENTION",
      finding: "Data is stored for up to 5 years after account deactivation.",
      impact: "NEGATIVE"
    },
    {
      category: "SHARING",
      finding: "Aggregated behavioral data is shared with over 15 advertising partners.",
      impact: "NEGATIVE"
    },
    {
      category: "RIGHTS",
      finding: "Clear mechanism for Data Subject Access Requests (DSAR) provided.",
      impact: "POSITIVE"
    },
    {
      category: "SECURITY",
      finding: "Uses industry-standard AES-256 encryption for data at rest.",
      impact: "POSITIVE"
    }
  ]
};

export function ServiceDetailView({
  service,
  onBack,
  onRevoke,
  onReconnect,
}: ServiceDetailViewProps) {
  const isRevoked = service.status === "REVOKED";
  const riskConfig = RISK_CONFIG_MAP[service.risk];
  const report = service.policyReport || MOCK_REPORT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-[#FDFDFD] min-h-screen pb-20"
    >
      <Container className="pt-8">
        {/* Navigation */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-900 transition-colors mb-12 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-label-md font-medium uppercase tracking-wider">Back</span>
        </button>



        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-16">
            {/* Header Section */}
            <header className="space-y-4">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[var(--radius-lg)] border border-neutral-100 bg-white flex items-center justify-center text-2xl font-bold text-neutral-900 shadow-sm">
                  {service.name[0]}
                </div>
                <div>
                  <h1 className="text-display-lg text-neutral-900 tracking-tight">{service.name}</h1>
                  <p className="text-body-lg text-neutral-500 max-w-xl">{service.description}</p>
                </div>
              </div>
            </header>

            {/* Data Analysis Section */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-label-sm text-neutral-400">Data Access & Impact</h2>
                <div className="h-[1px] flex-1 bg-neutral-100" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(service.dataTypes || []).map((item) => (
                  <div key={item.name} className="p-6 rounded-[var(--radius-lg)] border border-neutral-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-50)] text-[var(--color-primary-500)] group-hover:bg-[var(--color-primary-500)] group-hover:text-white transition-colors">
                        <Database size={16} />
                      </div>
                      <div>
                        <h3 className="text-h4 text-neutral-900 capitalize mb-1">
                          {item.name.replace(/_/g, " ")}
                        </h3>
                        <p className="text-body-sm text-neutral-500 leading-relaxed">
                          {PLAIN_LANGUAGE_MAP[item.name] || "General data collection for service operational needs."}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Privacy Policy Report */}
            <section className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-label-sm text-neutral-400">Privacy Policy Analysis Report</h2>
                <div className="h-[1px] flex-1 bg-neutral-100" />
              </div>

              <div className="rounded-[var(--radius-xl)] border border-neutral-100 bg-white overflow-hidden shadow-sm">
                <div className="bg-neutral-50 p-6 border-b border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Search size={18} className="text-neutral-400" />
                    <span className="text-label-md text-neutral-600 font-semibold">Consently AI Scan</span>
                  </div>
                  <span className="text-mono-sm text-neutral-400">Analyzed {report.lastAnalyzed}</span>
                </div>
                
                <div className="p-8 space-y-8">
                  <div className="space-y-3">
                    <h4 className="text-h4 text-neutral-900">Executive Summary</h4>
                    <p className="text-body-md text-neutral-600 leading-relaxed bg-neutral-25 p-4 rounded-lg border-l-4 border-neutral-200">
                      {report.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {report.keyFindings.map((finding, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            finding.impact === "POSITIVE" ? "bg-emerald-500" : 
                            finding.impact === "NEGATIVE" ? "bg-red-500" : "bg-neutral-300"
                          }`} />
                          <span className="text-label-sm text-neutral-400">{finding.category.replace("_", " ")}</span>
                        </div>
                        <p className="text-body-sm text-neutral-800 font-medium">{finding.finding}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-neutral-50 flex justify-between items-center text-body-sm">
                    <span className="text-neutral-400 italic">Source: Official Privacy Policy disclosure</span>
                    <a href={report.policyUrl} className="text-[var(--color-primary-500)] flex items-center gap-1 hover:underline">
                      View Source <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Action Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 p-8 rounded-[var(--radius-xl)] border border-neutral-100 bg-white shadow-sm space-y-8">
              <div className="space-y-4">
                <h3 className="text-h3 text-neutral-900">Risk Assessment</h3>
                <div className={`p-4 rounded-lg border flex items-start gap-3 ${
                  service.risk === "HIGH" ? "bg-red-50 border-red-100 text-red-900" :
                  service.risk === "MEDIUM" ? "bg-amber-50 border-amber-100 text-amber-900" :
                  "bg-emerald-50 border-emerald-100 text-emerald-900"
                }`}>
                  <ShieldAlert className="mt-0.5 shrink-0" size={20} />
                  <div className="space-y-1">
                    <p className="font-bold uppercase tracking-wide text-xs">{service.risk} Impact</p>
                    <p className="text-body-sm leading-relaxed opacity-80">
                      {service.risk === "HIGH" 
                        ? "This service has wide-reaching permissions that could be used to build a comprehensive profile of your daily life and identity."
                        : service.risk === "MEDIUM"
                        ? "Significant data is collected, primarily for service functionality, but with potential for secondary usage."
                        : "Minimal data collection focused on essential service delivery. Generally considered safe."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-neutral-100">
                <h3 className="text-h3 text-neutral-900">Connection Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-neutral-400">Connected</span>
                    <span className="text-neutral-900 font-medium">{service.connectedAt}</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-neutral-400">Data Sharing</span>
                    <span className="text-neutral-900 font-medium">{service.sharedWith.length} Partners</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-neutral-400">Last Activity</span>
                    <span className="text-neutral-900 font-medium">{service.lastAccessed}</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 space-y-3">
                {isRevoked ? (
                  <>
                    <div className="flex items-center justify-center gap-2 h-10 rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-500 text-sm font-semibold">
                      <ShieldCheck size={16} />
                      Access Revoked
                    </div>
                    {onReconnect && (
                      <button
                        onClick={() => onReconnect(service.id)}
                        className="w-full h-12 border border-[var(--color-primary-200)] text-[var(--color-primary-600)] font-semibold rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-[var(--color-primary-50)] active:scale-[0.98] text-sm"
                      >
                        <RotateCcw size={16} />
                        Reconnect Service
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onRevoke(service.id)}
                      className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
                    >
                      <Trash2 size={20} />
                      Disconnect & Revoke
                    </button>
                    <p className="text-label-sm text-neutral-400 text-center">
                      This will immediately terminate active API keys.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}
