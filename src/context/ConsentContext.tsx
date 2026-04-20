"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { CompanyRecord, ActivityRecord } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface ConsentContextType {
  user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null;
  companies: CompanyRecord[];
  history: ActivityRecord[];
  revokeConsent: (id: string) => void;
  addHistoryEvent: (event: Omit<ActivityRecord, "id">) => void;
  syncExtensionEvents: () => Promise<void>;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

// Helper mappers moved outside to avoid declaration-order issues and improve performance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapCompany = (raw: any): CompanyRecord => ({
  id: raw.id,
  name: raw.name,
  category: raw.category as CompanyRecord["category"],
  risk: raw.risk as CompanyRecord["risk"],
  status: raw.status as CompanyRecord["status"],
  dataTypes: (raw.data_types as CompanyRecord["dataTypes"]) || [],
  sharedWith: (raw.shared_with as string[]) || [],
  connectedAt: raw.connected_at,
  description: raw.description,
  logoUid: raw.logo_uid,
  lastAccessed: raw.last_accessed || "Never",
  purpose: raw.purpose || "Service functionality"
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapHistory = (raw: any): ActivityRecord => ({
  id: raw.id,
  companyName: raw.company_name,
  action: raw.action as ActivityRecord["action"],
  timestamp: raw.timestamp,
  dataTypes: (raw.data_types as string[]) || []
});

export function ConsentProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [history, setHistory] = useState<ActivityRecord[]>([]);
  const [user, setUser] = useState<ConsentContextType["user"]>(null);

  // Initial Fetch & Auth State
  useEffect(() => {
    const initAuth = async () => {
      // Check for demo bypass first (cookie is more reliable for middleware)
      const cookies = typeof document !== "undefined" ? document.cookie.split("; ") : [];
      const demoCookie = cookies.find(row => row.startsWith("consently_demo_mode="));
      const isDemo = demoCookie?.split("=")[1] === "true";
      
      if (isDemo) {
        const demoUser = {
          id: "demo-user-id",
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
      // Fetch Companies
      const query = supabase.from("companies").select("*");
      
      const { data: companiesData, error: companiesError } = await query
        .eq("user_id", userId)
        .order("connected_at", { ascending: false });

      if (!companiesError && companiesData) {
        setCompanies(companiesData.map(mapCompany));
      }

      // Fetch History
      const { data: historyData, error: historyError } = await supabase
        .from("history")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false });

      if (!historyError && historyData) {
        setHistory(historyData.map(mapHistory));
      }
    };

    initAuth();

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id);
      } else {
        // Only redirect if NOT in demo mode
        const cookies = typeof document !== "undefined" ? document.cookie.split("; ") : [];
        const isDemo = cookies.some(row => row.startsWith("consently_demo_mode=true"));

        if (!isDemo) {
          setUser(null);
          setCompanies([]);
          setHistory([]);
          router.push("/auth");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Real-time synchronization logic
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user-sync-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "companies", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCompanies((prev) => [mapCompany(payload.new), ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setCompanies((prev) => prev.map(c => c.id === payload.new.id ? mapCompany(payload.new) : c));
          } else if (payload.eventType === "DELETE") {
            setCompanies((prev) => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "history", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setHistory((prev) => [mapHistory(payload.new), ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Sync extension events on focus (Fallback for polling)
  const syncExtensionEvents = async () => {
    // This will be handled by the sync API now
  };

  const revokeConsent = async (id: string) => {
    const company = companies.find((c) => c.id === id);
    if (!company || !user) return;

    try {
      // Call Server Action or direct update
      const { error: updateError } = await supabase
        .from("companies")
        .update({ status: "REVOKED" })
        .eq("id", id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Log the revocation in history
      const { error: historyError } = await supabase
        .from("history")
        .insert({
          user_id: user.id,
          company_name: company.name,
          action: "REVOKED",
          data_types: company.dataTypes.map((dt) => dt.name)
        });

      if (historyError) throw historyError;

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
