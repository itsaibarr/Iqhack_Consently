"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X, ChevronRight, LayoutGrid, Info, ShieldAlert, ShieldCheck, ShieldInfo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { CompanyCard } from "@/components/consent/CompanyCard";
import { ServiceDetailDrawer } from "@/components/consent/ServiceDetailDrawer";
import { useConsent } from "@/context/ConsentContext";
import { RiskLevel, CompanyRecord } from "@/lib/constants";

const CATEGORIES = ["EDUCATION", "GOVERNMENT", "FINANCIAL", "CONSUMER", "HEALTH"] as const;
const RISKS: RiskLevel[] = ["LOW", "MEDIUM", "HIGH"];

export default function InventoryPage() {
  const { companies, revokeConsent } = useConsent();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | "ALL">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string | "ALL">("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter Logic
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            company.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = selectedRisk === "ALL" || company.risk === selectedRisk;
      const matchesCategory = selectedCategory === "ALL" || company.category === selectedCategory;
      
      return matchesSearch && matchesRisk && matchesCategory;
    });
  }, [companies, searchQuery, selectedRisk, selectedCategory]);

  const handleRevoke = async (id: string) => {
    await revokeConsent(id);
  };

  return (
    <main className="min-h-screen bg-neutral-50 pb-20 pt-10">
      <Container>
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 text-[var(--color-primary-500)] mb-4">
            <LayoutGrid size={24} />
            <span className="text-label-sm font-bold tracking-wider uppercase">Inventory</span>
          </div>
          <h1 className="text-h1 text-neutral-900 mb-2">Service Inventory</h1>
          <p className="text-body-lg text-neutral-500">
            Audit and manage data permissions for all connected services.
          </p>
        </div>

        {/* Filter Suite */}
        <div className="mb-12 flex flex-col gap-6 p-6 rounded-[var(--radius-xl)] bg-white border border-neutral-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search */}
            <div className="md:col-span-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
              <input 
                type="text" 
                placeholder="Search services, categories, or keywords..."
                className="w-full h-12 pl-12 pr-4 rounded-[var(--radius-md)] border border-neutral-200 bg-neutral-50 text-body-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Risk Selection */}
            <div className="md:col-span-3 flex items-center gap-2">
              <div className="flex h-12 w-full p-1 bg-neutral-50 rounded-[var(--radius-md)] border border-neutral-200">
                <button 
                  onClick={() => setSelectedRisk("ALL")}
                  className={`flex-1 text-label-xs rounded-[var(--radius-sm)] transition-all ${selectedRisk === "ALL" ? "bg-white shadow-sm text-neutral-900 font-medium" : "text-neutral-500 hover:text-neutral-700"}`}
                >
                  All Risks
                </button>
                {RISKS.map((risk) => (
                  <button 
                    key={risk}
                    onClick={() => setSelectedRisk(risk)}
                    className={`flex-1 text-label-xs rounded-[var(--radius-sm)] transition-all ${selectedRisk === risk ? "bg-white shadow-sm text-neutral-900 font-medium" : "text-neutral-500 hover:text-neutral-700"}`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>

            {/* Category selection */}
            <div className="md:col-span-3">
              <select 
                className="w-full h-12 px-4 rounded-[var(--radius-md)] border border-neutral-200 bg-neutral-50 text-body-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] transition-all appearance-none cursor-pointer"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(selectedRisk !== "ALL" || selectedCategory !== "ALL" || searchQuery !== "") && (
            <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
              <span className="text-label-xs text-neutral-400 font-medium">ACTIVE FILTERS:</span>
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-700 text-label-xs rounded-full">
                    "{searchQuery}" <X size={12} className="cursor-pointer hover:text-neutral-900" onClick={() => setSearchQuery("")} />
                  </span>
                )}
                {selectedRisk !== "ALL" && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-700 text-label-xs rounded-full uppercase">
                    Risk: {selectedRisk} <X size={12} className="cursor-pointer hover:text-neutral-900" onClick={() => setSelectedRisk("ALL")} />
                  </span>
                )}
                {selectedCategory !== "ALL" && (
                  <span className="flex items-center gap-2 px-3 py-1 bg-neutral-100 text-neutral-700 text-label-xs rounded-full uppercase">
                    {selectedCategory} <X size={12} className="cursor-pointer hover:text-neutral-900" onClick={() => setSelectedCategory("ALL")} />
                  </span>
                )}
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedRisk("ALL");
                    setSelectedCategory("ALL");
                  }}
                  className="text-label-xs text-[var(--color-primary-500)] hover:underline ml-2"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Grid */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-body-md font-semibold text-neutral-900">
            Showing {filteredCompanies.length} result{filteredCompanies.length !== 1 ? "s" : ""}
          </h2>
          <div className="text-label-xs text-neutral-400">
            AUTO-SYNCED WITH EXTENSION
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-32 rounded-[var(--radius-xl)] border-2 border-dashed border-neutral-200">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-6">
                <Search size={28} />
              </div>
              <h3 className="text-h3 text-neutral-900 mb-2">No services found</h3>
              <p className="text-body-md text-neutral-500 text-center max-w-sm">
                Try adjusting your filters or search query to find the services you're looking for.
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
                    onRevoke={handleRevoke}
                    onViewDetails={(id) => setSelectedId(id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>

        {/* Detail Drawer */}
        <ServiceDetailDrawer
          isOpen={!!selectedId}
          onClose={() => setSelectedId(null)}
          service={companies.find(c => c.id === selectedId) || null}
          onRevoke={handleRevoke}
        />
      </Container>
    </main>
  );
}
