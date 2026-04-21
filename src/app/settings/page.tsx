"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Bell, Zap, Monitor, Lock, Trash2, ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const [stealthMode, setStealthMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <main className="min-h-screen bg-[#FDFDFD] pt-20 pb-32">
      <Container>
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-display-md text-neutral-900 tracking-tight">System Settings</h1>
            <p className="text-body-md text-neutral-500 mt-2">Configure your sovereignty protocol and extension preferences.</p>
          </header>

          <div className="space-y-6">
            {/* Extension Connectivity */}
            <section className="rounded-[var(--radius-xl)] border border-neutral-100 bg-white overflow-hidden shadow-sm">
                <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[var(--radius-lg)] bg-[var(--color-primary-50)] text-[var(--color-primary-500)] flex items-center justify-center">
                            <Monitor size={24} />
                        </div>
                        <div>
                            <h3 className="text-h4 text-neutral-900">Browser Extension</h3>
                            <p className="text-body-sm text-neutral-500">Real-time consent detection and handshake.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-widest">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected
                    </div>
                </div>
                <div className="p-8 bg-neutral-50/50">
                    <div className="flex items-center justify-between p-4 rounded-[var(--radius-lg)] bg-white border border-neutral-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Zap size={16} className="text-amber-500" />
                            <span className="text-label-md text-neutral-700">Protocol Handshake Interval</span>
                        </div>
                        <span className="text-label-sm text-neutral-400">120ms</span>
                    </div>
                </div>
            </section>

            {/* Privacy Controls */}
            <section className="rounded-[var(--radius-xl)] border border-neutral-100 bg-white overflow-hidden shadow-sm">
                <div className="p-8 border-b border-neutral-100">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[var(--radius-lg)] bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Lock size={24} />
                        </div>
                        <div>
                            <h3 className="text-h4 text-neutral-900">Privacy & Sovereignty</h3>
                            <p className="text-body-sm text-neutral-500">Manage how Consently protects your digital footprint.</p>
                        </div>
                    </div>
                </div>
                <div className="divide-y divide-neutral-100">
                    <SettingsToggle 
                        title="Stealth Mode" 
                        description="Automatically reject non-essential cookies and trackers on new domains." 
                        enabled={stealthMode}
                        onChange={setStealthMode}
                    />
                    <SettingsToggle 
                        title="Global Revocation" 
                        description="One-click termination of all active data pipelines (simulated)." 
                        enabled={false}
                        disabled
                    />
                </div>
            </section>

            {/* Notifications */}
            <section className="rounded-[var(--radius-xl)] border border-neutral-100 bg-white overflow-hidden shadow-sm">
                <div className="p-8 border-b border-neutral-100">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[var(--radius-lg)] bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h3 className="text-h4 text-neutral-900">Alert Preferences</h3>
                            <p className="text-body-sm text-neutral-500">Stay informed about new data detections.</p>
                        </div>
                    </div>
                </div>
                <div className="divide-y divide-neutral-100">
                    <SettingsToggle 
                        title="New Consent Detections" 
                        description="Get notified when a new service attempts to access your identity." 
                        enabled={notifications}
                        onChange={setNotifications}
                    />
                    <button className="w-full p-8 flex items-center justify-between hover:bg-neutral-50 transition-colors group text-left">
                        <div>
                            <h4 className="text-label-md text-neutral-900">Alert Frequency</h4>
                            <p className="text-body-sm text-neutral-500 mt-1">Currently set to: High Priority Only</p>
                        </div>
                        <ChevronRight size={18} className="text-neutral-300 group-hover:text-neutral-900 transition-colors" />
                    </button>
                </div>
            </section>

            {/* Advanced / Danger Zone */}
            <section className="pt-12">
                <div className="rounded-[var(--radius-xl)] border border-red-100 bg-red-50/20 p-8 flex items-center justify-between">
                    <div>
                        <h3 className="text-label-md font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
                             Danger Zone
                        </h3>
                        <p className="text-body-sm text-neutral-500 mt-2">Permanently delete your sovereignty record and disconnect all accounts.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-white border border-red-200 text-red-600 font-bold text-[12px] hover:bg-red-50 transition-all shadow-sm">
                        <Trash2 size={16} />
                        Delete Profile
                    </button>
                </div>
            </section>
          </div>
        </div>
      </Container>
    </main>
  );
}

function SettingsToggle({ 
    title, 
    description, 
    enabled, 
    onChange, 
    disabled = false 
}: { 
    title: string; 
    description: string; 
    enabled: boolean; 
    onChange?: (val: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <div className={cn("p-8 flex items-center justify-between gap-8", disabled && "opacity-50")}>
            <div className="flex-1">
                <h4 className="text-label-md text-neutral-900">{title}</h4>
                <p className="text-body-sm text-neutral-500 mt-1">{description}</p>
            </div>
            <button 
                onClick={() => !disabled && onChange?.(!enabled)}
                className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none",
                    enabled ? "bg-[var(--color-primary-500)]" : "bg-neutral-200"
                )}
            >
                <motion.div 
                    animate={{ x: enabled ? 22 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="h-5 w-5 rounded-full bg-white shadow-sm"
                />
            </button>
        </div>
    );
}

function cn(...inputs: (string | boolean | undefined | null)[]) {
    return inputs.filter(Boolean).join(" ");
}
