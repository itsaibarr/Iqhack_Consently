"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Bell, Zap, Monitor, Lock, Trash2, ChevronRight, Check, Loader2 } from "lucide-react";
import { useConsent } from "@/context/ConsentContext";
import { getUserSettings, updateUserSettings, deleteUserAccount, UserSettings } from "@/actions/settings";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user } = useConsent();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getUserSettings(user.id).then((data) => {
        setSettings(data);
        setLoading(false);
      });
    }
  }, [user]);

  const handleToggle = async (key: keyof UserSettings, value: boolean | string) => {
    if (!user) return;
    
    setSaving(key);
    try {
      const updated = { ...settings!, [key]: value };
      setSettings(updated);
      await updateUserSettings(user.id, { [key]: value });
      
      // Keep "Saved" state for a moment
      setTimeout(() => setSaving(null), 1500);
    } catch (error) {
      console.error("Failed to save setting", error);
      setSaving(null);
      // Revert on error
      const original = await getUserSettings(user.id);
      setSettings(original);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUserAccount(user.id);
      router.push("/");
    } catch (error) {
      console.error("Delete failed", error);
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[var(--color-primary-500)] animate-spin" />
          <p className="text-label-md text-neutral-400">Loading sovereignty protocol...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] pt-20 pb-32">
      <Container>
        <div className="max-w-3xl mx-auto">
          <header className="mb-12">
            <h1 className="text-display-md text-neutral-900 tracking-tight text-center">System Settings</h1>
            <p className="text-body-md text-neutral-500 mt-2 text-center">Configure your sovereignty protocol and extension preferences.</p>
          </header>

          <div className="space-y-6">
            {/* Status Feedback Tooltip */}
            <AnimatePresence>
              {saving && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-neutral-900 text-white rounded-full text-label-md flex items-center gap-2 shadow-lg z-50"
                >
                  <Check size={14} className="text-emerald-400" />
                  Preferences updated
                </motion.div>
              )}
            </AnimatePresence>

            {/* Extension Connectivity */}
            <section className="rounded-[var(--radius-xl)] border border-neutral-100 bg-white overflow-hidden shadow-sm transition-all hover:shadow-md">
                <div className="p-8 border-b border-neutral-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-[var(--radius-lg)] bg-[var(--color-primary-50)] text-[var(--color-primary-500)] flex items-center justify-center">
                            <Monitor size={24} />
                        </div>
                        <div>
                            <h3 className="text-h3 text-neutral-900">Browser Extension</h3>
                            <p className="text-body-sm text-neutral-500">Real-time consent detection and handshake.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-label-sm font-bold tracking-tight">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected
                    </div>
                </div>
                <div className="p-8 bg-neutral-50/30">
                    <div className="flex items-center justify-between p-4 rounded-[var(--radius-lg)] bg-white border border-neutral-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Zap size={16} className="text-amber-500" />
                            <span className="text-label-md text-neutral-700 font-medium">Protocol Handshake Interval</span>
                        </div>
                        <span className="text-label-sm text-neutral-400 font-mono">{settings?.handshake_interval}ms</span>
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
                            <h3 className="text-h3 text-neutral-900">Privacy & Sovereignty</h3>
                            <p className="text-body-sm text-neutral-500">Manage how Consently protects your digital footprint.</p>
                        </div>
                    </div>
                </div>
                <div className="divide-y divide-neutral-100">
                    <SettingsToggle 
                        title="Stealth Mode" 
                        description="Automatically reject non-essential cookies and trackers on new domains." 
                        enabled={!!settings?.stealth_mode}
                        onChange={(val) => handleToggle("stealth_mode", val)}
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
                            <h3 className="text-h3 text-neutral-900">Alert Preferences</h3>
                            <p className="text-body-sm text-neutral-500">Stay informed about new data detections.</p>
                        </div>
                    </div>
                </div>
                <div className="divide-y divide-neutral-100">
                    <SettingsToggle 
                        title="New Consent Detections" 
                        description="Get notified when a new service attempts to access your identity." 
                        enabled={!!settings?.notifications_enabled}
                        onChange={(val) => handleToggle("notifications_enabled", val)}
                    />
                    <div className="p-8 flex items-center justify-between hover:bg-neutral-50/50 transition-colors group text-left">
                        <div>
                            <h4 className="text-label-md text-neutral-900 font-medium font-bold">Alert Frequency</h4>
                            <p className="text-body-sm text-neutral-500 mt-1">
                                Currently set to: <span className="text-[var(--color-primary-600)] font-semibold">
                                    {settings?.alert_frequency === 'high_priority' ? "High Priority Only" : "All Detections"}
                                </span>
                            </p>
                        </div>
                        <select 
                            value={settings?.alert_frequency}
                            onChange={(e) => handleToggle("alert_frequency", e.target.value)}
                            className="bg-transparent border-none text-[var(--color-primary-600)] font-bold text-[12px] uppercase tracking-wider focus:ring-0 cursor-pointer text-right"
                        >
                            <option value="high_priority">High Priority</option>
                            <option value="all">All Items</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Advanced / Danger Zone */}
            <section className="pt-12">
                <div className={cn(
                  "rounded-[var(--radius-xl)] border transition-all duration-300",
                  showDeleteConfirm ? "border-red-500 bg-red-50/30" : "border-red-100 bg-red-50/10"
                )}>
                    <div className="p-8">
                      <div className="flex items-center justify-between gap-8 flex-wrap">
                        <div className="flex-1 min-w-[240px]">
                            <h3 className="text-label-sm font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                                 Danger Zone
                            </h3>
                            <p className="text-body-sm text-neutral-500 mt-2">
                              {showDeleteConfirm 
                                ? "Are you absolutely sure? This will permanently delete your identity map and disconnect all verified services."
                                : "Permanently delete your sovereignty record and disconnect all accounts."}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {showDeleteConfirm ? (
                            <>
                              <button 
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-5 py-2.5 rounded-[var(--radius-md)] text-neutral-600 font-bold text-[12px] hover:bg-white transition-all shadow-sm border border-neutral-200"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={handleDeleteProfile}
                                disabled={deleting}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-red-600 text-white font-bold text-[12px] hover:bg-red-700 transition-all shadow-md active:scale-95"
                              >
                                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                Confirm Purge
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => setShowDeleteConfirm(true)}
                              className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-md)] bg-white border border-red-200 text-red-600 font-bold text-[12px] hover:bg-red-50 transition-all shadow-sm"
                            >
                                <Trash2 size={16} />
                                Delete Profile
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
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
        <div className={cn("p-8 flex items-center justify-between gap-8 transition-colors", disabled ? "opacity-50" : "hover:bg-neutral-50/30")}>
            <div className="flex-1">
                <h4 className="text-label-md text-neutral-900 font-bold">{title}</h4>
                <p className="text-body-sm text-neutral-500 mt-1">{description}</p>
            </div>
            <button 
                onClick={() => !disabled && onChange?.(!enabled)}
                className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors focus:ring-2 focus:ring-[var(--color-primary-200)] focus:ring-offset-2 focus:outline-none",
                    enabled ? "bg-[var(--color-primary-500)]" : "bg-neutral-300"
                )}
            >
                <motion.div 
                    animate={{ x: enabled ? 22 : 2 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="h-5 w-5 rounded-full bg-white shadow-sm mt-0.5"
                />
            </button>
        </div>
    );
}

function cn(...inputs: (string | boolean | undefined | null)[]) {
    return inputs.filter(Boolean).join(" ");
}
