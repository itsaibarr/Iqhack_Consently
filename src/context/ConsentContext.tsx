"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { CompanyRecord, ActivityRecord, DEMO_USER_ID } from "@/lib/constants";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { DBCompanyRecord, DBHistoryRecord } from "@/types/consent";

interface ConsentContextType {
  user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string } | null;
  companies: CompanyRecord[];
  history: ActivityRecord[];
  revokeConsent: (id: string) => void;
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
  purpose: raw.purpose || "Service functionality"
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

  const revokeConsent = async (id: string) => {
    const company = companies.find((c) => c.id === id);
    if (!company || !user) return;

    try {
      const { error: updateError } = await supabase
        .from("companies")
        .update({ status: "REVOKED" })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      await supabase
        .from("history")
        .insert({
          user_id: user.id,
          company_name: company.name,
          action: "REVOKED",
          data_types: company.dataTypes.map((dt) => dt.name)
        });

    } catch (e) {
      console.error("Revocation failed", e);
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
    <ConsentContext.Provider value={{ user, companies, history, revokeConsent, addHistoryEvent, syncExtensionEvents }}>
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
