"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { NodeGraph } from "@/components/consent/NodeGraph";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { LegendItem } from "@/components/ui/LegendItem";
import { ServiceDetailView } from "@/components/consent/ServiceDetailView";
import { RevokeConfirmModal } from "@/components/consent/RevokeConfirmModal";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { useConsent } from "@/context/ConsentContext";
import { Globe, Info, Activity } from "lucide-react";

export default function MapPage() {
  const { companies, revokeConsent, revokeAllHighRisk, reconnectService } = useConsent();
  const { toasts, showToast, dismiss } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingRevokeId, setPendingRevokeId] = useState<string | "bulk" | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const activeCompanies = companies.filter((c) => c.status === "ACTIVE");
  const highRiskCount = companies.filter((c) => c.risk === "HIGH" && c.status === "ACTIVE").length;
  const highRiskServices = companies.filter((c) => c.risk === "HIGH" && c.status === "ACTIVE");
  const selectedService = companies.find((c) => c.id === selectedId) || null;

  const pendingService =
    pendingRevokeId && pendingRevokeId !== "bulk"
      ? (companies.find((c) => c.id === pendingRevokeId) ?? null)
      : null;

  const handleRevokeRequest = (id: string) => {
    setSelectedId(null);
    setPendingRevokeId(id);
  };

  const handleRevokeAllRequest = () => {
    if (highRiskCount === 0) {
      showToast("No high-risk services to revoke.", "error");
      return;
    }
    setPendingRevokeId("bulk");
  };

  const handleRevokeConfirm = async (reason?: string) => {
    setIsRevoking(true);

    if (pendingRevokeId === "bulk") {
      const { count, emailsSent } = await revokeAllHighRisk(reason);
      setIsRevoking(false);
      setPendingRevokeId(null);
      if (count > 0) {
        const emailNote = emailsSent > 0 ? ` ${emailsSent} GDPR request${emailsSent !== 1 ? "s" : ""} sent.` : "";
        showToast(`${count} high-risk service${count !== 1 ? "s" : ""} revoked.${emailNote}`, "success");
      } else {
        showToast("No services revoked.", "error");
      }
    } else if (pendingRevokeId) {
      const name = pendingService?.name ?? "Service";
      const { success, emailSent, emailTo } = await revokeConsent(pendingRevokeId, reason);
      setIsRevoking(false);
      setPendingRevokeId(null);
      if (success) {
        const emailNote = emailSent ? ` GDPR request sent to ${emailTo}.` : "";
        showToast(`${name} access revoked.${emailNote}`, "success");
      } else {
        showToast("Failed to revoke. Please try again.", "error");
      }
    }
  };

  const handleReconnect = async (id: string) => {
    const company = companies.find((c) => c.id === id);
    const { success } = await reconnectService(id);
    setSelectedId(null);
    showToast(
      success
        ? `${company?.name ?? "Service"} reconnected.`
        : "Failed to reconnect. Please try again.",
      success ? "success" : "error"
    );
  };

  return (
    <>
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
                <h1 className="text-display-lg text-neutral-900 leading-tight">Your Privacy Map</h1>
                <p className="text-body-md text-neutral-500 max-w-xl">
                  A live view of every company that currently holds your digital footprint. Tap any service to manage their access.
                </p>
              </motion.div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleRevokeAllRequest}
                  disabled={highRiskCount === 0}
                  className="btn-danger flex h-11 items-center gap-2 px-6 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <AlertTriangle size={16} />
                  Revoke All High Risk{highRiskCount > 0 ? ` (${highRiskCount})` : ""}
                </button>

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

        {selectedId && selectedService && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-white"
          >
            <ServiceDetailView
              service={selectedService}
              onBack={() => setSelectedId(null)}
              onRevoke={handleRevokeRequest}
              onReconnect={handleReconnect}
            />
          </motion.div>
        )}
      </main>

      {/* Modals outside main to avoid z-index conflicts */}
      {pendingRevokeId === "bulk" ? (
        <RevokeConfirmModal
          isOpen
          mode="bulk"
          services={highRiskServices}
          onConfirm={handleRevokeConfirm}
          onCancel={() => setPendingRevokeId(null)}
          isLoading={isRevoking}
        />
      ) : pendingService ? (
        <RevokeConfirmModal
          isOpen={!!pendingRevokeId}
          mode="single"
          service={pendingService}
          onConfirm={handleRevokeConfirm}
          onCancel={() => setPendingRevokeId(null)}
          isLoading={isRevoking}
        />
      ) : null}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </>
  );
}
