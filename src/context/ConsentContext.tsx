"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CompanyRecord, ActivityRecord, MOCK_COMPANIES, MOCK_HISTORY } from "@/lib/constants";

interface ConsentContextType {
  companies: CompanyRecord[];
  history: ActivityRecord[];
  revokeConsent: (id: string) => void;
  addHistoryEvent: (event: Omit<ActivityRecord, "id">) => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<CompanyRecord[]>(MOCK_COMPANIES);
  const [history, setHistory] = useState<ActivityRecord[]>(MOCK_HISTORY);

  const revokeConsent = (id: string) => {
    const company = companies.find((c) => c.id === id);
    if (!company) return;

    // 1. Update company status
    setCompanies((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "REVOKED" } : c))
    );

    // 2. Add to history
    const newEvent: ActivityRecord = {
      id: `h-new-${Date.now()}`,
      companyName: company.name,
      action: "REVOKED",
      timestamp: new Date().toLocaleString("en-GB", { 
        day: "2-digit", 
        month: "2-digit", 
        year: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      }),
      dataTypes: company.dataTypes.map((dt) => dt.name),
    };

    setHistory((prev) => [newEvent, ...prev]);
  };

  const addHistoryEvent = (event: Omit<ActivityRecord, "id">) => {
    const newEvent: ActivityRecord = {
      ...event,
      id: `h-new-${Date.now()}`,
    };
    setHistory((prev) => [newEvent, ...prev]);
  };

  return (
    <ConsentContext.Provider value={{ companies, history, revokeConsent, addHistoryEvent }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
}
