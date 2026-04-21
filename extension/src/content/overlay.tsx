import React, { useState, useEffect, useCallback } from "react";
import { ConsentEvent } from "../lib/types";
import type { PolicyAnalysis } from "../background/privacyAnalyzer";

// Design Tokens
const COLORS = {
  primary: "#3B6BF5",
  riskHigh: "#EF4444",
  riskMedium: "#F59E0B",
  riskLow: "#10B981",
  neutral: "#F5F5F7",
  neutralDark: "#EBEBED",
  text: "#111113",
  textSecondary: "#8E8E93",
  textTertiary: "#AEAEB2",
  bgAnalyzing: "#F0F4FF",
};

interface Props {
  event: ConsentEvent;
  analyzing?: boolean;
  onAnalysisReady: (cb: (analysis: PolicyAnalysis) => void) => void;
  onAdd: () => void;
  onDismiss: () => void;
}

export const ConsentOverlay: React.FC<Props> = ({
  event,
  analyzing: initialAnalyzing = false,
  onAnalysisReady,
  onAdd,
  onDismiss,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [added, setAdded] = useState(false);
  const [analyzing, setAnalyzing] = useState(initialAnalyzing);
  const [analysis, setAnalysis] = useState<PolicyAnalysis | null>(null);
  const [takingLong, setTakingLong] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onDismiss(), 400);
  }, [onDismiss]);

  const handleAdd = useCallback(() => {
    setAdded(true);
    onAdd();
    setTimeout(() => handleDismiss(), 1500);
  }, [onAdd, handleDismiss]);

  // Register the update callback so background can push real analysis in
  useEffect(() => {
    onAnalysisReady((incoming: PolicyAnalysis) => {
      setAnalysis(incoming);
      setAnalyzing(false);
      setTakingLong(false);
    });
  }, [onAnalysisReady]);

  // Timer for "taking long" feedback
  useEffect(() => {
    if (analyzing && !analysis) {
      const timer = setTimeout(() => setTakingLong(true), 2500); // Reduced from 4s
      return () => clearTimeout(timer);
    }
  }, [analyzing, analysis]);

  // Auto-dismiss after 20s (longer than before to allow analysis to arrive)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!added) handleDismiss();
    }, 20000);
    return () => clearTimeout(timer);
  }, [added, handleDismiss]);

  const riskColor =
    (analysis?.riskVerdict ?? event.overallRisk) === "HIGH"
      ? COLORS.riskHigh
      : (analysis?.riskVerdict ?? event.overallRisk) === "MEDIUM"
      ? COLORS.riskMedium
      : COLORS.riskLow;

  const riskLabel = analysis?.riskVerdict ?? event.overallRisk;

  return (
    <div
      className={`consently-overlay-root ${isClosing ? "fade-out" : "fade-in"}`}
      style={styles.container}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.appInfo}>
          <span style={styles.appName}>{event.appName}</span>
          <span style={styles.appDomain}>{event.appDomain}</span>
        </div>
        <div style={{ ...styles.riskBadge, backgroundColor: riskColor }}>
          {riskLabel}
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        {analyzing && !analysis ? (
          // Loading state
          <div style={styles.analyzingBlock}>
            <div style={styles.spinnerRow}>
              <svg
                style={styles.spinner}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12" cy="12" r="10"
                  stroke={COLORS.primary}
                  strokeWidth="3"
                  strokeDasharray="31.4"
                  strokeDashoffset="10"
                  strokeLinecap="round"
                />
              </svg>
              <span style={styles.analyzingLabel}>Reading what {event.appName} collects about you...</span>
            </div>
            <p style={styles.analyzingHint}>
              {takingLong
                ? "Taking a bit longer than expected — still working through their privacy terms..."
                : "Fetching and analyzing the real privacy policy. This takes a moment."}
            </p>
            <div style={{ marginTop: "8px" }}>
              {/* Removed mock scopes. Just wait for analysis. */}
            </div>
          </div>
        ) : analysis?.source === "fallback" ? (
          // Honest fallback when analysis fails
          <div style={styles.fallbackBlock}>
            <p style={styles.intro}>
              We couldn&apos;t automatically analyze the privacy policy for this site.
            </p>
            <p style={styles.summary}>
              Please exercise caution and review their privacy policy manually before signing in.
            </p>
          </div>
        ) : analysis ? (
          // Real analysis from Gemini
          <div style={styles.analysisBlock}>
            {/* Red flag alert — the wow moment */}
            {analysis.redFlag && (
              <div style={styles.redFlagBlock}>
                <span style={styles.redFlagIcon}>⚠</span>
                <span style={styles.redFlagText}>{analysis.redFlag}</span>
              </div>
            )}

            {/* Plain summary */}
            <p style={styles.summary}>{analysis.plainSummary}</p>

            {/* Data collected */}
            <div style={styles.sectionLabel}>What they collect</div>
            <div style={styles.tagRow}>
              {analysis.dataCollected.map((item, i) => (
                <span key={i} style={styles.tag}>{item}</span>
              ))}
            </div>

            {/* Shared with */}
            {analysis.sharedWith.length > 0 && (
              <>
                <div style={{ ...styles.sectionLabel, marginTop: "8px" }}>Shared with</div>
                <div style={styles.tagRow}>
                  {analysis.sharedWith.map((party, i) => (
                    <span key={i} style={{ ...styles.tag, backgroundColor: "#FEF2F2", color: "#DC2626" }}>
                      {party}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Source label */}
            <div style={styles.sourceLabel}>
              ✓ Based on actual privacy policy
            </div>
          </div>
        ) : (
          // Should not be reached unless analysis is somehow falsy but analyzing is false
          <div style={{ height: "100px" }} />
        )}
      </div>

      {/* Actions */}
      <div style={styles.footer}>
        {added ? (
          <div style={styles.successMsg}>✓ Added to Dashboard</div>
        ) : (
          <>
            <button onClick={handleDismiss} style={styles.ghostBtn}>
              Dismiss
            </button>
            <button onClick={handleAdd} style={styles.primaryBtn}>
              Add to Consently
            </button>
          </>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes fadeOut {
          from { transform: translateX(0);   opacity: 1; }
          to   { transform: translateX(20px); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .consently-overlay-root.fade-in { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .consently-overlay-root.fade-out { animation: fadeOut 0.3s ease-in forwards; }
      `}</style>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "320px",
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    boxShadow: "0 12px 48px rgba(0,0,0,0.14)",
    border: "1px solid #EBEBED",
    padding: "20px",
    fontFamily: "Inter, -apple-system, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  appInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  appName: {
    fontSize: "18px",
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  appDomain: {
    fontSize: "11px",
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  riskBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.06em",
    flexShrink: 0,
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  // Analyzing state
  analyzingBlock: {
    backgroundColor: COLORS.bgAnalyzing,
    borderRadius: "10px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  spinnerRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  spinner: {
    width: "14px",
    height: "14px",
    animation: "spin 1s linear infinite",
    flexShrink: 0,
  },
  analyzingLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: COLORS.primary,
  },
  analyzingHint: {
    fontSize: "11px",
    color: COLORS.textSecondary,
    lineHeight: 1.4,
    margin: 0,
  },

  // Real analysis state
  analysisBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  redFlagBlock: {
    backgroundColor: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "8px",
    padding: "10px 12px",
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },
  redFlagIcon: {
    fontSize: "14px",
    flexShrink: 0,
    lineHeight: 1.4,
  },
  redFlagText: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#DC2626",
    lineHeight: 1.4,
  },
  summary: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#48484A",
    lineHeight: 1.5,
    margin: 0,
  },
  sectionLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  tagRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
  },
  tag: {
    backgroundColor: COLORS.neutral,
    color: "#48484A",
    fontSize: "10px",
    fontWeight: "600",
    padding: "3px 7px",
    borderRadius: "5px",
    letterSpacing: "0.02em",
  },
  sourceLabel: {
    fontSize: "10px",
    color: COLORS.riskLow,
    fontWeight: "600",
    marginTop: "2px",
  },

  fallbackBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "8px",
    padding: "16px",
    backgroundColor: "#F5F5F7",
    borderRadius: "12px",
    border: "1px solid #AEAEB2",
  },

  // Fallback mock state
  intro: {
    fontSize: "12px",
    fontWeight: "600",
    color: COLORS.textSecondary,
    margin: 0,
  },
  scopeList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  scopeItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  scopeLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#48484A",
  },
  moreLabel: {
    fontSize: "11px",
    color: COLORS.textSecondary,
    paddingLeft: "14px",
  },

  // Footer
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "10px",
    borderTop: `1px solid ${COLORS.neutralDark}`,
  },
  ghostBtn: {
    background: "none",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    color: COLORS.textSecondary,
    cursor: "pointer",
    padding: "0",
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    color: "#FFFFFF",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(59, 107, 245, 0.25)",
  },
  successMsg: {
    fontSize: "13px",
    fontWeight: "700",
    color: COLORS.riskLow,
  },
};
