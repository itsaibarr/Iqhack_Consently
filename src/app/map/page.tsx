"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { NodeGraph } from "@/components/consent/NodeGraph";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { LegendItem } from "@/components/ui/LegendItem";
import { ServiceDetailDrawer } from "@/components/consent/ServiceDetailDrawer";
import { useConsent } from "@/context/ConsentContext";
import { Globe, Info, Activity } from "lucide-react";

export default function MapPage() {
  const { companies, revokeConsent } = useConsent();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeCompanies = companies.filter((c) => c.status === "ACTIVE");
  const selectedService = companies.find((c) => c.id === selectedId) || null;

  const handleRevoke = (id: string) => {
    revokeConsent(id);
    setSelectedId(null);
  };

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-32">
      {/* Header Section */}
      <div className="border-b border-neutral-100 bg-white pt-24 pb-12">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 text-label-sm text-neutral-500">
                <Globe size={12} className="text-[var(--color-primary-500)]" />
                Live Connection Map
              </div>
              <h1 className="text-display-lg text-neutral-900 leading-tight">
                Your Privacy Map
              </h1>
              <p className="text-body-md text-neutral-500 max-w-xl">
                A live view of every company that currently holds your digital footprint. Tap any service to manage their access.
              </p>
            </motion.div>

            <div className="flex items-center gap-4">
               <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tighter">System Status</span>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-label-md font-bold text-neutral-900">Handshake Active</span>
                    </div>
               </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="mt-16">
        <div className="flex flex-col gap-8">

          {/* Immersive Graph */}
          <div className="relative group">
            <NodeGraph 
              companies={companies} 
              onNodeClick={(id) => setSelectedId(id)} 
              className="h-[600px] lg:h-[750px]"
            />
            
            {/* Overlay Dashboard */}
            <div className="absolute bottom-8 left-8 right-8 z-10 pointer-events-none">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    {/* Legend */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="pointer-events-auto rounded-[var(--radius-lg)] border border-neutral-100 bg-white/80 p-6 backdrop-blur-md shadow-lg"
                    >
                        <h4 className="text-label-sm text-neutral-400 mb-4 flex items-center gap-2">
                            <Info size={14} />
                            Map Legend
                        </h4>
                        <div className="space-y-4">
                            <LegendItem color="var(--color-risk-red-500)" label="High Risk Service" />
                            <LegendItem color="var(--color-primary-500)" label="You (Identity Core)" />
                            <LegendItem color="var(--color-neutral-200)" label="Passive Connection" animate />
                        </div>
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="pointer-events-auto flex gap-4"
                    >
                        <SummaryCard 
                            label="Connected Companies" 
                            value={activeCompanies.length} 
                            detail="Total entities"
                            className="w-40 border-none shadow-xl"
                        />
                        <SummaryCard 
                            label="Data Requests" 
                            value={<Activity size={24} className="text-[var(--color-primary-500)]" />} 
                            detail="Real-time access"
                            className="w-40 border-none shadow-xl"
                        />
                    </motion.div>
                </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12 py-12 border-t border-neutral-100">
             <div className="space-y-4">
                <h3 className="text-h4 text-neutral-900">Understanding your data connections</h3>
                <p className="text-body-sm text-neutral-600 leading-relaxed">
                    Companies closer to your center have more access to sensitive details like your location, finances, or academic records. High-risk services are automatically highlighted for your review.
                </p>
             </div>
             <div className="space-y-4">
                <h3 className="text-h4 text-neutral-900">Revoke Access Instantly</h3>
                <p className="text-body-sm text-neutral-600 leading-relaxed">
                    Tap any bubble to see exactly what a company knows about you. If you don&apos;t recognize a service or no longer use it, you can disconnect it in one click.
                </p>
             </div>
          </div>
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
