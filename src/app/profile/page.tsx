"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { useConsent } from "@/context/ConsentContext";
import { Shield, Mail, Fingerprint, Calendar, Award } from "lucide-react";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { useMemo } from "react";

export default function ProfilePage() {
  const { user, companies } = useConsent();
  const memberSince = useMemo(() => {
    const createdAt = user?.created_at;
    if (!createdAt) return "";
    const date = new Date(createdAt);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }, [user?.created_at]);

  const totalConsents = companies.length;
  const activeConsents = companies.filter(c => c.status === "ACTIVE").length;
  const revokedConsents = companies.filter(c => c.status === "REVOKED").length;
  
  // Simulated trust score logic
  const trustScore = Math.max(0, 100 - (companies.filter(c => c.risk === "HIGH" && c.status === "ACTIVE").length * 15));

  return (
    <main className="min-h-screen bg-[#FDFDFD] pt-20 pb-32">
      <Container>
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-center gap-8 pb-12 border-b border-neutral-100">
             <div className="relative">
                <div className="h-32 w-32 rounded-[var(--radius-xl)] bg-[var(--color-primary-500)] text-white flex items-center justify-center shadow-xl">
                    <span className="text-4xl font-bold">
                        {user?.email?.substring(0, 2).toUpperCase() || "US"}
                    </span>
                </div>
                <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center text-white shadow-lg">
                    <Shield size={18} fill="currentColor" />
                </div>
             </div>

             <div className="flex-1 text-center md:text-left space-y-2">
                <h1 className="text-display-md text-neutral-900 tracking-tight leading-tight">
                    {(user?.user_metadata?.full_name as string) || "User Account"}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-body-sm text-neutral-500">
                    <div className="flex items-center gap-2">
                        <Mail size={14} />
                        {user?.email}
                    </div>
                    {user?.id && (
                      <div className="flex items-center gap-2">
                          <Fingerprint size={14} />
                          ID: {user.id.substring(0, 8)}...
                      </div>
                    )}
                    {memberSince && (
                      <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          Member since {memberSince}
                      </div>
                    )}
                </div>
             </div>
          </div>

          {/* Sovereignty Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <SummaryCard 
                label="Total Connections" 
                value={totalConsents} 
                detail="Historical reach" 
            />
            <SummaryCard 
                label="Live Access" 
                value={activeConsents} 
                detail="Real-time access" 
            />
            <SummaryCard 
                label="Stopped Access" 
                value={revokedConsents} 
                detail="Successfully blocked" 
            />
          </div>

          {/* Reputation Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[var(--radius-xl)] border border-neutral-100 bg-white p-10 shadow-sm relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 text-[var(--color-primary-500)] mb-6">
                            <Award size={24} />
                            <h3 className="text-h3 text-neutral-900 tracking-tight">Safety Rating</h3>
                        </div>
                        
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-display-2xl font-bold text-neutral-900 leading-none">{trustScore}</span>
                            <span className="text-body-lg text-neutral-400 font-medium pb-1">/ 100</span>
                        </div>

                        <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden mb-8">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${trustScore}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-gradient-to-r from-[var(--color-primary-500)] to-[var(--color-accent-500)]"
                            />
                        </div>

                        <p className="text-body-md text-neutral-600 leading-relaxed max-w-xl">
                            {trustScore > 80 
                                ? "Excellent control. Your digital footprint is well-managed with minimal high-risk exposures. Continue monitoring for new third-party detections."
                                : "Your privacy score is being impacted by active high-risk consents. We recommend auditing your high-risk services to improve your security posture."}
                        </p>
                    </div>

                    {/* Decorative Background Element */}
                    <div className="absolute right-[-10%] top-[-10%] opacity-[0.03] pointer-events-none">
                        <Shield size={300} fill="currentColor" className="text-neutral-900" />
                    </div>
                </motion.div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="rounded-[var(--radius-xl)] border border-neutral-100 bg-white p-8 shadow-sm h-full flex flex-col">
                    <h4 className="text-label-sm text-neutral-400 uppercase tracking-widest mb-6">Security Tip</h4>
                    <p className="text-body-sm text-neutral-500 leading-relaxed mb-auto">
                        Did you know that revoking a single high-risk service can improve your privacy score by up to 15 points?
                    </p>
                    <button className="w-full mt-8 py-3 rounded-[var(--radius-md)] bg-neutral-900 text-white font-bold text-[12px] hover:bg-neutral-800 transition-all active:scale-95">
                        Audit High Risk Now
                    </button>
                </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
