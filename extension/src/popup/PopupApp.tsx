import { useEffect, useState } from "react";
import { Shield, Activity, Zap, RefreshCw, ChevronRight, Globe, Lock } from "lucide-react";
import { getState, saveState } from "../lib/storage";
import WelcomeView from "./WelcomeView";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ConsentPulse {
  id: string;
  service: string;
  action: "ingested" | "shared" | "blocked";
  timestamp: string;
  dataTypes: string[];
}

export default function PopupApp() {
  const [loading, setLoading] = useState(true);
  const [hasSync, setHasSync] = useState(false);
  const [pulses, setPulses] = useState<ConsentPulse[]>([]);
  const [score, setScore] = useState(88);

  useEffect(() => {
    refreshState();
  }, []);

  const refreshState = async () => {
    try {
      const data = await getState();
      if (data.isDemoMode || (data.userId && data.handshakeComplete)) {
        setHasSync(true);
        // Realistic demo pulses
        setPulses([
          { id: "1", service: "Google Auth", action: "ingested", timestamp: "Just now", dataTypes: ["email", "profile"] },
          { id: "2", service: "LinkedIn", action: "shared", timestamp: "2m ago", dataTypes: ["connections"] },
          { id: "3", service: "Meta AI", action: "blocked", timestamp: "15m ago", dataTypes: ["location"] },
        ]);
      } else {
        setHasSync(false);
      }
    } catch (e) {
      console.error("Storage error:", e);
      setHasSync(false);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Neural Feed / Pulse List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Privacy Events</h2>
            <Activity size={14} className="text-primary-500" />
          </div>

          <div className="space-y-3">
            {pulses.map((pulse) => (
              <div key={pulse.id} className="service-card group cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-md text-white shadow-sm",
                      pulse.action === "ingested" ? "bg-primary-500" : 
                      pulse.action === "shared" ? "bg-accent-500" : "bg-risk-red-500"
                    )}>
                      {pulse.action === "ingested" ? <Zap size={18} /> : 
                       pulse.action === "shared" ? <Globe size={18} /> : 
                       <Lock size={18} />}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-neutral-900">{pulse.service}</h3>
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
          onClick={() => window.open(import.meta.env.VITE_DASHBOARD_URL || "http://localhost:3000/dashboard")}
          className="btn-primary w-full shadow-md"
        >
          Open Sovereignty Hub
        </button>
        <p className="mt-3 text-center text-[10px] font-bold text-neutral-300">
          SECURE PROTOCOL V1.2 • AGENT ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </footer>
    </div>
  );
}
