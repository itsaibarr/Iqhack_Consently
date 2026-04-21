"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { CompanyCard } from "@/components/consent/CompanyCard";
import { NodeGraph } from "@/components/consent/NodeGraph";
import { ServiceDetailDrawer } from "@/components/consent/ServiceDetailDrawer";
import { calculateGlobalPrivacyScore } from "@/lib/privacy";
import { ShieldCheck, Zap, AlertTriangle, Fingerprint, Plus } from "lucide-react";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { LegendItem } from "@/components/ui/LegendItem";

/**
 * Animated number component for the "Wow" factor.
 */
function CountUp({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    let startTime: number;
    const startValue = countRef.current;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const current = Math.floor(progress * (endValue - startValue) + startValue);
      
      setDisplayValue(current);
      countRef.current = current;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

import { useConsent } from "@/context/ConsentContext";
import { useRouter } from "next/navigation";
import { Copy, ExternalLink } from "lucide-react";

export default function Home() {
  const { companies, revokeConsent, user } = useConsent();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auth Guard: If not logged in, redirect after a short delay to allow session resolution
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        router.push("/auth");
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [user, router]);

  const activeCount = companies.filter((c) => c.status === "ACTIVE").length;
  const highRiskCount = companies.filter((c) => c.risk === "HIGH" && c.status === "ACTIVE").length;
  const dataPointsCount = companies
    .filter((c) => c.status === "ACTIVE")
    .reduce((acc, c) => acc + (c.dataTypes?.length || 0), 0);

  const privacyScore = useMemo(() => calculateGlobalPrivacyScore(companies), [companies]);

  const selectedService = companies.find(c => c.id === selectedId) || null;

  const handleRevoke = (id: string) => {
    revokeConsent(id);
    setSelectedId(null);
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-32">
      {/* Page Header */}
      <div className="border-b border-neutral-100 bg-white pt-20 pb-10">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <h1 className="text-display-lg text-neutral-900 leading-tight">
                Welcome back, {user?.email?.split("@")[0] || "Citizen"}
              </h1>
              <p className="text-body-md text-neutral-600 max-w-md">
                Your data sovereignty is active. You have full control over how services interact with your digital identity.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <button className="btn-ghost flex h-11 items-center gap-2 px-6">
                <Plus size={16} />
                Connect Service
              </button>
              <button className="btn-danger flex h-11 items-center gap-2 px-6">
                <AlertTriangle size={16} />
                Revoke All
              </button>
            </motion.div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard 
              label="Services Connected" 
              value={activeCount} 
              detail={`Since ${companies[0]?.connectedAt || "Sep 2022"}`}
            />
            <SummaryCard 
              label="Data Types Shared" 
              value={dataPointsCount} 
              detail="Across all active consents"
            />
            <SummaryCard 
              label="High Risk Services" 
              value={highRiskCount} 
              detail={highRiskCount > 0 ? "Review recommended" : "No urgent action needed"}
              isRisk={highRiskCount > 0}
            />
          </div>
        </Container>
      </div>

      {/* Main Content Area */}
      <Container className="py-16">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
          {/* Visual Graph Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-6">
              <h2 className="text-label-sm text-neutral-400">
                Neural Data Web
              </h2>
              <div className="h-[1px] flex-1 bg-neutral-100" />
            </div>
            <NodeGraph 
              companies={companies} 
              onNodeClick={(id) => setSelectedId(id)} 
              className="h-[500px]"
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-[var(--radius-xl)] border border-neutral-100 bg-white p-8 shadow-sm"
            >
              <h3 className="text-h3 text-neutral-900 tracking-tight">Interactive Topology</h3>
              <p className="mt-4 text-body-sm leading-relaxed text-neutral-500 font-medium">
                The map displays real-time data ingestion pipelines. Each node represents a separate legal entity accessing your footprint.
              </p>
              
              <div className="mt-10 space-y-6">
                <LegendItem color="var(--color-risk-red-500)" label="Critical exposure risk" />
                <LegendItem color="var(--color-primary-500)" label="Your Sovereignty Hub" />
                <LegendItem color="var(--color-neutral-200)" label="Neutral data collector" animate />
              </div>
              
              <div className="mt-10 pt-8 border-t border-neutral-100">
                <h4 className="text-label-sm text-neutral-400">System Tip</h4>
                <p className="mt-3 text-label-md text-neutral-500">
                  Tap a node to see the &quot;Plain Language&quot; impact report and disconnect services instantly.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="mt-24">
          <div className="mb-12 flex items-center gap-6">
            <h2 className="text-label-sm text-neutral-400">
              Granular Service Inventory
            </h2>
            <div className="h-[1px] flex-1 bg-neutral-100" />
          </div>

          <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activeCount === 0 ? (
              <div className="col-span-full">
                <EmptyInventoryState />
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {companies.map((company) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)", transition: { duration: 0.3 } }}
                    key={company.id}
                  >
                    <CompanyCard 
                      record={company} 
                      onRevoke={handleRevoke}
                      onViewDetails={(id) => setSelectedId(id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        </div>
      </Container>

      <ServiceDetailDrawer
        isOpen={!!selectedId}
        onClose={() => setSelectedId(null)}
        service={selectedService as NonNullable<typeof selectedService>}
        onRevoke={handleRevoke}
      />
    </main>
  );
}

function EmptyInventoryState() {
  const EXTENSION_ID = "kegngnalimkofmfaeefinlljgdhomgon";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(EXTENSION_ID);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-32 rounded-[var(--radius-xl)] border border-dashed border-neutral-100 bg-neutral-50/20 transition-all hover:bg-neutral-50/40"
    >
      <div className="relative mb-12">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -inset-8 rounded-full bg-[var(--color-primary-50)] blur-3xl" 
        />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[var(--radius-xl)] bg-white shadow-md">
          <Zap size={40} className="text-[var(--color-primary-500)]" />
        </div>
      </div>
      
      <h3 className="text-h3 text-neutral-900 tracking-tight">Active Handshake Required</h3>
      <p className="mt-4 max-w-md text-center text-body-md text-neutral-500">
        Consently is listening for your browser extension. Once you install and sync your first service, your sovereignty map will activate.
      </p>

      <div className="mt-10 flex flex-col gap-4 w-full max-w-sm">
        <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-label-sm text-neutral-400">Extension ID</span>
            <code className="text-mono-sm font-bold text-neutral-600">{EXTENSION_ID}</code>
          </div>
          <button 
            onClick={copyToClipboard}
            className="rounded-[var(--radius-md)] p-2 hover:bg-neutral-50 transition-colors text-neutral-400"
          >
            <Copy size={16} />
          </button>
        </div>

        <a 
          href={`https://chrome.google.com/webstore/detail/${EXTENSION_ID}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary flex items-center justify-center gap-3 py-4"
        >
          <ExternalLink size={18} />
          Install from Web Store
        </a>
      </div>

      <div className="mt-16 flex items-center gap-4 rounded-[var(--radius-lg)] bg-white/50 px-5 py-3 border border-neutral-100">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />

      </div>
    </motion.div>
  );
}

function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(" ");
}
