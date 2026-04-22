"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Shield, ScanText, Activity, Zap, Lock,
  ChevronRight, RefreshCw, ArrowLeft, AlertTriangle,
  CheckCircle, Users, Eye,
} from "lucide-react";
import { getState } from "../lib/storage";
import type { PolicyAnalysis } from "../background/privacyAnalyzer";
import type { ConsentEvent } from "../lib/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type View = "dashboard" | "analyzing" | "analysis" | "error";

interface AnalysisState {
  event: ConsentEvent;
  analysis: PolicyAnalysis | null;
  domain: string;
}

// ---------------------------------------------------------------------------
// Root app
// ---------------------------------------------------------------------------

export default function SidePanelApp() {
  const [loading, setLoading] = useState(true);
  const [isLinked, setIsLinked] = useState(false);
  const [view, setView] = useState<View>("dashboard");
  const [analysisState, setAnalysisState] = useState<AnalysisState | null>(null);
  const [errorDomain, setErrorDomain] = useState<string>("");
  const [events, setEvents] = useState<ConsentEvent[]>([]);
  const [score, setScore] = useState(100);

  const loadState = useCallback(async () => {
    try {
      const data = await getState();
      const linked = !!(data.isDemoMode || (data.userId && data.handshakeComplete));
      setIsLinked(linked);
      if (linked) {
        setEvents(data.events.slice(0, 15));
        let high = 0;
        let medium = 0;
        let low = 0;
        const seen = new Set<string>();
        data.events.slice(0, 20).forEach(e => {
          if (!seen.has(e.appName)) {
            seen.add(e.appName);
            if (e.overallRisk === "HIGH") high++;
            else if (e.overallRisk === "MEDIUM") medium++;
            else if (e.overallRisk === "LOW") low++;
          }
        });
        const s = Math.max(0, 100 - (high * 15) - (medium * 5) - (low * 1));
        setScore(s);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setTimeout(() => loadState(), 0);

    // Auth messages still come via runtime (lightweight)
    const msgListener = (message: Record<string, unknown>) => {
      if (message.type === "AUTH_SYNC_COMPLETE") loadState();
    };
    chrome.runtime.onMessage.addListener(msgListener);

    // Analysis state comes via chrome.storage.session — reliable across MV3 service workers
    const storageListener = (changes: Record<string, chrome.storage.StorageChange>) => {
      const change = changes["consently_analysis"];
      if (!change?.newValue) return;
      const state = change.newValue as {
        status: "analyzing" | "ready" | "failed";
        domain: string;
        event?: ConsentEvent;
        analysis?: PolicyAnalysis;
      };

      if (state.status === "analyzing" && state.event) {
        setAnalysisState({ event: state.event, analysis: null, domain: state.domain });
        setView("analyzing");
      } else if (state.status === "ready" && state.analysis && state.event) {
        setAnalysisState({ event: state.event, analysis: state.analysis, domain: state.domain });
        setView("analysis");
      } else if (state.status === "failed") {
        setErrorDomain(state.domain);
        setView("error");
      }
    };
    chrome.storage.session.onChanged.addListener(storageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(msgListener);
      chrome.storage.session.onChanged.removeListener(storageListener);
    };
  }, [loadState]);

  const handleAnalyze = useCallback(async () => {
    // Query the active tab from the side panel — it has window context, service workers don't
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;
    chrome.runtime.sendMessage({ type: "ANALYZE_CURRENT_PAGE", tabId: tab.id });
  }, []);

  const handleSave = useCallback(() => {
    if (analysisState?.event) {
      chrome.runtime.sendMessage({ type: "CONSENT_ACCEPTED", event: analysisState.event });
      loadState();
      setView("dashboard");
      setAnalysisState(null);
    }
  }, [analysisState, loadState]);

  const handleDiscard = useCallback(() => {
    setView("dashboard");
    setAnalysisState(null);
    chrome.runtime.sendMessage({ type: "SIDEBAR_DISMISSED" });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-25">
        <RefreshCw className="h-5 w-5 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!isLinked) {
    return <LinkView onLinked={loadState} />;
  }

  return (
    <div className="flex h-screen flex-col bg-neutral-25 overflow-hidden">
      <Header />

      <main className="flex-1 overflow-y-auto">
        {view === "dashboard" && (
          <DashboardView
            score={score}
            events={events}
            onAnalyze={handleAnalyze}
            onRefresh={loadState}
          />
        )}
        {view === "analyzing" && (
          <AnalyzingView domain={analysisState?.domain ?? ""} />
        )}
        {view === "analysis" && analysisState?.analysis && (
          <AnalysisView
            analysis={analysisState.analysis}
            event={analysisState.event}
            onSave={handleSave}
            onDiscard={handleDiscard}
          />
        )}
        {view === "error" && (
          <ErrorView domain={errorDomain} onBack={() => setView("dashboard")} />
        )}
      </main>

      {view === "dashboard" && (
        <footer className="border-t border-neutral-100 bg-white px-4 py-3">
          <button
            onClick={() => window.open(import.meta.env.VITE_DASHBOARD_URL || "https://consently.vercel.app")}
            className="btn-primary w-full text-sm shadow-sm"
          >
            Open Dashboard
          </button>
        </footer>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function Header() {
  return (
    <header className="flex items-center justify-between border-b border-neutral-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-500 text-white">
          <Shield size={15} />
        </div>
        <span className="text-base font-bold tracking-tight text-neutral-900">Consently</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-success-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Active</span>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Dashboard view
// ---------------------------------------------------------------------------

function DashboardView({
  score, events, onAnalyze, onRefresh,
}: {
  score: number;
  events: ConsentEvent[];
  onAnalyze: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4 p-4">
      {/* Score */}
      <section className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Privacy Score</span>
          <Lock size={12} className="text-success-500" />
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-neutral-900">{score}</span>
            <span className="text-xs font-bold text-neutral-400">/100</span>
          </div>
          <span className={cn(
            "rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
            score >= 80 ? "bg-success-50 text-success-500" :
            score >= 50 ? "bg-amber-50 text-amber-600" :
            "bg-red-50 text-red-500"
          )}>
            {score >= 80 ? "Healthy" : score >= 50 ? "Moderate" : "At Risk"}
          </span>
        </div>
      </section>

      {/* Analyze CTA */}
      <section className="rounded-xl border border-primary-100 bg-primary-50 p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white">
            <ScanText size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-900">Analyze a Privacy Policy</p>
            <p className="mt-0.5 text-[11px] leading-snug text-neutral-500">
              Navigate to any privacy or terms page, then click below.
            </p>
          </div>
        </div>
        <button
          onClick={onAnalyze}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-600 active:scale-[0.98]"
        >
          <ScanText size={14} />
          Analyze Current Page
        </button>
      </section>

      {/* Events feed */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Recent Events</span>
          <button onClick={onRefresh} className="text-neutral-300 hover:text-neutral-500 transition-colors">
            <RefreshCw size={12} />
          </button>
        </div>

        {events.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Activity size={24} className="text-neutral-200 mb-2" />
            <p className="text-xs text-neutral-400">No events yet. Analyze a privacy policy to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map(event => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EventRow({ event }: { event: ConsentEvent }) {
  const riskColor =
    event.overallRisk === "HIGH" ? "bg-risk-red-500" :
    event.overallRisk === "MEDIUM" ? "bg-amber-500" :
    "bg-success-500";

  const riskTextColor =
    event.overallRisk === "HIGH" ? "text-red-600" :
    event.overallRisk === "MEDIUM" ? "text-amber-600" :
    "text-success-500";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-white p-3 shadow-sm">
      <div className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold", riskColor)}>
        {event.appName[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold text-neutral-900">{event.appName}</p>
        <p className="text-[10px] text-neutral-400">{new Date(event.detectedAt).toLocaleDateString()}</p>
      </div>
      <span className={cn("text-[10px] font-bold uppercase", riskTextColor)}>
        {event.overallRisk}
      </span>
      <ChevronRight size={12} className="text-neutral-200 flex-shrink-0" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analyzing view
// ---------------------------------------------------------------------------

function AnalyzingView({ domain }: { domain: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center gap-5 pt-20">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-primary-100 animate-ping opacity-40" />
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-50">
          <ScanText size={28} className="text-primary-500" />
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-bold text-neutral-900">Analyzing privacy policy</p>
        <p className="text-xs font-semibold text-primary-500">{domain}</p>
      </div>

      <div className="w-full space-y-2">
        {[85, 65, 78, 50, 70].map((w, i) => (
          <div
            key={i}
            className="h-2.5 rounded-full bg-neutral-100"
            style={{
              width: `${w}%`,
              background: "linear-gradient(90deg, #EBEBED 25%, #D1D1D6 50%, #EBEBED 75%)",
              backgroundSize: "300px 100%",
              animation: `shimmer 1.4s ease infinite`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>

      <p className="text-[11px] text-neutral-400 leading-relaxed max-w-xs">
        Reading what they collect, who they share it with, and surfacing any red flags.
      </p>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -300px 0; }
          100% { background-position: 300px 0; }
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Analysis view
// ---------------------------------------------------------------------------

function AnalysisView({
  analysis, event, onSave, onDiscard,
}: {
  analysis: PolicyAnalysis;
  event: ConsentEvent;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const riskColor =
    analysis.riskVerdict === "HIGH" ? "text-red-500" :
    analysis.riskVerdict === "MEDIUM" ? "text-amber-500" :
    "text-success-500";

  const riskBg =
    analysis.riskVerdict === "HIGH" ? "bg-red-50 border-red-100" :
    analysis.riskVerdict === "MEDIUM" ? "bg-amber-50 border-amber-100" :
    "bg-success-50 border-success-100";

  return (
    <div className="flex flex-col">
      {/* Analysis header */}
      <div className="sticky top-0 z-10 border-b border-neutral-100 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-base font-extrabold text-primary-500">
            {event.appName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-neutral-900">{event.appName}</p>
            <p className="text-[10px] text-neutral-400 truncate">{event.appDomain}</p>
          </div>
          <div className={cn("rounded-md border px-2 py-1 text-[10px] font-black uppercase tracking-wide", riskBg, riskColor)}>
            {analysis.riskVerdict}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 pb-24">
        {/* Red flag */}
        {analysis.redFlag && (
          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3.5">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-red-400 mb-1">Red Flag</p>
              <p className="text-xs font-medium leading-relaxed text-red-800">{analysis.redFlag}</p>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="space-y-2">
          <SectionLabel icon={<Eye size={11} />} label="Summary" />
          <p className="rounded-lg border border-neutral-100 bg-white p-3 text-xs leading-relaxed text-neutral-600">
            {analysis.plainSummary}
          </p>
        </div>

        {/* Data collected */}
        {analysis.dataCollected.length > 0 && (
          <div className="space-y-2">
            <SectionLabel icon={<Zap size={11} />} label="Data collected" />
            <div className="flex flex-wrap gap-1.5">
              {analysis.dataCollected.map((item, i) => (
                <span key={i} className="rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-semibold text-neutral-600">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Shared with */}
        {analysis.sharedWith.length > 0 && (
          <div className="space-y-2">
            <SectionLabel icon={<Users size={11} />} label="Shared with third parties" />
            <div className="flex flex-wrap gap-1.5">
              {analysis.sharedWith.map((party, i) => (
                <span key={i} className="rounded-md border border-red-100 bg-red-50 px-2 py-1 text-[10px] font-semibold text-red-600">
                  {party}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* User rights */}
        {analysis.userRights.length > 0 && (
          <div className="space-y-2">
            <SectionLabel icon={<CheckCircle size={11} />} label="Your rights" />
            <div className="space-y-1.5">
              {analysis.userRights.map((right, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle size={12} className="mt-0.5 flex-shrink-0 text-success-500" />
                  <p className="text-xs leading-relaxed text-neutral-600">{right}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Source */}
        <div className="flex items-center gap-1.5 pt-1">
          <div className="h-1.5 w-1.5 rounded-full bg-success-500" />
          <p className="text-[10px] text-neutral-400">Based on actual privacy policy text</p>
        </div>
      </div>

      {/* Sticky action footer */}
      <div className="fixed bottom-0 left-0 right-0 flex gap-2 border-t border-neutral-100 bg-white px-4 py-3">
        <button
          onClick={onDiscard}
          className="flex-1 rounded-lg border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-500 transition-all hover:bg-neutral-50 active:scale-[0.98]"
        >
          Discard
        </button>
        <button
          onClick={onSave}
          className="flex-1 rounded-lg bg-primary-500 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-600 active:scale-[0.98]"
        >
          Save to Dashboard
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error view
// ---------------------------------------------------------------------------

function ErrorView({ domain, onBack }: { domain: string; onBack: () => void }) {
  return (
    <div className="flex flex-col items-center p-8 pt-20 text-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50">
        <AlertTriangle size={24} className="text-amber-500" />
      </div>
      <div>
        <p className="text-sm font-bold text-neutral-900">Analysis failed</p>
        <p className="mt-1 text-xs text-neutral-400">{domain}</p>
      </div>
      <p className="max-w-xs text-xs leading-relaxed text-neutral-500">
        This page may not be a standard privacy policy, or the AI couldn&apos;t parse it. Review their policy manually.
      </p>
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-semibold text-primary-500 hover:underline">
        <ArrowLeft size={12} /> Back to dashboard
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Link account view
// ---------------------------------------------------------------------------

function LinkView({ onLinked }: { onLinked: () => void }) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 p-8 text-center bg-neutral-25">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-500 text-white shadow-lg">
        <Shield size={28} />
      </div>
      <div>
        <h1 className="text-lg font-extrabold text-neutral-900">Welcome to Consently</h1>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          Link your account to start tracking privacy consents.
        </p>
      </div>
      <button
        onClick={() => {
          window.open(import.meta.env.VITE_DASHBOARD_URL || "https://consently.vercel.app");
          // Poll for auth completion
          const interval = setInterval(async () => {
            const data = await getState();
            if (data.userId || data.isDemoMode) {
              clearInterval(interval);
              onLinked();
            }
          }, 1500);
        }}
        className="btn-primary w-full shadow-md"
      >
        Connect Account
      </button>
      <button
        onClick={async () => {
          await chrome.storage.local.set({ consently_state: { events: [], lastSyncAt: null, userId: null, userEmail: null, isDemoMode: true } });
          onLinked();
        }}
        className="text-xs font-semibold text-neutral-400 hover:text-neutral-600 transition-colors"
      >
        Try Demo Mode
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared utility
// ---------------------------------------------------------------------------

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-neutral-400">{icon}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</span>
    </div>
  );
}
