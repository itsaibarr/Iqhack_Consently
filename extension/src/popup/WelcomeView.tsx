import { Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { saveState } from "../lib/storage";

interface WelcomeViewProps {
  onSyncComplete: () => void;
}

export default function WelcomeView({ onSyncComplete }: WelcomeViewProps) {
  const handleConnect = async () => {
    // In a real hackathon demo, we trigger a window to the dashboard
    // or simulate a login. For now, since user is signed in on dashboard
    // we "connect" to the local auth state.
    const dashboardUrl = import.meta.env.VITE_DASHBOARD_URL || "https://consently.vercel.app/auth";
    window.open(dashboardUrl, "_blank");
    
    // Simulate successful handshake for the demo
    setTimeout(async () => {
      await saveState({ 
        handshakeComplete: true,
        userId: "demo@consently.ai",
        isDemoMode: true,
        events: [],
        lastSyncAt: new Date().toISOString()
      } as Parameters<typeof saveState>[0]);
      onSyncComplete();
    }, 2000);
  };

  return (
    <div className="flex h-[600px] w-[400px] flex-col items-center justify-center bg-neutral-25 px-8 text-center overflow-hidden relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary-500 blur-[100px]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent-500 blur-[100px]" />
      </div>

      <div className="relative space-y-8">
        {/* Handshake Visual */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <div className="absolute -inset-4 rounded-full bg-primary-100/50 blur-xl animate-pulse" />
             <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-md border border-neutral-100">
                <Shield size={40} className="text-primary-500" />
             </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 leading-tight">
              A Secure Handshake
            </h1>
            <p className="text-sm font-medium text-neutral-500 leading-relaxed max-w-[280px] mx-auto">
              Sync your browser with your Consently Hub to start monitoring data pulses in real-time.
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="space-y-3 pt-4">
          {[
            "Real-time OAuth tracking",
            "One-click data revocation",
            "Neural risk assessments"
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-white p-3 text-left shadow-sm">
              <CheckCircle2 size={16} className="text-success-500 shrink-0" />
              <span className="text-xs font-bold text-neutral-600 tracking-tight">{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-4 pt-4">
          <button 
            onClick={handleConnect}
            className="btn-primary w-full py-4 text-base shadow-lg shadow-primary-500/10 group"
          >
            Initiate Secure Connection
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>
          

        </div>
      </div>
    </div>
  );
}
