"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert, Trash2, AlertTriangle } from "lucide-react";
import { CompanyRecord } from "@/lib/constants";

const REVOKE_REASONS = [
  { value: "", label: "Select a reason (optional)" },
  { value: "No longer use", label: "No longer use this service" },
  { value: "Privacy concern", label: "Privacy concern" },
  { value: "Security incident", label: "Security incident" },
  { value: "Data minimization", label: "Data minimization" },
  { value: "Other", label: "Other" },
] as const;

interface SingleModeProps {
  mode: "single";
  service: CompanyRecord;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface BulkModeProps {
  mode: "bulk";
  services: CompanyRecord[];
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type RevokeConfirmModalProps = (SingleModeProps | BulkModeProps) & { isOpen: boolean };

export function RevokeConfirmModal(props: RevokeConfirmModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    props.onConfirm(reason || undefined);
  };

  const handleCancel = () => {
    setReason("");
    props.onCancel();
  };

  const isBulk = props.mode === "bulk";
  const title = isBulk
    ? `Revoke ${(props as BulkModeProps).services.length} High-Risk Services`
    : `Revoke Access — ${(props as SingleModeProps).service.name}`;

  return (
    <AnimatePresence>
      {props.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCancel}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md rounded-[var(--radius-xl)] border border-neutral-100 bg-white shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-neutral-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-risk-red-50)]">
                    <ShieldAlert size={18} style={{ color: "var(--color-risk-red-500)" }} />
                  </div>
                  <h2 className="text-[15px] font-semibold text-neutral-900 leading-tight">{title}</h2>
                </div>
                <button
                  onClick={handleCancel}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">
                {isBulk ? (
                  <BulkBody services={(props as BulkModeProps).services} />
                ) : (
                  <SingleBody service={(props as SingleModeProps).service} />
                )}

                {/* Reason dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-neutral-500 uppercase tracking-wide">
                    Reason
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full h-10 rounded-[var(--radius-md)] border border-neutral-200 bg-white px-3 text-[13px] text-neutral-700 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] focus:border-[var(--color-primary-500)] transition-all"
                  >
                    {REVOKE_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Warning note */}
                <div className="flex items-start gap-2.5 rounded-lg bg-[var(--color-risk-red-50)] border border-[var(--color-risk-red-100)] px-4 py-3">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: "var(--color-risk-red-500)" }} />
                  <p className="text-[12px] text-[var(--color-risk-red-600)] leading-relaxed">
                    {isBulk
                      ? "Active API tokens for all selected services will be invalidated immediately. This action is logged."
                      : "Active API tokens and session credentials will be invalidated immediately. This action is logged."}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-neutral-100 px-6 py-4">
                <button
                  onClick={handleCancel}
                  disabled={props.isLoading}
                  className="h-9 px-4 rounded-[var(--radius-md)] text-[13px] font-medium text-neutral-600 hover:bg-neutral-50 border border-neutral-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={props.isLoading}
                  className="h-9 px-4 rounded-[var(--radius-md)] text-[13px] font-semibold text-white flex items-center gap-2 transition-all active:scale-95 disabled:opacity-60"
                  style={{ backgroundColor: "var(--color-risk-red-500)" }}
                  onMouseEnter={(e) => { if (!props.isLoading) e.currentTarget.style.backgroundColor = "var(--color-risk-red-600)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-risk-red-500)"; }}
                >
                  <Trash2 size={14} />
                  {props.isLoading ? "Revoking..." : "Revoke Access"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SingleBody({ service }: { service: CompanyRecord }) {
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-neutral-600 leading-relaxed">
        You are about to revoke <span className="font-semibold text-neutral-900">{service.name}</span>&apos;s
        access to your data.
      </p>
      
      <div className="space-y-4">
        {/* Data Types */}
        <div className="space-y-2">
            <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Data Types being revoked</p>
            <div className="flex flex-wrap gap-1.5">
                {service.dataTypes.map((dt) => (
                    <span key={dt.name} className="px-2 py-0.5 rounded-md bg-neutral-100 text-[11px] text-neutral-600 font-medium whitespace-nowrap">
                        {dt.name.replace(/_/g, " ")}
                    </span>
                ))}
            </div>
        </div>

        {/* Data Partners */}
        {service.sharedWith && service.sharedWith.length > 0 && (
            <div className="space-y-2">
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Connected Partners</p>
                <div className="flex flex-wrap gap-1.5">
                    {service.sharedWith.map((partner) => (
                        <span key={partner} className="px-2 py-0.5 rounded-md bg-red-50 text-[11px] text-red-600 font-medium whitespace-nowrap border border-red-100">
                            {partner}
                        </span>
                    ))}
                </div>
                <p className="text-[10px] text-neutral-400 italic mt-1">
                    Revoking {service.name} will also terminate these downstream connections.
                </p>
            </div>
        )}

        {/* Automated Request Info */}
        <div className="p-3 rounded-lg border border-primary-100 bg-primary-50/50 space-y-1.5">
            <p className="text-[11px] font-semibold text-primary-700 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldAlert size={12} />
                Automated Revocation Request
            </p>
            <p className="text-[12px] text-primary-800 leading-relaxed">
                A formal Article 17 (Right to Erasure) request will be dispatched to 
                <span className="font-semibold px-1.5 py-0.5 rounded bg-white border border-primary-200 mx-1">
                    {service.policyReport?.dpoEmail || `privacy@${service.name.toLowerCase().replace(/\s+/g, "")}.com`}
                </span>
            </p>
            <p className="text-[10px] text-primary-600">
                The service provider is legally obligated to respond within 30 days.
            </p>
        </div>
      </div>
    </div>
  );
}

function BulkBody({ services }: { services: CompanyRecord[] }) {
  return (
    <div className="space-y-3">
      <p className="text-[13px] text-neutral-600 leading-relaxed">
        You are about to revoke access for{" "}
        <span className="font-semibold text-neutral-900">{services.length} high-risk service{services.length !== 1 ? "s" : ""}</span>.
      </p>
      <div className="rounded-lg border border-neutral-100 bg-neutral-50 max-h-32 overflow-y-auto divide-y divide-neutral-100">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between px-3 py-2">
            <span className="text-[13px] font-medium text-neutral-800">{s.name}</span>
            <span className="text-[11px] font-bold text-[var(--color-risk-red-500)] uppercase tracking-wide">HIGH</span>
          </div>
        ))}
      </div>
    </div>
  );
}
