import React, { useState, useEffect, useCallback } from "react";
import { ConsentEvent } from "../lib/types";
import type { PolicyAnalysis } from "../background/privacyAnalyzer";

const C = {
  primary: "#3B6BF5",
  primaryLight: "#EEF2FF",
  accent: "#14A89C",
  riskHigh: "#EF4444",
  riskHighBg: "#FEF2F2",
  riskHighBorder: "#FECACA",
  riskMedium: "#D97706",
  riskMediumBg: "#FFFBEB",
  riskMediumBorder: "#FDE68A",
  riskLow: "#10B981",
  riskLowBg: "#ECFDF5",
  riskLowBorder: "#A7F3D0",
  bg: "#FAFAFA",
  surface: "#FFFFFF",
  border: "#EBEBED",
  borderSubtle: "#F5F5F7",
  text: "#111113",
  textSecondary: "#6B6B6F",
  textTertiary: "#AEAEB2",
  tag: "#F0F0F2",
  tagText: "#48484A",
};

interface SidebarProps {
  event: ConsentEvent;
  analyzing: boolean;
  onAnalysisReady: (cb: (analysis: PolicyAnalysis) => void) => void;
  onSave: () => void;
  onDismiss: () => void;
}

export const ConsentSidebar: React.FC<SidebarProps> = ({
  event,
  analyzing: initialAnalyzing,
  onAnalysisReady,
  onSave,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(initialAnalyzing);
  const [analysis, setAnalysis] = useState<PolicyAnalysis | null>(null);
  const [saved, setSaved] = useState(false);
  const [takingLong, setTakingLong] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Register analysis callback
  useEffect(() => {
    onAnalysisReady((incoming: PolicyAnalysis) => {
      setAnalysis(incoming);
      setAnalyzing(false);
      setTakingLong(false);
    });
  }, [onAnalysisReady]);

  // "Taking long" hint after 5s
  useEffect(() => {
    if (!analyzing || analysis) return;
    const id = setTimeout(() => setTakingLong(true), 5000);
    return () => clearTimeout(id);
  }, [analyzing, analysis]);

  const handleDismiss = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => onDismiss(), 320);
  }, [onDismiss]);

  const handleSave = useCallback(() => {
    setSaved(true);
    onSave();
    setTimeout(() => handleDismiss(), 1800);
  }, [onSave, handleDismiss]);

  const riskVerdict = analysis?.riskVerdict ?? event.overallRisk;
  const riskColor = riskVerdict === "HIGH" ? C.riskHigh : riskVerdict === "MEDIUM" ? C.riskMedium : C.riskLow;
  const riskBg = riskVerdict === "HIGH" ? C.riskHighBg : riskVerdict === "MEDIUM" ? C.riskMediumBg : C.riskLowBg;
  const riskBorder = riskVerdict === "HIGH" ? C.riskHighBorder : riskVerdict === "MEDIUM" ? C.riskMediumBorder : C.riskLowBorder;

  const slideX = isLeaving ? "100%" : isVisible ? "0%" : "100%";

  return (
    <>
      {/* Dim backdrop — subtle, doesn't block the page */}
      <div
        onClick={handleDismiss}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.18)",
          opacity: isVisible && !isLeaving ? 1 : 0,
          transition: "opacity 320ms ease",
          cursor: "default",
        }}
      />

      {/* Sidebar panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "420px",
          backgroundColor: C.surface,
          borderLeft: `1px solid ${C.border}`,
          boxShadow: "-12px 0 48px rgba(0,0,0,0.12)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter, -apple-system, sans-serif",
          transform: `translateX(${slideX})`,
          transition: `transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
          zIndex: 1,
        }}
      >
        {/* ── Header ── */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.appAvatar}>{event.appName[0]?.toUpperCase()}</div>
            <div>
              <div style={s.appName}>{event.appName}</div>
              <div style={s.appDomain}>{event.appDomain}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {!analyzing && (
              <div style={{ ...s.riskBadge, backgroundColor: riskBg, color: riskColor, border: `1px solid ${riskBorder}` }}>
                {riskVerdict}
              </div>
            )}
            <button onClick={handleDismiss} style={s.closeBtn} title="Close">
              ✕
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div style={s.body}>
          {analyzing && !analysis ? (
            <LoadingState appName={event.appName} takingLong={takingLong} />
          ) : analysis?.source === "fallback" ? (
            <FallbackState appName={event.appName} />
          ) : analysis ? (
            <AnalysisReport analysis={analysis} />
          ) : null}
        </div>

        {/* ── Footer ── */}
        <div style={s.footer}>
          {saved ? (
            <div style={s.savedMsg}>✓ Saved to Dashboard</div>
          ) : (
            <>
              <button onClick={handleDismiss} style={s.ghostBtn}>Dismiss</button>
              <button
                onClick={handleSave}
                disabled={analyzing || !analysis || analysis.source === "fallback"}
                style={{
                  ...s.primaryBtn,
                  opacity: (analyzing || !analysis || analysis?.source === "fallback") ? 0.4 : 1,
                  cursor: (analyzing || !analysis || analysis?.source === "fallback") ? "not-allowed" : "pointer",
                }}
              >
                Save to Dashboard
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

function LoadingState({ appName, takingLong }: { appName: string; takingLong: boolean }) {
  return (
    <div style={s.loadingWrap}>
      <svg style={s.spinner} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={C.primary} strokeWidth="2.5"
          strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round" />
      </svg>
      <div style={s.loadingTitle}>Reading {appName}&apos;s privacy policy…</div>
      <div style={s.loadingHint}>
        {takingLong
          ? "Still working — some policies are long. Hang tight."
          : "Extracting what data they collect, who they share it with, and any red flags."}
      </div>
      <div style={s.skeletonWrap}>
        {[90, 70, 85, 55, 75].map((w, i) => (
          <div key={i} style={{ ...s.skeleton, width: `${w}%`, animationDelay: `${i * 120}ms` }} />
        ))}
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
    </div>
  );
}

function FallbackState({ appName }: { appName: string }) {
  return (
    <div style={s.fallbackWrap}>
      <div style={s.fallbackIcon}>⚠</div>
      <div style={s.fallbackTitle}>Analysis failed for {appName}</div>
      <p style={s.fallbackText}>
        The AI couldn&apos;t parse this page. It may not be a standard privacy policy, or the page text
        was too short. Review their policy manually before proceeding.
      </p>
    </div>
  );
}

function AnalysisReport({ analysis }: { analysis: PolicyAnalysis }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Red flag */}
      {analysis.redFlag && (
        <div style={s.redFlag}>
          <span style={s.redFlagIcon}>⚠</span>
          <div>
            <div style={s.redFlagLabel}>Red Flag</div>
            <div style={s.redFlagText}>{analysis.redFlag}</div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div style={s.section}>
        <div style={s.sectionLabel}>Summary</div>
        <p style={s.summaryText}>{analysis.plainSummary}</p>
      </div>

      {/* Data collected */}
      {analysis.dataCollected.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionLabel}>Data collected</div>
          <div style={s.tagRow}>
            {analysis.dataCollected.map((item, i) => (
              <span key={i} style={s.tag}>{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* Shared with */}
      {analysis.sharedWith.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionLabel}>Shared with third parties</div>
          <div style={s.tagRow}>
            {analysis.sharedWith.map((party, i) => (
              <span key={i} style={{ ...s.tag, backgroundColor: C.riskHighBg, color: C.riskHigh }}>
                {party}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* User rights */}
      {analysis.userRights.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionLabel}>Your rights</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {analysis.userRights.map((right, i) => (
              <div key={i} style={s.rightItem}>
                <span style={s.rightDot}>✓</span>
                <span style={s.rightText}>{right}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source */}
      <div style={s.sourceRow}>
        <span style={s.sourceDot} />
        Based on actual privacy policy text
      </div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    borderBottom: `1px solid ${C.border}`,
    backgroundColor: C.surface,
    flexShrink: 0,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minWidth: 0,
  },
  appAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: C.primaryLight,
    color: C.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "800",
    flexShrink: 0,
  },
  appName: {
    fontSize: "16px",
    fontWeight: "800",
    color: C.text,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  appDomain: {
    fontSize: "11px",
    fontWeight: "600",
    color: C.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  riskBadge: {
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: C.textTertiary,
    fontSize: "16px",
    lineHeight: 1,
    padding: "4px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 150ms",
  },
  body: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "20px",
    backgroundColor: C.bg,
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    borderTop: `1px solid ${C.border}`,
    backgroundColor: C.surface,
    flexShrink: 0,
  },
  ghostBtn: {
    background: "none",
    border: `1px solid ${C.border}`,
    fontSize: "13px",
    fontWeight: "600",
    color: C.textSecondary,
    cursor: "pointer",
    padding: "9px 16px",
    borderRadius: "8px",
    transition: "all 150ms",
  },
  primaryBtn: {
    backgroundColor: C.primary,
    color: "#FFFFFF",
    border: "none",
    padding: "9px 18px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(59,107,245,0.28)",
    transition: "all 150ms",
  },
  savedMsg: {
    fontSize: "13px",
    fontWeight: "700",
    color: C.riskLow,
  },

  // Loading state
  loadingWrap: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
    gap: "14px",
    textAlign: "center" as const,
  },
  spinner: {
    width: "32px",
    height: "32px",
    animation: "spin 1s linear infinite",
  },
  loadingTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: C.text,
    lineHeight: 1.3,
  },
  loadingHint: {
    fontSize: "12px",
    color: C.textSecondary,
    lineHeight: 1.5,
    maxWidth: "280px",
  },
  skeletonWrap: {
    width: "100%",
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    marginTop: "16px",
  },
  skeleton: {
    height: "12px",
    borderRadius: "6px",
    background: "linear-gradient(90deg, #F0F0F2 25%, #E8E8EA 50%, #F0F0F2 75%)",
    backgroundSize: "400px 100%",
    animation: "shimmer 1.4s infinite",
  },

  // Fallback state
  fallbackWrap: {
    padding: "40px 24px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "12px",
    textAlign: "center" as const,
  },
  fallbackIcon: {
    fontSize: "32px",
    color: C.riskMedium,
  },
  fallbackTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: C.text,
  },
  fallbackText: {
    fontSize: "13px",
    color: C.textSecondary,
    lineHeight: 1.6,
    margin: 0,
    maxWidth: "300px",
  },

  // Report sections
  section: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
  },
  sectionLabel: {
    fontSize: "10px",
    fontWeight: "800",
    color: C.textTertiary,
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
  },
  summaryText: {
    fontSize: "13px",
    color: C.textSecondary,
    lineHeight: 1.6,
    margin: 0,
    padding: "12px 14px",
    backgroundColor: C.surface,
    borderRadius: "8px",
    border: `1px solid ${C.border}`,
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: "5px",
  },
  tag: {
    backgroundColor: C.tag,
    color: C.tagText,
    fontSize: "11px",
    fontWeight: "600",
    padding: "4px 9px",
    borderRadius: "6px",
    letterSpacing: "0.01em",
  },
  rightItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },
  rightDot: {
    fontSize: "11px",
    color: C.riskLow,
    fontWeight: "800",
    flexShrink: 0,
    marginTop: "1px",
  },
  rightText: {
    fontSize: "12px",
    color: C.textSecondary,
    lineHeight: 1.5,
  },
  redFlag: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    backgroundColor: C.riskHighBg,
    border: `1px solid ${C.riskHighBorder}`,
    borderRadius: "10px",
    padding: "12px 14px",
  },
  redFlagIcon: {
    fontSize: "16px",
    flexShrink: 0,
    lineHeight: 1.4,
  },
  redFlagLabel: {
    fontSize: "10px",
    fontWeight: "800",
    color: C.riskHigh,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "3px",
  },
  redFlagText: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#991B1B",
    lineHeight: 1.5,
  },
  sourceRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "11px",
    color: C.textTertiary,
    fontWeight: "500",
    paddingTop: "4px",
  },
  sourceDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    backgroundColor: C.riskLow,
    flexShrink: 0,
  },
};
