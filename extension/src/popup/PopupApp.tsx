import { useEffect, useState, useCallback } from "react";
import { Shield, Activity, Zap, RefreshCw, ChevronRight, Globe, Lock, ScanText } from "lucide-react";
import { getState } from "../lib/storage";
import WelcomeView from "./WelcomeView";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ConsentPulse {
  id: string;
  service: string;
  action: "ingested" | "shared" | "blocked" | "revoked";
  status?: "ACTIVE" | "REVOKED";
  timestamp: string;
  dataTypes: string[];
}

export default function PopupApp() {
  const [loading, setLoading] = useState(true);
  const [hasSync, setHasSync] = useState(false);
  const [pulses, setPulses] = useState<ConsentPulse[]>([]);
  const [score, setScore] = useState(88);



  const handleAnalyzePage = useCallback(() => {
    // Fire-and-forget — background acknowledges immediately, result appears as sidebar on the page
    chrome.runtime.sendMessage({ type: "ANALYZE_CURRENT_PAGE" });
    window.close();
  }, []);

  const refreshState = useCallback(async () => {
    try {
      const data = await getState();
      if (data.isDemoMode || (data.userId && data.handshakeComplete)) {
        setHasSync(true);
        
        const API_BASE = import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3000";
        const userId = data.userId || (data.isDemoMode ? "demo-user-id" : null);

        let serverCompanies = [];

        // Fetch global stats for unified score
        if (userId) {
          try {
            const res = await fetch(`${API_BASE}/api/consents?userId=${userId}&includeDetails=true`);
            if (res.ok) {
              const serverData = await res.json();
              serverCompanies = serverData.companies || [];
              
              if (serverData.score !== undefined) {
                setScore(serverData.score);
              } else {
                // Manual fallback calculation if API returns stats but no score
                const highDeduction = serverData.high * 15;
                const mediumDeduction = Math.min(45, serverData.medium * 5);
                const lowDeduction = Math.min(25, serverData.low * 1);
                const calculatedScore = Math.max(0, 100 - highDeduction - mediumDeduction - lowDeduction);
                setScore(calculatedScore);
              }
            }
          } catch (e) {
            console.warn("[Consently] Failed to fetch global stats, falling back to local calculation", e);
          }
        }

        // Map real events from storage to UI pulses, reconciled with server status
        const mappedPulses: ConsentPulse[] = data.events.slice(0, 12).map(event => {
          // Cross-reference with backend status
          const serverMatch = serverCompanies.find((c: any) => 
            c.name.toLowerCase() === event.appName.toLowerCase()
          );
          
          const status = serverMatch ? serverMatch.status : "ACTIVE";

          return {
            id: event.id,
            service: event.appName,
            status: status,
            action: status === "REVOKED" ? "revoked" : (event.userAction === "granted" ? "ingested" : "shared"),
            timestamp: new Date(event.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dataTypes: event.scopesTranslated.map(s => s.label.toLowerCase())
          };
        });

        setPulses(mappedPulses);

        // Fallback for score if fetch completely failed
        if (!userId || score === 88) {
          let high = 0;
          let medium = 0;
          let low = 0;
          const uniqueServices = new Set();
          
          data.events.slice(0, 20).forEach(event => {
            if (!uniqueServices.has(event.appName)) {
              uniqueServices.add(event.appName);
              if (event.overallRisk === "HIGH") high++;
              else if (event.overallRisk === "MEDIUM") medium++;
              else if (event.overallRisk === "LOW") low++;
            }
          });

          const highDeduction = high * 15;
          const mediumDeduction = Math.min(45, medium * 5);
          const lowDeduction = Math.min(25, low * 1);
          const calculatedScore = Math.max(0, 100 - highDeduction - mediumDeduction - lowDeduction);
          setScore(calculatedScore);
        }
      } else {
        setHasSync(false);
      }
    } catch (e) {
      console.error("Storage error:", e);
      setHasSync(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    const dataPromise = getState();
    dataPromise.then(data => {
      if (data.isDemoMode || (data.userId && data.handshakeComplete)) {
        refreshState();
      } else {
        setLoading(false);
      }
    });

    // Listen for sync completion from background script
    const listener = (message: { type: string }) => {
      if (message.type === "AUTH_SYNC_COMPLETE") {
        console.log("[Consently] Auth sync detected, refreshing popup...");
        refreshState();
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [refreshState]);

  if (loading) return (
    <div className="flex h-[600px] w-[400px] items-center justify-center bg-neutral-25">
      <RefreshCw className="h-6 w-6 animate-spin text-primary-500" />
    </div>
  );

  if (!hasSync) return <WelcomeView onSyncComplete={refreshState} />;

  return (
    <div className="flex h-[600px] w-[400px] flex-col bg-neutral-25 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-neutral-100 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white shadow-sm">
            <Shield size={18} />
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">Consently</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Live Radar</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Security Hub Card */}
        <section className="rounded-xl border border-neutral-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Security Score</h2>
            <Lock size={14} className="text-success-500" />
          </div>
          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-neutral-900">{score}</span>
              <span className="text-sm font-bold text-neutral-400">/100</span>
            </div>
            <div className="h-10 w-24 rounded-md bg-success-50 flex items-center justify-center">
              <span className="text-xs font-bold text-success-500">TRUSTED</span>
            </div>
          </div>
        </section>

        {/* Analyze This Page */}
        <section className="rounded-xl border border-primary-100 bg-primary-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white shadow-sm">
              <ScanText size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-neutral-900">Analyze This Page</h2>
              <p className="mt-0.5 text-[11px] font-medium leading-snug text-neutral-400">
                Navigate to any privacy policy, then click to decode what they actually collect.
              </p>
            </div>
          </div>
          <button
            onClick={handleAnalyzePage}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-600 active:scale-[0.98]"
          >
            <ScanText size={14} />
            Analyze Policy
          </button>
        </section>

        {/* Neural Feed / Pulse List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Privacy Events</h2>
            <Activity size={14} className="text-primary-500" />
          </div>

          <div className="space-y-3">
            {pulses.map((pulse) => (
              <div 
                key={pulse.id} 
                className={cn(
                  "service-card group cursor-pointer",
                  pulse.status === "REVOKED" && "service-card-revoked"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md text-white shadow-sm",
                      pulse.action === "ingested" ? "bg-primary-500" : 
                      pulse.action === "shared" ? "bg-accent-500" : 
                      pulse.action === "revoked" ? "bg-neutral-400" : "bg-risk-red-500"
                    )}>
                      {pulse.action === "ingested" ? <Zap size={18} /> : 
                       pulse.action === "shared" ? <Globe size={18} /> : 
                       pulse.action === "revoked" ? <Shield size={18} /> :
                       <Lock size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-neutral-900">{pulse.service}</h3>
                        {pulse.status === "REVOKED" && (
                          <span className="rounded bg-neutral-200 px-1 py-0.5 text-[8px] font-black text-neutral-600 uppercase tracking-widest leading-none">Revoked</span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-neutral-400">{pulse.timestamp}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-neutral-200 transition-colors group-hover:text-primary-500" />
                </div>
                
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pulse.dataTypes.map(type => (
                    <span key={type} className="rounded bg-neutral-50 px-1.5 py-0.5 text-[10px] font-bold text-neutral-500 uppercase tracking-tighter">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-100 bg-white p-4">
        <button 
          onClick={() => window.open(import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3000")}
          className="btn-primary w-full shadow-md"
        >
          Open Sovereignty Hub
        </button>
      </footer>
    </div>
  );
}
