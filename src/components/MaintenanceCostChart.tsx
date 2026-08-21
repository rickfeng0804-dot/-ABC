import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  DollarSign, 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  Layers, 
  Wrench, 
  AlertTriangle, 
  Calendar,
  Filter
} from 'lucide-react';
import { MaintenanceRecord, ToolingItem, ToolingCategory } from '../types';

interface MaintenanceCostChartProps {
  maintenanceLogs: MaintenanceRecord[];
  toolings?: ToolingItem[];
}

type ViewMode = 'category_breakdown' | 'time_trend';

export const MaintenanceCostChart: React.FC<MaintenanceCostChartProps> = ({
  maintenanceLogs,
  toolings = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('category_breakdown');
  const [hoveredData, setHoveredData] = useState<any | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // ResizeObserver for dynamic D3 responsive SVG width
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(Math.max(320, containerRef.current.clientWidth));
      }
    };

    updateWidth();
    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Helper to map log to category
  const getCategoryForLog = (log: MaintenanceRecord): ToolingCategory => {
    if (toolings.length > 0) {
      const matched = toolings.find(t => t.id === log.toolingId);
      if (matched) return matched.category;
    }
    // Fallback detection from tooling ID or tooling name
    const id = log.toolingId.toUpperCase();
    const name = log.toolingName;
    if (id.includes('WND') || id.includes('WIND') || name.includes('繞線')) return '繞線模具';
    if (id.includes('MOLD') || name.includes('成型') || name.includes('壓鑄')) return '成型模具';
    if (id.includes('DISP') || name.includes('點膠') || name.includes('夾具')) return '點膠治具';
    if (id.includes('TEST') || name.includes('測試')) return '測試治具';
    return '繞線模具';
  };

  // Categorized Cost Breakdown Data
  const categories: ToolingCategory[] = ['繞線模具', '成型模具', '點膠治具', '測試治具'];
  const categoryStats = categories.map(cat => {
    const logsInCat = maintenanceLogs.filter(l => getCategoryForLog(l) === cat);
    const pmCost = logsInCat.filter(l => l.type === '定期保養').reduce((acc, c) => acc + (c.cost || 0), 0);
    const rmCost = logsInCat.filter(l => l.type !== '定期保養').reduce((acc, c) => acc + (c.cost || 0), 0);
    const totalCost = pmCost + rmCost;
    const count = logsInCat.length;
    const avgCost = count > 0 ? Math.round(totalCost / count) : 0;

    return {
      category: cat,
      pmCost,
      rmCost,
      totalCost,
      count,
      avgCost
    };
  });

  const grandTotalCost = categoryStats.reduce((acc, c) => acc + c.totalCost, 0);
  const grandTotalPmCost = categoryStats.reduce((acc, c) => acc + c.pmCost, 0);
  const grandTotalRmCost = categoryStats.reduce((acc, c) => acc + c.rmCost, 0);

  // Highest spending category
  const topCategory = [...categoryStats].sort((a, b) => b.totalCost - a.totalCost)[0];

  // Time trend data sorted chronologically
  const chronologicalLogs = [...maintenanceLogs].sort((a, b) => 
    new Date(a.maintenanceDate).getTime() - new Date(b.maintenanceDate).getTime()
  );

  let runningCumulative = 0;
  const timeTrendData = chronologicalLogs.map(l => {
    runningCumulative += (l.cost || 0);
    return {
      date: l.maintenanceDate,
      cost: l.cost || 0,
      cumulativeCost: runningCumulative,
      id: l.id,
      toolingName: l.toolingName,
      type: l.type,
      category: getCategoryForLog(l)
    };
  });

  // D3 Rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    if (viewMode === 'category_breakdown') {
      // D3 Stacked / Grouped Bar Chart for Category Costs
      const margin = { top: 35, right: 30, bottom: 45, left: 80 };
      const height = 280;
      const width = containerWidth;

      svg.attr('width', width).attr('height', height);

      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // X Scale (Categories)
      const xScale = d3.scaleBand()
        .domain(categoryStats.map(c => c.category))
        .range([0, chartWidth])
        .padding(0.35);

      // Max Y Scale Value
      const maxCost = d3.max(categoryStats, c => Math.max(c.totalCost, 10000)) || 20000;
      const yScale = d3.scaleLinear()
        .domain([0, maxCost * 1.15])
        .nice()
        .range([chartHeight, 0]);

      // Y-Axis
      g.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${(Number(d) / 1000).toFixed(0)}k`))
        .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
        .call(g => g.selectAll('.tick line').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '2,2'))
        .call(g => g.selectAll('.tick text').attr('fill', '#475569').attr('font-size', '10px').attr('font-family', 'monospace').attr('font-weight', '600'));

      // X-Axis
      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
        .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
        .call(g => g.selectAll('.tick text')
          .attr('fill', '#1e293b')
          .attr('font-size', '11px')
          .attr('font-weight', 'bold'));

      // Draw Bars for each category
      categoryStats.forEach(cat => {
        const catX = xScale(cat.category) || 0;
        const bw = xScale.bandwidth();

        const barGroup = g.append('g')
          .attr('class', 'category-bar-group')
          .style('cursor', 'pointer')
          .on('mouseenter', (event) => {
            setHoveredData(cat);
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              setTooltipPos({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
              });
            }
          })
          .on('mousemove', (event) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              setTooltipPos({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
              });
            }
          })
          .on('mouseleave', () => {
            setHoveredData(null);
            setTooltipPos(null);
          });

        // Background Bar Track
        barGroup.append('rect')
          .attr('x', catX)
          .attr('y', 0)
          .attr('width', bw)
          .attr('height', chartHeight)
          .attr('rx', 6)
          .attr('fill', '#f1f5f9')
          .attr('opacity', 0.8);

        // PM Cost Bar Segment (Green)
        const pmHeight = chartHeight - yScale(cat.pmCost);
        const pmY = yScale(cat.pmCost);

        barGroup.append('rect')
          .attr('x', catX)
          .attr('y', chartHeight)
          .attr('width', bw)
          .attr('height', 0)
          .attr('rx', cat.rmCost === 0 ? 6 : 0)
          .attr('fill', '#10b981')
          .attr('opacity', 0.9)
          .transition()
          .duration(600)
          .attr('y', pmY)
          .attr('height', pmHeight);

        // RM Cost Bar Segment (Orange/Red Stacked on Top)
        const rmHeight = chartHeight - yScale(cat.rmCost);
        const rmY = pmY - rmHeight;

        if (cat.rmCost > 0) {
          barGroup.append('rect')
            .attr('x', catX)
            .attr('y', pmY)
            .attr('width', bw)
            .attr('height', 0)
            .attr('rx', 6)
            .attr('fill', '#f59e0b')
            .attr('opacity', 0.95)
            .transition()
            .duration(600)
            .attr('y', rmY)
            .attr('height', rmHeight);
        }

        // Total Cost Label above bar
        const totalY = cat.totalCost > 0 ? yScale(cat.totalCost) - 8 : chartHeight - 8;
        barGroup.append('text')
          .attr('x', catX + bw / 2)
          .attr('y', totalY)
          .attr('text-anchor', 'middle')
          .attr('fill', cat.totalCost > 0 ? '#0369a1' : '#94a3b8')
          .attr('font-weight', 'bold')
          .attr('font-size', '11px')
          .attr('font-family', 'monospace')
          .text(cat.totalCost > 0 ? `NT$${cat.totalCost.toLocaleString()}` : '無紀錄');
      });

      // Chart Legend
      const legend = g.append('g').attr('transform', `translate(0, -18)`);
      
      // PM Legend
      legend.append('rect')
        .attr('x', chartWidth - 210)
        .attr('y', 0)
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 3)
        .attr('fill', '#10b981');

      legend.append('text')
        .attr('x', chartWidth - 192)
        .attr('y', 10)
        .attr('fill', '#334155')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text('定期保養 (PM)');

      // RM Legend
      legend.append('rect')
        .attr('x', chartWidth - 100)
        .attr('y', 0)
        .attr('width', 12)
        .attr('height', 12)
        .attr('rx', 3)
        .attr('fill', '#f59e0b');

      legend.append('text')
        .attr('x', chartWidth - 82)
        .attr('y', 10)
        .attr('fill', '#334155')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .text('異常修繕 (RM)');

    } else {
      // D3 Cumulative Cost Trend Line & Area Chart
      const margin = { top: 35, right: 30, bottom: 45, left: 80 };
      const height = 280;
      const width = containerWidth;

      svg.attr('width', width).attr('height', height);

      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      if (timeTrendData.length === 0) {
        g.append('text')
          .attr('x', chartWidth / 2)
          .attr('y', chartHeight / 2)
          .attr('text-anchor', 'middle')
          .attr('fill', '#64748b')
          .text('暫無歷史保養費用紀錄');
        return;
      }

      // X Scale (Dates / Index)
      const xScale = d3.scalePoint()
        .domain(timeTrendData.map(d => d.date))
        .range([0, chartWidth])
        .padding(0.2);

      // Y Scale (Cumulative Cost)
      const maxCum = d3.max(timeTrendData, d => d.cumulativeCost) || 10000;
      const yScale = d3.scaleLinear()
        .domain([0, maxCum * 1.15])
        .nice()
        .range([chartHeight, 0]);

      // Y-Axis
      g.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${(Number(d) / 1000).toFixed(0)}k`))
        .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
        .call(g => g.selectAll('.tick line').attr('stroke', '#e2e8f0').attr('stroke-dasharray', '2,2'))
        .call(g => g.selectAll('.tick text').attr('fill', '#475569').attr('font-size', '10px').attr('font-family', 'monospace').attr('font-weight', '600'));

      // X-Axis
      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale))
        .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
        .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
        .call(g => g.selectAll('.tick text')
          .attr('fill', '#1e293b')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace')
          .attr('font-weight', 'bold'));

      // Area Generator for Cumulative Gradient Fill
      const area = d3.area<typeof timeTrendData[0]>()
        .x(d => xScale(d.date) || 0)
        .y0(chartHeight)
        .y1(d => yScale(d.cumulativeCost))
        .curve(d3.curveMonotoneX);

      // Line Generator
      const line = d3.line<typeof timeTrendData[0]>()
        .x(d => xScale(d.date) || 0)
        .y(d => yScale(d.cumulativeCost))
        .curve(d3.curveMonotoneX);

      // Gradient Definition
      const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'area-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#3b82f6')
        .attr('stop-opacity', 0.25);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#3b82f6')
        .attr('stop-opacity', 0.0);

      // Append Area
      g.append('path')
        .datum(timeTrendData)
        .attr('fill', 'url(#area-gradient)')
        .attr('d', area);

      // Append Line
      g.append('path')
        .datum(timeTrendData)
        .attr('fill', 'none')
        .attr('stroke', '#2563eb')
        .attr('stroke-width', 3)
        .attr('d', line);

      // Render Dots for each log event
      timeTrendData.forEach(item => {
        const cx = xScale(item.date) || 0;
        const cy = yScale(item.cumulativeCost);

        const dotGroup = g.append('g')
          .style('cursor', 'pointer')
          .on('mouseenter', (event) => {
            setHoveredData(item);
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              setTooltipPos({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
              });
            }
          })
          .on('mousemove', (event) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              setTooltipPos({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
              });
            }
          })
          .on('mouseleave', () => {
            setHoveredData(null);
            setTooltipPos(null);
          });

        dotGroup.append('circle')
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', 6)
          .attr('fill', item.type === '定期保養' ? '#10b981' : '#f59e0b')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2);

        // Label above dot
        dotGroup.append('text')
          .attr('x', cx)
          .attr('y', cy - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', '#1d4ed8')
          .attr('font-size', '10px')
          .attr('font-weight', 'bold')
          .attr('font-family', 'monospace')
          .text(`+$${item.cost.toLocaleString()}`);
      });
    }

  }, [categoryStats, timeTrendData, viewMode, containerWidth]);

  return (
    <div className="bg-amber-50/30 border border-amber-200/70 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Top Header Card & View Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-amber-200/60 pb-4">
        <div>
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4 text-amber-700" />
            <span>D3.js 視覺化累計保養成本與類別分析引擎</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>模具保養費用與修繕成本統計</span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              D3 Analytics
            </span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            交叉比對各類別模具預防性保養 (PM) 與異常修繕 (RM) 之累計花費與時間趨勢
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 text-xs shrink-0 self-start md:self-auto shadow-xs">
          <button
            onClick={() => setViewMode('category_breakdown')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              viewMode === 'category_breakdown'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>類別花費結構</span>
          </button>

          <button
            onClick={() => setViewMode('time_trend')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              viewMode === 'time_trend'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>時間累積趨勢</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-extrabold text-slate-900">NT$ {grandTotalCost.toLocaleString()}</div>
            <div className="text-[11px] text-slate-600 font-semibold">總累積保養維修花費</div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-extrabold text-emerald-700">
              NT$ {grandTotalPmCost.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-600 font-semibold">
              定期保養 (PM) 花費佔比 {grandTotalCost > 0 ? ((grandTotalPmCost / grandTotalCost) * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center gap-3 shadow-xs">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-extrabold text-amber-700">
              {topCategory ? topCategory.category : '無'}
            </div>
            <div className="text-[11px] text-slate-600 font-semibold">
              花費最高類別 (NT$ {topCategory ? topCategory.totalCost.toLocaleString() : 0})
            </div>
          </div>
        </div>
      </div>

      {/* Main D3 Canvas Container */}
      <div ref={containerRef} className="relative bg-white rounded-2xl p-4 border border-slate-200 shadow-xs overflow-x-auto min-h-[280px]">
        <svg ref={svgRef} className="w-full h-auto font-sans" />

        {/* Hover Tooltip Overlay */}
        {hoveredData && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none bg-white border border-slate-200 text-slate-900 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 w-60"
            style={{
              left: Math.min(tooltipPos.x + 15, containerWidth - 250),
              top: tooltipPos.y - 10
            }}
          >
            {'category' in hoveredData && 'pmCost' in hoveredData ? (
              // Category Breakdown Tooltip
              <>
                <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                  <span className="font-bold text-blue-700">{hoveredData.category}</span>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold">{hoveredData.count} 筆維護紀錄</span>
                </div>
                <div className="text-slate-700 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>定期保養 (PM):</span>
                    <b className="text-emerald-700 font-mono">NT$ {hoveredData.pmCost.toLocaleString()}</b>
                  </div>
                  <div className="flex justify-between">
                    <span>異常修繕 (RM):</span>
                    <b className="text-amber-700 font-mono">NT$ {hoveredData.rmCost.toLocaleString()}</b>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-100 font-bold">
                    <span>總累計費用:</span>
                    <b className="text-slate-900 font-mono">NT$ {hoveredData.totalCost.toLocaleString()}</b>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>平均單次保養成本:</span>
                    <span className="font-mono text-slate-700 font-semibold">NT$ {hoveredData.avgCost.toLocaleString()}</span>
                  </div>
                </div>
              </>
            ) : (
              // Time Trend Point Tooltip
              <>
                <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                  <span className="font-mono font-bold text-blue-700">{hoveredData.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    hoveredData.type === '定期保養' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {hoveredData.type}
                  </span>
                </div>
                <div className="font-bold text-slate-900 truncate">{hoveredData.toolingName}</div>
                <div className="text-slate-700 space-y-0.5 text-[11px] font-mono">
                  <div>保養日期: <span className="text-slate-900 font-medium">{hoveredData.date}</span></div>
                  <div>當次保養費用: <span className="text-amber-700 font-bold">NT$ {hoveredData.cost.toLocaleString()}</span></div>
                  <div>時間截止總累計: <span className="text-blue-700 font-bold">NT$ {hoveredData.cumulativeCost.toLocaleString()}</span></div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
