import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MindMapNode } from '../types';

interface MindMapViewProps {
  data: MindMapNode;
}

export const MindMapView: React.FC<MindMapViewProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const width = 800;
    const height = 600;

    // Detect dark mode
    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#FFFFFF' : '#0E1A2B';
    const linkColor = isDarkMode ? '#262626' : '#DDE3EA';
    const strokeColor = isDarkMode ? '#171717' : '#FFFFFF';
    const nodeColor = '#F59E0B'; // Primary Gold

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto")
      .style("font-family", "Inter, sans-serif");

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree().size([height - 100, width - 200]);
    treeLayout(root);

    const g = svg.append("g")
      .attr("transform", "translate(100, 50)");

    // Links
    g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x((d: any) => d.y)
        .y((d: any) => d.x) as any)
      .attr("fill", "none")
      .attr("stroke", linkColor)
      .attr("stroke-width", 2);

    // Nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

    node.append("circle")
      .attr("r", 8)
      .attr("fill", (d) => d.children ? textColor : nodeColor)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 3);

    node.append("text")
      .attr("dy", 4)
      .attr("x", (d) => d.children ? -16 : 16)
      .style("text-anchor", (d) => d.children ? "end" : "start")
      .text((d: any) => d.data.name)
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", textColor)
      .clone(true).lower()
      .attr("stroke", strokeColor)
      .attr("stroke-width", 4);

  }, [data]);

  return (
    <div className="w-full overflow-hidden bg-white dark:bg-darkCard rounded-[32px] shadow-soft border border-softBorder dark:border-darkBorder p-4">
      <svg ref={svgRef} className="w-full h-[600px]"></svg>
    </div>
  );
};