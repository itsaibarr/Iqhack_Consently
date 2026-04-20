"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MOCK_COMPANIES } from "@/lib/constants";
import { calculateCompanyImpact } from "@/lib/privacy";
import { motion } from "framer-motion";

// Dynamic import to avoid SSR issues with ForceGraph2D
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

const RISK_COLORS = {
  HIGH: "#EF4444",   // Red 500
  MEDIUM: "#F59E0B", // Amber 500
  LOW: "#10B981",    // Emerald 500
};

export function NodeGraph({ 
  companies, 
  onNodeClick 
}: { 
  companies: typeof MOCK_COMPANIES,
  onNodeClick?: (id: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight || 500,
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 500,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const graphData = useMemo(() => {
    const activeCompanies = companies.filter(c => c.status === "ACTIVE");
    
    const nodes = [
      { id: "ME", name: "IDENTITY CENTER", isUser: true, val: 24 },
      ...activeCompanies.map(c => ({
        id: c.id,
        name: c.name,
        isUser: false,
        risk: c.risk,
        val: Math.max(12, calculateCompanyImpact(c) * 1.8),
      }))
    ];

    const links = activeCompanies.map(c => ({
      source: "ME",
      target: c.id,
      width: 1,
    }));

    return { nodes, links };
  }, [companies]);

  if (!mounted) return (
    <div ref={containerRef} className="h-[500px] w-full rounded-3xl border border-neutral-100 bg-neutral-50 animate-pulse dark:border-neutral-800 dark:bg-neutral-900" />
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      ref={containerRef} 
      className="relative h-[500px] w-full overflow-hidden rounded-3xl border border-neutral-100 bg-white dark:border-neutral-900 dark:bg-neutral-950/50 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
    >
      <div className="absolute left-8 top-8 z-10 space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
            Live Sovereignty Map
          </h3>
        </div>
        <p className="text-xs font-medium text-neutral-500">
          Showing {graphData.nodes.length - 1} active data pipelines.
        </p>
      </div>

      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#ffffff00"
        nodeLabel="name"
        onNodeClick={(node: any) => {
          if (!node.isUser && onNodeClick) {
            onNodeClick(node.id);
          }
        }}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 11 / globalScale;
          const radius = node.val / 2;
          
          // Animation timing for pulse
          const time = Date.now() * 0.002;
          const pulse = node.risk === "HIGH" ? Math.sin(time) * 2 : 0;

          // Draw Pulse Aura for High Risk
          if (node.risk === "HIGH") {
            ctx.beginPath();
            ctx.arc(node.x, node.y, radius + 4 + Math.sin(time * 2) * 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
            ctx.fill();
          }

          // User Node Glow
          if (node.isUser) {
            ctx.shadowColor = "rgba(40, 81, 214, 0.4)";
            ctx.shadowBlur = 20 / globalScale;
          }

          // Main Node Circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius + (node.risk === "HIGH" ? pulse * 0.5 : 0), 0, 2 * Math.PI, false);
          ctx.fillStyle = node.isUser 
            ? "#2851D6" 
            : RISK_COLORS[node.risk as keyof typeof RISK_COLORS] || "#E5E5E5";
          ctx.fill();

          // Border for crispness
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 2 / globalScale;
          ctx.stroke();

          // Labels (only visible when zoomed in)
          if (globalScale > 1.2) {
            ctx.font = `600 ${fontSize}px Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#A3A3A3";
            ctx.fillText(label, node.x, node.y + radius + 14 / globalScale);
          }

          ctx.shadowBlur = 0; // Reset
        }}
        linkCanvasObject={(link: any, ctx) => {
          const start = link.source;
          const end = link.target;

          if (typeof start !== "object" || typeof end !== "object") return;

          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = "rgba(0, 0, 0, 0.05)";
          // Dark mode adjustment via simple detection or just subtle grey
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Moving "packet" animation on links
          const time = Date.now() * 0.001;
          const pos = (time % 2) / 2;
          const px = start.x + (end.x - start.x) * pos;
          const py = start.y + (end.y - start.y) * pos;

          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(40, 81, 214, 0.4)";
          ctx.fill();
        }}
      />
    </motion.div>
  );
}
