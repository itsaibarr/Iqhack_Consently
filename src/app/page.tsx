"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { CompanyCard } from "@/components/consent/CompanyCard";
import { NodeGraph } from "@/components/consent/NodeGraph";
import { ServiceDetailDrawer } from "@/components/consent/ServiceDetailDrawer";
import { RISK_CONFIG_MAP, EXTENSION_ID } from "@/lib/constants";
import { Zap, AlertTriangle, Plus, Copy, ExternalLink, Radar, LayoutGrid, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { LegendItem } from "@/components/ui/LegendItem";
import { OnboardingFlow } from "@/components/ui/OnboardingFlow"; // [NEW]

import { useConsent } from "@/context/ConsentContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const { companies, revokeConsent, user } = useConsent();
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  // Check if onboarding is needed
  useEffect(() => {
    const isDone = localStorage.getItem("consently_onboarding_done");
    if (!isDone) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("consently_onboarding_done", "true");
    setShowOnboarding(false);
  };

  const activeCount = companies.filter((c) => c.status === "ACTIVE").length;
  const highRiskCount = companies.filter((c) => c.risk === "HIGH" && c.status === "ACTIVE").length;
  const dataPointsCount = companies
    .filter((c) => c.status === "ACTIVE")
    .reduce((acc, c) => acc + (c.dataTypes?.length || 0), 0);

  const selectedService = companies.find(c => c.id === selectedId) || null;

  const handleRevoke = (id: string) => {
    revokeConsent(id);
    setSelectedId(null);
  };

  return (
    <>
      <AnimatePresence>
        {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}
      </AnimatePresence>
      <main className={`min-h-screen bg-[#FDFDFD] pb-32 transition-all duration-700 ${showOnboarding ? "blur-md pointer-events-none scale-105" : ""}`}>
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
                Your privacy health is active. You have full control over how services interact with your information.
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
                Your Data Map
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
              <h3 className="text-h3 text-neutral-900 tracking-tight">Service Map Legend</h3>
              <p className="mt-4 text-body-sm leading-relaxed text-neutral-500 font-medium">
                The map shows every service that currently holds your data. Each node represents a different company tracking your information.
              </p>
              
              <div className="mt-10 space-y-6">
                <LegendItem color={RISK_CONFIG_MAP.HIGH.color} label="High risk of exposure" />
                <LegendItem color="var(--color-primary-500)" label="You" />
                <LegendItem color="var(--color-neutral-200)" label="Low risk service" animate />
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

        {/* Inventory Section CTA */}
        <div className="mt-24">
          <div className="mb-12 flex items-center gap-6">
            <h2 className="text-label-sm text-neutral-400">
              Service Inventory
            </h2>
            <div className="h-[1px] flex-1 bg-neutral-100" />
          </div>

          <div className="flex flex-col items-center justify-center py-20 rounded-[var(--radius-xl)] border border-neutral-100 bg-white shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-500)] mb-6">
               <LayoutGrid size={28} />
            </div>
            <h3 className="text-h3 text-neutral-900 mb-2">Manage All Consents</h3>
            <p className="text-body-md text-neutral-500 text-center max-w-sm mb-8">
              Access your full inventory of {activeCount} active services. Filter by risk, category, or search for specific data providers.
            </p>
            <Link 
              href="/inventory"
              className="btn-ghost border border-neutral-200 h-12 px-8 flex items-center gap-2 hover:bg-neutral-50"
            >
              Enter Inventory <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </Container>
      </main>

      <ServiceDetailDrawer
        isOpen={!!selectedId}
        onClose={() => setSelectedId(null)}
        service={selectedService as NonNullable<typeof selectedService>}
        onRevoke={handleRevoke}
      />
    </>
  );
}



