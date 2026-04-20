"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { LucideShieldCheck, LucideLoader2, LucideLayoutDashboard, Eye, EyeOff } from "lucide-react";

// Declare chrome global for extension handshake
declare const chrome: any;

/**
 * EXTENSION SYNC PROTOCOL
 * -----------------------
 * To sync auth with the browser extension, the web app must know the extension ID.
 * Replace 'YOUR_EXTENSION_ID' with the ID found in chrome://extensions.
 */
const EXTENSION_ID = "kegngnalimkofmfaeefinlljgdhomgon";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
   const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "complete" | "failed">("idle");

  // Sync session with extension upon successful auth
  const syncWithExtension = async (userId: string, userEmail: string) => {
    setSyncStatus("syncing");
    
    // Check if chrome.runtime is available (it should be if landed here from extension)
    if (typeof chrome !== "undefined" && chrome.runtime?.sendMessage) {
      try {
        chrome.runtime.sendMessage(
          EXTENSION_ID, 
          { type: "AUTH_SUCCESS", userId, userEmail },
          (response: { success?: boolean } | undefined) => {
            if (chrome.runtime.lastError) {
              console.warn("[Consently] Extension sync failed (ID might be wrong):", chrome.runtime.lastError);
              setSyncStatus("failed");
            } else if (response?.success) {
              console.log("[Consently] Auth synced with extension!");
              setSyncStatus("complete");
            }
          }
        );
      } catch (err) {
        console.error("[Consently] Unexpected error during extension sync:", err);
        setSyncStatus("failed");
      }
    } else {
      console.warn("[Consently] chrome.runtime not found. Extension sync skipped.");
      setSyncStatus("failed");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // DEMO BYPASS: If credentials match the demo account, we set a flag and bypass real auth
    // This ensures the demo works during the hackathon even if email rate limits are hit.
    if (!isSignUp && email === "demo@consently.ai" && password === "consently2024") {
      console.log("[Consently] Demo credentials detected. Engaging bypass mode.");
      
      // Set cookie for middleware access (expires in 1 day)
      document.cookie = "consently_demo_mode=true; path=/; max-age=86400; SameSite=Lax";
      
      await syncWithExtension("demo-user-id", "demo@consently.ai");
      
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }

    try {
      let result;
      if (isSignUp) {
        result = await supabase.auth.signUp({ email, password });
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
      }

      const { data, error: authError } = result;

      if (authError) throw authError;

      if (data.user) {
        // Clear bypass if we logged in with a real account
        document.cookie = "consently_demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        
        // Sync with extension before redirecting
        await syncWithExtension(data.user.id, data.user.email!);
        
        // Brief delay for visual feedback of the handshake
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      // Keep loading true if redirecting
      if (syncStatus === "idle") setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-25 p-8">
      <div className="w-full max-w-[400px] border border-neutral-100 bg-white p-8 shadow-sm rounded-xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
            <LucideShieldCheck size={24} />
          </div>
          <h1 className="text-display-lg font-bold tracking-tight text-neutral-900">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            {isSignUp 
              ? "Start managing your digital consent footprint today." 
              : "Sign in to access your personal consent dashboard."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="block w-full border border-neutral-200 bg-white px-4 py-2 text-sm rounded-md focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="block w-full border border-neutral-200 bg-white px-4 py-2 pr-12 text-sm rounded-md focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-risk-red-50 p-3 text-xs font-medium text-risk-red-600 border border-risk-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-600 hover:shadow hover:-translate-y-0.5 rounded-md disabled:bg-neutral-200 disabled:translate-y-0 disabled:shadow-none"
          >
            {loading ? (
              <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center space-y-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-medium text-primary-500 hover:underline"
          >
            {isSignUp ? "Already have an account? Sign In" : "New to Consently? Create Account"}
          </button>
        </div>

        {/* Demo Account Hint */}
        {!isSignUp && (
          <div className="mt-8 rounded-xl border border-primary-100 bg-primary-50/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary-500 text-white">
                <span className="text-[10px] font-bold">✨</span>
              </div>
              <h3 className="text-xs font-bold text-primary-900 uppercase tracking-wider">Demo Access</h3>
            </div>
            <p className="text-[11px] text-primary-700 leading-normal mb-3">
              Testing the dashboard? Use our pre-seeded demo account to skip the verification email.
            </p>
            <button
              onClick={() => {
                setEmail("demo@consently.ai");
                setPassword("consently2024");
              }}
              className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-[11px] font-semibold text-primary-600 border border-primary-200 hover:bg-primary-50 transition-colors"
            >
              <span>demo@consently.ai</span>
              <span className="opacity-40">Fill Credentials</span>
            </button>
          </div>
        )}

        {syncStatus !== "idle" && (
          <div className="mt-8 border-t border-neutral-100 pt-6">
            <div className="flex items-center space-x-3 rounded-lg bg-neutral-50 p-3 border border-neutral-100">
              {syncStatus === "syncing" && (
                <>
                  <LucideLoader2 className="h-4 w-4 animate-spin text-primary-500" />
                  <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">Syncing with Extension...</span>
                </>
              )}
              {syncStatus === "complete" && (
                <>
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-success-500 text-white">
                    <LucideShieldCheck size={10} />
                  </div>
                  <span className="text-[11px] font-medium text-success-600 uppercase tracking-wider">Extension Linked Successfully</span>
                </>
              )}
              {syncStatus === "failed" && (
                <>
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-neutral-400 text-white text-[8px] font-bold">?</div>
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Extension not detected</span>
                </>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
