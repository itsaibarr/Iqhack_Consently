"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { CompanyRecord, ActivityRecord, DEMO_USER_ID } from "@/lib/constants";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DBCompanyRecord, DBHistoryRecord } from "@/types/consent";
import { sendGdprDeletionRequest } from "@/actions/gdpr";

interface ConsentContextType {
  user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string } | null;
  companies: CompanyRecord[];
  history: ActivityRecord[];
  revokeConsent: (id: string, reason?: string) => Promise<{ success: boolean; emailSent: boolean; emailTo?: string }>;
  revokeAllHighRisk: (reason?: string) => Promise<{ count: number; emailsSent: number }>;
  reconnectService: (id: string) => Promise<{ success: boolean }>;
  addHistoryEvent: (event: Omit<ActivityRecord, "id">) => void;
  syncExtensionEvents: () => Promise<void>;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

const mapCompany = (raw: DBCompanyRecord): CompanyRecord => ({
  id: raw.id,
  name: raw.name,
  category: raw.category,
  risk: raw.risk,
  status: raw.status,
  dataTypes: raw.data_types || [],
  sharedWith: raw.shared_with || [],
  connectedAt: raw.connected_at,
  description: raw.description || "",
  logoUid: raw.logo_uid || "",
  lastAccessed: raw.last_accessed || "Never",
  purpose: raw.purpose || "Service functionality",
  policyReport: raw.policy_report ?? undefined
});

const mapHistory = (raw: DBHistoryRecord): ActivityRecord => ({
  id: raw.id,
  companyName: raw.company_name,
  action: raw.action,
  timestamp: raw.timestamp,
  dataTypes: raw.data_types || [],
  reason: raw.reason || ""
});

const getIsDemoMode = () => {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some(row => row.startsWith("consently_demo_mode=true"));
};

export function ConsentProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [history, setHistory] = useState<ActivityRecord[]>([]);
  const [user, setUser] = useState<ConsentContextType["user"]>(null);

  // Initial Fetch & Auth State
  useEffect(() => {
    const initAuth = async () => {
      const isDemo = getIsDemoMode();
      
      if (isDemo) {
        const demoUser = {
          id: DEMO_USER_ID,
          email: "demo@consently.ai",
          user_metadata: { full_name: "Demo User" }
        };
        setUser(demoUser);
        fetchUserData(demoUser.id);
        return;
      }


      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id);
      }
    };

    const fetchUserData = async (userId: string) => {
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("*")
        .eq("user_id", userId)
        .order("connected_at", { ascending: false });

      if (!companiesError && companiesData) {
        setCompanies((companiesData as unknown as DBCompanyRecord[]).map(mapCompany));
      }

      const { data: historyData, error: historyError } = await supabase
        .from("history")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false });

      if (!historyError && historyData) {
        setHistory((historyData as unknown as DBHistoryRecord[]).map(mapHistory));
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id);
      } else {
        if (!getIsDemoMode()) {
          setUser(null);
          setCompanies([]);
          setHistory([]);
          router.push("/auth");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-sync-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "companies", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCompanies((prev) => [mapCompany(payload.new as DBCompanyRecord), ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setCompanies((prev) => prev.map(c => c.id === payload.new.id ? mapCompany(payload.new as DBCompanyRecord) : c));
          } else if (payload.eventType === "DELETE") {
            setCompanies((prev) => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "history", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setHistory((prev) => [mapHistory(payload.new as DBHistoryRecord), ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const syncExtensionEvents = async () => {
    // Handled by sync API
  };

  const revokeConsent = async (id: string, reason?: string): Promise<{ success: boolean; emailSent: boolean; emailTo?: string }> => {
    const company = companies.find((c) => c.id === id);
    if (!company || !user) return { success: false, emailSent: false };

    try {
      // Optimistic update for immediate UI feedback
      setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status: "REVOKED" as const } : c)));

      const { error: updateError } = await supabase
        .from("companies")
        .update({ status: "REVOKED" })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) {
        // Rollback on error
        setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status: "ACTIVE" as const } : c)));
        throw updateError;
      }

      const { error: historyError } = await supabase.from("history").insert({
        user_id: user.id,
        company_name: company.name,
        action: "REVOKED",
        data_types: company.dataTypes.map((dt) => dt.name),
        reason: reason ?? null,
      });

      if (historyError) {
        console.error("History insertion failed:", historyError.message);
      }

      // Fire GDPR Article 17 deletion request to the company's DPO
      const userEmail = user.email ?? "unknown@user.com";
      const { sent, to } = await sendGdprDeletionRequest({
        companyName: company.name,
        userEmail,
        dataTypes: company.dataTypes.map((dt) => dt.name),
        reason,
        providedDpoEmail: company.policyReport?.dpoEmail,
      });

      return { success: true, emailSent: sent, emailTo: to };
    } catch (e) {
      console.error("Revocation failed", e);
      return { success: false, emailSent: false };
    }
  };

  const revokeAllHighRisk = async (reason?: string): Promise<{ count: number; emailsSent: number }> => {
    if (!user) return { count: 0, emailsSent: 0 };
    const targets = companies.filter((c) => c.risk === "HIGH" && c.status === "ACTIVE");
    if (targets.length === 0) return { count: 0, emailsSent: 0 };

    // Optimistic update for bulk action
    setCompanies((prev) => 
      prev.map((c) => (c.risk === "HIGH" && c.status === "ACTIVE" ? { ...c, status: "REVOKED" as const } : c))
    );

    const results = await Promise.all(targets.map((c) => revokeConsent(c.id, reason)));
    return {
      count: results.filter((r) => r.success).length,
      emailsSent: results.filter((r) => r.emailSent).length,
    };
  };

  const reconnectService = async (id: string): Promise<{ success: boolean }> => {
    const company = companies.find((c) => c.id === id);
    if (!company || !user) return { success: false };

    try {
      // Optimistic update
      setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status: "ACTIVE" as const } : c)));

      const { error } = await supabase
        .from("companies")
        .update({ status: "ACTIVE" })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        // Rollback
        setCompanies((prev) => prev.map((c) => (c.id === id ? { ...c, status: "REVOKED" as const } : c)));
        throw error;
      }

      await supabase.from("history").insert({
        user_id: user.id,
        company_name: company.name,
        action: "GRANTED",
        data_types: company.dataTypes.map((dt) => dt.name),
      });

      return { success: true };
    } catch (e) {
      console.error("Reconnect failed", e);
      return { success: false };
    }
  };

  const addHistoryEvent = async (event: Omit<ActivityRecord, "id">) => {
    if (!user) return;
    
    await supabase.from("history").insert({
      user_id: user.id,
      company_name: event.companyName,
      action: event.action,
      data_types: event.dataTypes
    });
  };

  return (
    <ConsentContext.Provider value={{ user, companies, history, revokeConsent, revokeAllHighRisk, reconnectService, addHistoryEvent, syncExtensionEvents }}>
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
