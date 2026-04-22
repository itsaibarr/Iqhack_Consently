"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";

import { NodeGraph } from "@/components/consent/NodeGraph";
import { ServiceDetailView } from "@/components/consent/ServiceDetailView";
import { RevokeConfirmModal } from "@/components/consent/RevokeConfirmModal";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { RISK_CONFIG_MAP, CompanyRecord } from "@/lib/constants";
import { AlertTriangle, Plus, LayoutGrid, ChevronRight } from "lucide-react";
import Link from "next/link";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { LegendItem } from "@/components/ui/LegendItem";
import { OnboardingFlow } from "@/components/ui/OnboardingFlow";

import { useConsent } from "@/context/ConsentContext";

export default function Home() {
  const { companies, revokeConsent, revokeAllHighRisk, reconnectService, user } = useConsent();
  const { toasts, showToast, dismiss } = useToast();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  // null = closed, string id = single revoke, "bulk" = revoke all high risk
  const [pendingRevokeId, setPendingRevokeId] = useState<string | "bulk" | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  useEffect(() => {
    const isDone = localStorage.getItem("consently_onboarding_done");
    setTimeout(() => {
      setShowOnboarding(!isDone);
    }, 0);
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

  const selectedService = companies.find((c) => c.id === selectedId) ?? null;
  const pendingService =
    pendingRevokeId && pendingRevokeId !== "bulk"
      ? (companies.find((c) => c.id === pendingRevokeId) ?? null)
      : null;
  const highRiskServices = companies.filter((c) => c.risk === "HIGH" && c.status === "ACTIVE");

  const handleRevokeRequest = (id: string) => setPendingRevokeId(id);

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
      setSelectedId(null);
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
      <AnimatePresence>
        {showOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}
      </AnimatePresence>

      <main
        className={`min-h-screen bg-[#FDFDFD] transition-all duration-700 ${
          showOnboarding ? "blur-md pointer-events-none scale-105" : ""
        }`}
      >
        <AnimatePresence mode="wait">
          {selectedId && selectedService ? (
            <ServiceDetailView
              key="detail"
              service={selectedService as CompanyRecord}
              onBack={() => setSelectedId(null)}
              onRevoke={handleRevokeRequest}
              onReconnect={handleReconnect}
            />
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-32"
            >
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

                    <div className="flex gap-4">
                      <button className="btn-ghost flex h-11 items-center gap-2 px-6">
                        <Plus size={16} />
                        Connect Service
                      </button>
                      <button
                        onClick={handleRevokeAllRequest}
                        disabled={highRiskCount === 0}
                        className="btn-danger flex h-11 items-center gap-2 px-6 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <AlertTriangle size={16} />
                        Revoke All{highRiskCount > 0 ? ` (${highRiskCount})` : ""}
                      </button>
                    </div>
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

              {/* Main Content */}
              <Container className="py-16">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
                  <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center gap-6">
                      <h2 className="text-label-sm text-neutral-400">Your Data Map</h2>
                      <div className="h-[1px] flex-1 bg-neutral-100" />
                    </div>
                    <NodeGraph
                      companies={companies}
                      onNodeClick={(id) => setSelectedId(id)}
                      className="h-[500px]"
                    />
                  </div>

                  <div className="lg:col-span-4 flex flex-col gap-8">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-[var(--radius-xl)] border border-neutral-100 bg-white p-8 shadow-sm"
                    >
                      <h3 className="text-h3 text-neutral-900 tracking-tight">Service Map Legend</h3>
                      <p className="mt-4 text-body-sm leading-relaxed text-neutral-500 font-medium">
                        The map shows every service that currently holds your data. Each node represents a
                        different company tracking your information.
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

                {/* Inventory CTA */}
                <div className="mt-24">
                  <div className="mb-12 flex items-center gap-6">
                    <h2 className="text-label-sm text-neutral-400">Service Inventory</h2>
                    <div className="h-[1px] flex-1 bg-neutral-100" />
                  </div>

                  <div className="flex flex-col items-center justify-center py-20 rounded-[var(--radius-xl)] border border-neutral-100 bg-white shadow-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary-50)] text-[var(--color-primary-500)] mb-6">
                      <LayoutGrid size={28} />
                    </div>
                    <h3 className="text-h3 text-neutral-900 mb-2">Manage All Consents</h3>
                    <p className="text-body-md text-neutral-500 text-center max-w-sm mb-8">
                      Access your full inventory of {activeCount} active services. Filter by risk, category, or
                      search for specific data providers.
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
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Revoke confirmation modal — rendered outside main to avoid blur interference */}
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
