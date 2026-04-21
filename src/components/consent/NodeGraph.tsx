"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CompanyRecord } from "@/lib/constants";
import { calculateCompanyImpact } from "@/lib/privacy";
import { motion } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GraphNode, GraphLink } from "@/types/consent";
import type { ForceGraphMethods } from "react-force-graph-2d";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  onNodeClick,
  className
}: { 
  companies: CompanyRecord[],
  onNodeClick?: (id: string) => void,
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(undefined);
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 });
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Highlight states
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<GraphLink>>(new Set());

  useEffect(() => {
    // Avoid synchronous setState during initial mount
    const frame = requestAnimationFrame(() => {
      setMounted(true);
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 500,
        });
      }
    });

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight || 500,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (mounted && fgRef.current) {
      // Snappier Obsidian-style forces
      const fg = fgRef.current;
      fg.d3Force('charge')?.strength(-400);
      fg.d3Force('link')?.distance(120);
      
      // These might not be in the type but exist in the runtime
      if (typeof (fg as any).d3VelocityDecay === 'function') (fg as any).d3VelocityDecay(0.3);
      if (typeof (fg as any).d3AlphaDecay === 'function') (fg as any).d3AlphaDecay(0.04);
      
      // Initial fit after a small delay to let forces settle
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 50);
        }
      }, 500);
    }
  }, [mounted]);

  const graphData = useMemo(() => {
    const activeCompanies = companies.filter(c => c.status === "ACTIVE");
    
    const nodes: GraphNode[] = [
      { id: "ME", name: "IDENTITY CENTER", isUser: true, val: 24 },
      ...activeCompanies.map(c => ({
        id: c.id,
        name: c.name,
        isUser: false,
        risk: c.risk,
        val: Math.max(12, calculateCompanyImpact(c) * 1.8),
      }))
    ];

    const links: GraphLink[] = activeCompanies.map(c => ({
      source: "ME",
      target: c.id,
      width: 1,
    }));

    return { nodes, links };
  }, [companies]);

  const updateHighlight = (node: GraphNode | null) => {
    setHighlightNodes(new Set());
    setHighlightLinks(new Set());

    if (node) {
      const neighbors = new Set<string>();
      const links = new Set<GraphLink>();
      
      graphData.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? (link.source as GraphNode).id : link.source;
        const targetId = typeof link.target === 'object' ? (link.target as GraphNode).id : link.target;
        
        if (sourceId === node.id || targetId === node.id) {
          neighbors.add(String(sourceId));
          neighbors.add(String(targetId));
          links.add(link);
        }
      });

      setHoverNode(node);
      setHighlightNodes(neighbors);
      setHighlightLinks(links);
    } else {
      setHoverNode(null);
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    if (fgRef.current && node?.x !== undefined && node?.y !== undefined) {
      fgRef.current.centerAt(node.x, node.y, 400);
      fgRef.current.zoom(2.5, 400);
    }
    
    if (node && !node.isUser && onNodeClick) {
      setTimeout(() => onNodeClick(node.id), 200);
    }
  };

  const handleZoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.5, 400);
  const handleZoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() * 0.7, 400);
  const handleFit = () => fgRef.current?.zoomToFit(400, 50);

  if (!mounted) return (
    <div ref={containerRef} className={cn("w-full rounded-3xl border border-neutral-100 bg-neutral-50 animate-pulse dark:border-neutral-800 dark:bg-neutral-900", className)} />
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      ref={containerRef} 
      className={cn(
        "relative w-full overflow-hidden rounded-3xl border border-neutral-100 bg-white dark:border-neutral-900 dark:bg-neutral-950/50 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
        isDragging ? "cursor-grabbing" : "cursor-grab",
        className
      )}
    >
      <div className="absolute left-8 top-8 z-10 space-y-1 pointer-events-none">
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

      {/* Navigation HUD */}
      <div className="absolute bottom-8 right-8 z-20 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-100 bg-white shadow-sm hover:bg-neutral-50 active:scale-95 transition-all text-neutral-600"
          title="Zoom In"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button 
          onClick={handleZoomOut}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-100 bg-white shadow-sm hover:bg-neutral-50 active:scale-95 transition-all text-neutral-600"
          title="Zoom Out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button 
          onClick={handleFit}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-100 bg-white shadow-sm hover:bg-neutral-50 active:scale-95 transition-all text-neutral-600"
          title="Fit to Screen"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 15v6h-6M3 9V3h6"></path></svg>
        </button>
      </div>

      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="#ffffff00"
        nodeLabel="name"
        onNodeClick={(node) => handleNodeClick(node as GraphNode)}
        onNodeHover={(node) => {
          updateHighlight(node as GraphNode | null);
          if (containerRef.current) {
            containerRef.current.style.cursor = node ? 'pointer' : (isDragging ? 'grabbing' : 'grab');
          }
        }}
        onNodeDrag={() => setIsDragging(true)}
        onNodeDragEnd={() => setIsDragging(false)}
        onBackgroundClick={() => {
            updateHighlight(null);
            fgRef.current?.zoomToFit(400, 50);
        }}
        onRenderFramePre={(ctx, globalScale) => {
            const dotSpacing = 40;
            const dotSize = 0.8;
            ctx.fillStyle = '#F0F0F0';
            
            const gridRange = 3000;
            for (let x = -gridRange; x < gridRange; x += dotSpacing) {
                for (let y = -gridRange; y < gridRange; y += dotSpacing) {
                    ctx.beginPath();
                    ctx.arc(x, y, dotSize / globalScale, 0, 2 * Math.PI);
                    ctx.fill();
                }
            }
        }}
                nodeCanvasObject={(node, ctx, globalScale) => {
          const graphNode = node as GraphNode;
          const label = graphNode.name;
          const fontSize = 11 / globalScale;
          const radius = graphNode.val / 2;
          
          // Focus logic
          const isFocused = highlightNodes.size === 0 || highlightNodes.has(graphNode.id);
          const alpha = isFocused ? 1 : 0.15;

          // Animation timing for pulse
          const time = Date.now() * 0.002;
          const pulse = graphNode.risk === "HIGH" ? Math.sin(time) * 2 : 0;

          ctx.save();
          ctx.globalAlpha = alpha;

          // Draw Pulse Aura for High Risk
          if (graphNode.risk === "HIGH" && isFocused) {
            ctx.beginPath();
            ctx.arc(graphNode.x || 0, graphNode.y || 0, radius + 4 + Math.sin(time * 2) * 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
            ctx.fill();
          }

          // User Node Glow & Advanced Pulse
          if (graphNode.isUser) {
            const glowPulse = Math.sin(time * 1.5) * 4;
            ctx.shadowColor = "rgba(40, 81, 214, 0.6)";
            ctx.shadowBlur = (25 + glowPulse) / globalScale;

            // Inner core pulse
            ctx.beginPath();
            ctx.arc(graphNode.x || 0, graphNode.y || 0, radius + 2 + Math.sin(time * 3) * 1, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(40, 81, 214, 0.1)";
            ctx.fill();
          }

          // Main Node Circle
          ctx.beginPath();
          ctx.arc(graphNode.x || 0, graphNode.y || 0, radius + (graphNode.risk === "HIGH" ? pulse * 0.5 : 0), 0, 2 * Math.PI, false);
          ctx.fillStyle = graphNode.isUser 
            ? "#2851D6" 
            : RISK_COLORS[graphNode.risk as keyof typeof RISK_COLORS] || "#E5E5E5";
          ctx.fill();

          // Border for crispness
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 2 / globalScale;
          ctx.stroke();

          // Labels (only visible when zoomed in or focused)
          const isSelected = hoverNode && graphNode.id === hoverNode.id;
          const labelAlpha = isSelected ? 1 : Math.max(0, Math.min(1, (globalScale - 1.1) * 5));

          if (labelAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = alpha * labelAlpha;
            ctx.font = `600 ${fontSize}px Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = graphNode.isUser ? "#1E3A8A" : "#737373";
            ctx.fillText(label, graphNode.x || 0, (graphNode.y || 0) + radius + 14 / globalScale);
            ctx.restore();
          }

          ctx.restore();
        }}
        linkCanvasObject={(link, ctx) => {
          const graphLink = link as unknown as GraphLink;
          const start = graphLink.source as GraphNode;
          const end = graphLink.target as GraphNode;

          if (!start.x || !start.y || !end.x || !end.y) return;

          // Focus logic
          const isFocused = highlightLinks.size === 0 || highlightLinks.has(link as unknown as GraphLink);
          const alpha = isFocused ? 0.2 : 0.02;

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Moving "packet" animation on links
          if (isFocused) {
            const time = Date.now() * 0.001;
            const pos = (time % 2) / 2;
            const px = start.x + (end.x - start.x) * pos;
            const py = start.y + (end.y - start.y) * pos;

            ctx.beginPath();
            ctx.arc(px, py, 1.5, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(40, 81, 214, 0.8)";
            ctx.fill();
          }
          ctx.restore();
        }}
      />
    </motion.div>
  );
}
