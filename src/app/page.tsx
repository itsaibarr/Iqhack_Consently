"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { CompanyCard } from "@/components/consent/CompanyCard";
import { NodeGraph } from "@/components/consent/NodeGraph";
import { ServiceDetailDrawer } from "@/components/consent/ServiceDetailDrawer";
import { MOCK_COMPANIES } from "@/lib/constants";
import { calculateGlobalPrivacyScore } from "@/lib/privacy";
import { ShieldCheck, Zap, AlertTriangle, Fingerprint, Plus } from "lucide-react";

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

export default function Home() {
  const { companies, revokeConsent } = useConsent();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeCount = companies.filter((c) => c.status === "ACTIVE").length;
  const highRiskCount = companies.filter((c) => c.risk === "HIGH" && c.status === "ACTIVE").length;
  const privacyScore = useMemo(() => calculateGlobalPrivacyScore(companies), [companies]);

  const selectedService = companies.find(c => c.id === selectedId) || null;

  const handleRevoke = (id: string) => {
    revokeConsent(id);
    setSelectedId(null);
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD] dark:bg-black pb-32">
      {/* Page Header */}
      <div className="border-b border-neutral-100 bg-white py-20 dark:bg-neutral-950 dark:border-neutral-900">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-5 items-center rounded-md bg-neutral-100 px-2 font-mono text-[9px] font-black uppercase tracking-widest text-neutral-500 dark:bg-neutral-800">
                  Core Dashboard
                </span>
                <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">
                  Sovereignty Scan Active
                </span>
              </div>
              <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white lg:text-7xl">
                Consent Inventory
              </h1>
              <p className="text-lg font-medium text-neutral-500 max-w-sm leading-relaxed">
                Your digital identity hub. Monitor and manage how companies interact with your data.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-4"
            >
              <button className="group flex h-14 items-center gap-2 rounded-2xl border border-neutral-200 px-8 text-sm font-bold text-neutral-900 transition-all hover:bg-neutral-50 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900">
                <Plus size={18} className="transition-transform group-hover:rotate-90" />
                Connect Service
              </button>
              <button className="flex h-14 items-center gap-2 rounded-2xl bg-red-500 px-8 text-sm font-bold text-white shadow-xl shadow-red-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                <AlertTriangle size={18} />
                Revoke All
              </button>
            </motion.div>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              index={0}
              label="Active Connections" 
              value={activeCount} 
              icon={ShieldCheck} 
              color="#10B981" 
            />
            <StatCard 
              index={1}
              label="High Risk Services" 
              value={highRiskCount} 
              icon={AlertTriangle} 
              color="#EF4444" 
            />
            <StatCard 
              index={2}
              label="Data Points Collected" 
              value={18} 
              icon={Fingerprint} 
              color="#2851D6" 
            />
            <StatCard 
              index={3}
              label="Final Privacy Score" 
              value={<CountUp value={privacyScore} />} 
              status={privacyScore > 70 ? "SECURE" : "AT RISK"} 
              icon={Zap} 
              color={privacyScore > 70 ? "#10B981" : "#EF4444"} 
            />
          </div>
        </Container>
      </div>

      {/* Main Content Area */}
      <Container className="py-24">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-12">
          {/* Visual Graph Area */}
          <div className="lg:col-span-8 space-y-10">
            <div className="flex items-center gap-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
                Neural Data Web
              </h2>
              <div className="h-[1px] flex-1 bg-neutral-100 dark:bg-neutral-800/60" />
            </div>
            <NodeGraph 
              companies={companies} 
              onNodeClick={(id) => setSelectedId(id)} 
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-[32px] border border-neutral-100 bg-neutral-50/50 p-10 dark:border-neutral-900 dark:bg-neutral-900/30 backdrop-blur-xl"
            >
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Interactive Topology</h3>
              <p className="mt-6 text-sm leading-relaxed text-neutral-500 font-medium">
                The map displays real-time data ingestion pipelines. Each node represents a separate legal entity accessing your footprint.
              </p>
              
              <div className="mt-12 space-y-6">
                <LegendItem color="#EF4444" label="Critical exposure risk" />
                <LegendItem color="#2851D6" label="Your Sovereignty Hub" />
                <LegendItem color="#E5E5E5" label="Neutral data collector" animate />
              </div>
              
              <div className="mt-12 pt-10 border-t border-neutral-100 dark:border-neutral-800">
                <h4 className="text-xs font-bold uppercase tracking-widest text-neutral-400">System Tip</h4>
                <p className="mt-3 text-xs leading-relaxed text-neutral-500">
                  Tap a node to see the &quot;Plain Language&quot; impact report and disconnect services instantly.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="mt-40">
          <div className="mb-16 flex items-center gap-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">
              Granular Service Inventory
            </h2>
            <div className="h-[1px] flex-1 bg-neutral-100 dark:bg-neutral-800" />
          </div>

          <motion.div layout className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

function LegendItem({ color, label, animate }: { color: string; label: string; animate?: boolean }) {
  return (
    <div className="flex items-center gap-4 group cursor-default">
      <div 
        className={cn("h-2.5 w-2.5 rounded-full ring-4 ring-offset-2 ring-transparent transition-all group-hover:ring-neutral-100", animate && "animate-pulse")} 
        style={{ backgroundColor: color }} 
      />
      <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{label}</span>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color,
  status,
  index
}: { 
  label: string; 
  value: React.ReactNode; 
  icon: React.ElementType; 
  color: string;
  status?: string;
  index: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-3xl border border-neutral-100 bg-white p-8 dark:border-neutral-900 dark:bg-neutral-900 shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all hover:border-neutral-200 hover:shadow-xl"
    >
      <div className="flex items-center justify-between text-neutral-400">
        <span className="text-[10px] font-black uppercase tracking-widest leading-none opacity-60 group-hover:opacity-100 transition-opacity">{label}</span>
        <Icon size={16} className="group-hover:scale-110 transition-transform" />
      </div>
      <div className="mt-8 flex items-end justify-between">
        <span className="text-5xl font-extrabold tracking-tighter text-neutral-900 dark:text-white leading-none">
          {value}
        </span>
        {status && (
          <span 
            className="rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-tight"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {status}
          </span>
        )}
      </div>
      
      {/* Subtle background decoration */}
      <div 
        className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-150"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
}

function cn(...inputs: (string | boolean | undefined | null)[]) {
  return inputs.filter(Boolean).join(" ");
}
