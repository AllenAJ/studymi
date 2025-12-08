import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MindMapNode } from '../types';
import { ZoomIn, ZoomOut, Maximize2, Move } from 'lucide-react';

interface MindMapViewProps {
  data: MindMapNode;
}

export const MindMapView: React.FC<MindMapViewProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const width = 900;
    const height = 600;

    // Detect dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#FFFFFF' : '#0E1A2B';
    const linkColor = isDarkMode ? '#3f3f46' : '#DDE3EA';
    const strokeColor = isDarkMode ? '#171717' : '#FFFFFF';
    const nodeColor = '#F59E0B'; // Primary Gold

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "100%")
      .style("font-family", "Inter, sans-serif")
      .style("cursor", "grab");

    // Create a group for zoom/pan
    const g = svg.append("g")
      .attr("transform", "translate(100, 50)");
    
    gRef.current = g;

    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    // Initial transform
    const initialTransform = d3.zoomIdentity.translate(100, 50).scale(1);
    svg.call(zoom.transform, initialTransform);

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree().size([height - 150, width - 300]);
    treeLayout(root);

    // Links with curved paths
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any)
      .attr("fill", "none")
      .attr("stroke", linkColor)
      .attr("stroke-width", 2.5)
      .attr("opacity", 0)
      .transition()
      .duration(500)
      .delay((_, i) => i * 50)
      .attr("opacity", 1);

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`)
      .style("cursor", "pointer")
      .attr("opacity", 0);

    // Animate nodes in
    node.transition()
      .duration(400)
      .delay((_, i) => i * 80)
      .attr("opacity", 1);

    // Node circles with hover effect
    node.append("circle")
      .attr("r", (d) => d.depth === 0 ? 14 : d.children ? 10 : 8)
      .attr("fill", (d) => d.depth === 0 ? nodeColor : d.children ? textColor : nodeColor)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 3)
      .style("transition", "all 0.2s ease")
      .on("mouseover", function() {
        d3.select(this)
          .attr("r", (d: any) => (d.depth === 0 ? 18 : d.children ? 14 : 12))
          .attr("fill", nodeColor);
      })
      .on("mouseout", function(_, d: any) {
        d3.select(this)
          .attr("r", d.depth === 0 ? 14 : d.children ? 10 : 8)
          .attr("fill", d.depth === 0 ? nodeColor : d.children ? textColor : nodeColor);
      });

    // Node labels - show full text, wrap if needed
    node.each(function(d: any) {
      const nodeGroup = d3.select(this);
      const name = d.data.name || '';
      const isRoot = d.depth === 0;
      const hasChildren = !!d.children;
      
      // For long text, split into multiple lines
      const maxCharsPerLine = isRoot ? 20 : 30;
      const words = name.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach((word: string) => {
        if ((currentLine + ' ' + word).trim().length <= maxCharsPerLine) {
          currentLine = (currentLine + ' ' + word).trim();
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);
      
      // Limit to 3 lines max
      if (lines.length > 3) {
        lines.splice(3);
        lines[2] = lines[2].substring(0, lines[2].length - 3) + '...';
      }
      
      const textGroup = nodeGroup.append("g")
        .attr("transform", isRoot ? "translate(0, 25)" : "");
      
      lines.forEach((line, i) => {
        // Background stroke for readability
        textGroup.append("text")
          .attr("dy", isRoot ? i * 18 : 5 + (i - (lines.length - 1) / 2) * 16)
          .attr("x", isRoot ? 0 : hasChildren ? -18 : 18)
          .style("text-anchor", isRoot ? "middle" : hasChildren ? "end" : "start")
          .text(line)
          .style("font-size", isRoot ? "15px" : "12px")
          .style("font-weight", isRoot ? "700" : "600")
          .style("fill", textColor)
          .attr("stroke", strokeColor)
          .attr("stroke-width", 4)
          .attr("paint-order", "stroke");
        
        // Actual text
        textGroup.append("text")
          .attr("dy", isRoot ? i * 18 : 5 + (i - (lines.length - 1) / 2) * 16)
          .attr("x", isRoot ? 0 : hasChildren ? -18 : 18)
          .style("text-anchor", isRoot ? "middle" : hasChildren ? "end" : "start")
          .text(line)
          .style("font-size", isRoot ? "15px" : "12px")
          .style("font-weight", isRoot ? "700" : "600")
          .style("fill", textColor);
      });
      
      // Add title for full text on hover
      nodeGroup.append("title").text(name);
    });

  }, [data]);

  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 1.3);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current)
        .transition()
        .duration(300)
        .call(zoomRef.current.scaleBy, 0.7);
    }
  };

  const handleReset = () => {
    if (svgRef.current && zoomRef.current) {
      const initialTransform = d3.zoomIdentity.translate(100, 50).scale(1);
      d3.select(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomRef.current.transform, initialTransform);
    }
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button 
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white dark:bg-darkCard rounded-xl border border-softBorder dark:border-darkBorder shadow-sm flex items-center justify-center text-deepNavy dark:text-white hover:bg-iceGray dark:hover:bg-darkBorder transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white dark:bg-darkCard rounded-xl border border-softBorder dark:border-darkBorder shadow-sm flex items-center justify-center text-deepNavy dark:text-white hover:bg-iceGray dark:hover:bg-darkBorder transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button 
          onClick={handleReset}
          className="w-10 h-10 bg-white dark:bg-darkCard rounded-xl border border-softBorder dark:border-darkBorder shadow-sm flex items-center justify-center text-deepNavy dark:text-white hover:bg-iceGray dark:hover:bg-darkBorder transition-colors"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 left-4 z-10 bg-white/80 dark:bg-darkCard/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-softBorder dark:border-darkBorder text-xs font-bold text-steelGray dark:text-darkMuted">
        {Math.round(zoomLevel * 100)}%
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-white/80 dark:bg-darkCard/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-softBorder dark:border-darkBorder text-xs text-steelGray dark:text-darkMuted">
        <Move className="w-3 h-3" />
        <span>Drag to pan • Scroll to zoom</span>
      </div>

      {/* SVG Container */}
      <div className="w-full overflow-hidden bg-white dark:bg-darkCard rounded-[32px] shadow-soft border border-softBorder dark:border-darkBorder">
        <svg ref={svgRef} className="w-full h-[550px]"></svg>
      </div>
    </div>
  );
};
