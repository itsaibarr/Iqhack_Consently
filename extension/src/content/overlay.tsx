import React, { useState, useEffect, useCallback } from "react";
import { ConsentEvent } from "../lib/types";

// Design Tokens (Mirrored from globals.css for consistent look)
const COLORS = {
  primary: "#3B6BF5",
  riskHigh: "#EF4444",
  riskMedium: "#FFC107",
  riskLow: "#10B981",
  neutral: "#F5F5F7",
  text: "#111113",
  textSecondary: "#8E8E93"
};

export const ConsentOverlay: React.FC<{ event: ConsentEvent; onAdd: () => void; onDismiss: () => void }> = ({ 
  event, 
  onAdd, 
  onDismiss 
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [added, setAdded] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => onDismiss(), 400);
  }, [onDismiss]);

  const handleAdd = useCallback(() => {
    setAdded(true);
    onAdd();
    setTimeout(() => handleDismiss(), 1500);
  }, [onAdd, handleDismiss]);

  useEffect(() => {
    // Auto-dismiss after 12s
    const timer = setTimeout(() => {
      if (!added) handleDismiss();
    }, 12000);
    return () => clearTimeout(timer);
  }, [added, handleDismiss]);

  const riskColor = event.overallRisk === "HIGH" ? COLORS.riskHigh : 
                    event.overallRisk === "MEDIUM" ? COLORS.riskMedium : COLORS.riskLow;

  return (
    <div className={`consently-overlay-root ${isClosing ? "fade-out" : "fade-in"}`} style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.appInfo}>
          <span style={styles.appName}>{event.appName}</span>
          <span style={styles.appDomain}>{event.appDomain}</span>
        </div>
        <div style={{ ...styles.riskBadge, backgroundColor: riskColor }}>
          {event.overallRisk}
        </div>
      </div>

      {/* Body */}
      <div style={styles.body}>
        <p style={styles.intro}>Requesting access to:</p>
        <div style={styles.scopeList}>
          {event.scopesTranslated.slice(0, 4).map((scope, i) => (
            <div key={i} style={styles.scopeItem}>
              <span style={getScopeDotStyle(scope.risk)} />
              <span style={styles.scopeLabel}>{scope.label}</span>
            </div>
          ))}
          {event.scopesTranslated.length > 4 && (
            <div style={styles.moreLabel}>+ {event.scopesTranslated.length - 4} more</div>
          )}
        </div>
        <p style={styles.summary}>
          {event.overallRisk === "HIGH" 
            ? "⚠ High-risk data request detected." 
            : "This is a standard identity request."}
        </p>
      </div>

      {/* Actions */}
      <div style={styles.footer}>
        {added ? (
          <div style={styles.successMsg}>✓ Added to Dashboard</div>
        ) : (
          <>
            <button onClick={handleDismiss} style={styles.ghostBtn}>Dismiss</button>
            <button onClick={handleAdd} style={styles.primaryBtn}>Add to Consently</button>
          </>
        )}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(20px); opacity: 0; } }
        .consently-overlay-root.fade-in { animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .consently-overlay-root.fade-out { animation: fadeOut 0.3s ease-in forwards; }
      `}</style>
    </div>
  );
};

const getScopeDotStyle = (risk: string): React.CSSProperties => ({
  width: "6px",
  height: "6px",
  borderRadius: "50%",
  backgroundColor: risk === "HIGH" ? COLORS.riskHigh : risk === "MEDIUM" ? COLORS.riskMedium : COLORS.riskLow
});

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "320px",
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    boxShadow: "0 12px 48px rgba(0,0,0,0.12)",
    border: "1px solid #EBEBED",
    padding: "20px",
    fontFamily: "Inter, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    zIndex: 999999
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  appInfo: {
    display: "flex",
    flexDirection: "column"
  },
  appName: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#111113",
    letterSpacing: "-0.02em"
  },
  appDomain: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  riskBadge: {
    padding: "4px 8px",
    borderRadius: "6px",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: "900",
    letterSpacing: "0.05em"
  },
  body: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  intro: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#8E8E93"
  },
  scopeList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },
  scopeItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  scopeLabel: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#48484A"
  },
  moreLabel: {
    fontSize: "11px",
    color: "#8E8E93",
    paddingLeft: "14px"
  },
  summary: {
    marginTop: "8px",
    fontSize: "11px",
    fontWeight: "600",
    color: "#48484A"
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #F5F5F7"
  },
  ghostBtn: {
    background: "none",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    color: "#8E8E93",
    cursor: "pointer"
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
    boxShadow: "0 4px 12px rgba(59, 107, 245, 0.2)"
  },
  successMsg: {
    fontSize: "13px",
    fontWeight: "700",
    color: COLORS.riskLow
  }
};
