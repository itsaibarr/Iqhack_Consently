"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { CompanyCard } from "@/components/consent/CompanyCard";
import { ServiceDetailView } from "@/components/consent/ServiceDetailView";
import { RevokeConfirmModal } from "@/components/consent/RevokeConfirmModal";
import { ToastContainer, useToast } from "@/components/ui/Toast";
import { CustomSelect, SelectOption } from "@/components/ui/CustomSelect";
import { useConsent } from "@/context/ConsentContext";
import { RiskLevel, CompanyRecord } from "@/lib/constants";

const CATEGORIES = ["EDUCATION", "GOVERNMENT", "FINANCIAL", "CONSUMER", "HEALTH"] as const;
const RISKS: RiskLevel[] = ["LOW", "MEDIUM", "HIGH"];

const RISK_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "All risks" },
  ...RISKS.map((risk) => ({ value: risk, label: risk })),
];

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "All categories" },
  ...CATEGORIES.map((cat) => ({ value: cat, label: cat })),
];

export default function InventoryPage() {
  const { companies, revokeConsent, reconnectService } = useConsent();
  const { toasts, showToast, dismiss } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string | "ALL">("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Modal state
  const [pendingRevokeId, setPendingRevokeId] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const isAvailable = company.status === "ACTIVE";
      const matchesSearch =
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = selectedRisk === "ALL" || company.risk === selectedRisk;
      const matchesCategory = selectedCategory === "ALL" || company.category === selectedCategory;
      return isAvailable && matchesSearch && matchesRisk && matchesCategory;
    });
  }, [companies, searchQuery, selectedRisk, selectedCategory]);

  const pendingService = companies.find((c) => c.id === pendingRevokeId) ?? null;

  const handleRevokeRequest = (id: string) => {
    setPendingRevokeId(id);
  };

  const handleRevokeConfirm = async (reason?: string) => {
    if (!pendingRevokeId) return;
    const name = pendingService?.name ?? "Service";
    setIsRevoking(true);
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
  };

  const handleReconnect = async (id: string) => {
    const company = companies.find((c) => c.id === id);
    const { success } = await reconnectService(id);
    showToast(
      success
        ? `${company?.name ?? "Service"} reconnected.`
        : "Failed to reconnect. Please try again.",
      success ? "success" : "error"
    );
  };

  const selectedService = companies.find((c) => c.id === selectedId) ?? null;

  return (
    <main className="min-h-screen bg-[#FDFDFD]">
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
            key="inventory"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pb-20"
          >
            {/* Page Header */}
            <div className="border-b border-neutral-100 bg-white pt-20 pb-10 mb-10">
              <Container>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <h1 className="text-display-lg text-neutral-900 leading-tight">Inventory</h1>
                    <p className="text-body-md text-neutral-600 max-w-md">
                      Granular control curated for your privacy and security goals.
                    </p>
                  </motion.div>
                </div>
              </Container>
            </div>

            <Container>
              {/* Filter Suite */}
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="w-full h-10 pl-10 pr-4 rounded-[var(--radius-md)] border border-neutral-200 bg-white text-body-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-all placeholder:text-neutral-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <CustomSelect
                    value={selectedRisk}
                    onChange={(val) => setSelectedRisk(val as RiskLevel | "ALL")}
                    options={RISK_OPTIONS}
                    className="w-36"
                  />
                  <CustomSelect
                    value={selectedCategory}
                    onChange={(val) => setSelectedCategory(val)}
                    options={CATEGORY_OPTIONS}
                    className="w-48"
                  />
                </div>
              </div>

              {/* Active Filter Indicators */}
              {(selectedRisk !== "ALL" || selectedCategory !== "ALL" || searchQuery !== "") && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-label-xs text-neutral-400 font-medium">ACTIVE FILTERS:</span>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-[var(--color-primary-50)] border border-[var(--color-primary-200)] text-[var(--color-primary-700)] text-label-xs rounded-full">
                        &quot;{searchQuery}&quot;{" "}
                        <X size={12} className="cursor-pointer hover:text-neutral-900" onClick={() => setSearchQuery("")} />
                      </span>
                    )}
                    {selectedRisk !== "ALL" && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-700 text-label-xs rounded-full uppercase">
                        Risk: {selectedRisk}{" "}
                        <X size={12} className="cursor-pointer hover:text-neutral-900" onClick={() => setSelectedRisk("ALL")} />
                      </span>
                    )}
                    {selectedCategory !== "ALL" && (
                      <span className="flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-700 text-label-xs rounded-full uppercase">
                        {selectedCategory}{" "}
                        <X size={12} className="cursor-pointer hover:text-neutral-900" onClick={() => setSelectedCategory("ALL")} />
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedRisk("ALL");
                        setSelectedCategory("ALL");
                      }}
                      className="text-label-xs font-semibold text-neutral-500 hover:text-neutral-900 ml-1 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                </div>
              )}

              {/* Results header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-body-md font-semibold text-neutral-900">
                  Showing {filteredCompanies.length} result{filteredCompanies.length !== 1 ? "s" : ""}
                </h2>
                <div className="text-label-xs text-neutral-400">AUTO-SYNCED WITH EXTENSION</div>
              </div>

              <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCompanies.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-32 rounded-[var(--radius-xl)] border-2 border-dashed border-neutral-200">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-6">
                      <Search size={28} />
                    </div>
                    <h3 className="text-h3 text-neutral-900 mb-2">No services found</h3>
                    <p className="text-body-md text-neutral-500 text-center max-w-sm">
                      Try adjusting your filters or search query to find the services you&apos;re looking for.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedRisk("ALL");
                        setSelectedCategory("ALL");
                      }}
                      className="mt-6 text-[var(--color-primary-500)] font-semibold hover:underline"
                    >
                      Reset all filters
                    </button>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredCompanies.map((company) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        key={company.id}
                      >
                        <CompanyCard
                          record={company}
                          onRevoke={handleRevokeRequest}
                          onReconnect={handleReconnect}
                          onViewDetails={(id) => setSelectedId(id)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revoke confirmation modal */}
      {pendingService && (
        <RevokeConfirmModal
          isOpen={!!pendingRevokeId}
          mode="single"
          service={pendingService}
          onConfirm={handleRevokeConfirm}
          onCancel={() => setPendingRevokeId(null)}
          isLoading={isRevoking}
        />
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </main>
  );
}
