import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Layers, 
  TrendingDown, 
  Info, 
  BarChart3, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ToolingItem, ToolingCategory } from '../types';

interface SafetyStockChartProps {
  toolings: ToolingItem[];
  onSelectTooling?: (tooling: ToolingItem) => void;
  openOperationWizard?: (type: '領用' | '歸還' | '保養發起' | '報廢', item?: ToolingItem) => void;
}

type ViewMode = 'urgency_list' | 'category_stock';

export const SafetyStockChart: React.FC<SafetyStockChartProps> = ({
  toolings,
  onSelectTooling,
  openOperationWizard
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('urgency_list');
  const [selectedCategory, setSelectedCategory] = useState<string>('全類別');
  const [hoveredTool, setHoveredTool] = useState<ToolingItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // ResizeObserver for dynamic D3 responsiveness
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(Math.max(320, containerRef.current.clientWidth));
      }
    };

    updateWidth();
    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute calculated metrics for toolings
  const enrichedToolings = toolings.map(t => {
    const remainingLifeStrokes = Math.max(0, t.maxStrokes - t.currentStrokes);
    const lifeRatio = t.currentStrokes / t.maxStrokes; // 0 to 1
    const remainingLifePct = Math.max(0, (1 - lifeRatio) * 100);

    const strokesSinceLastMnt = Math.max(0, t.currentStrokes - t.lastMaintenanceStrokes);
    const remainingPmStrokes = t.maintenanceInterval - strokesSinceLastMnt;
    const remainingPmPct = (remainingPmStrokes / t.maintenanceInterval) * 100;

    let urgencyLevel: 'CRITICAL' | 'WARNING' | 'HEALTHY' = 'HEALTHY';
    if (lifeRatio >= 0.95 || remainingPmStrokes <= 0 || t.status === '待修繕') {
      urgencyLevel = 'CRITICAL';
    } else if (lifeRatio >= 0.80 || remainingPmStrokes <= (t.maintenanceInterval * 0.15)) {
      urgencyLevel = 'WARNING';
    }

    return {
      ...t,
      remainingLifeStrokes,
      lifeRatio,
      remainingLifePct,
      strokesSinceLastMnt,
      remainingPmStrokes,
      remainingPmPct,
      urgencyLevel
    };
  });

  // Filtered dataset
  const filteredToolings = enrichedToolings.filter(t => {
    if (t.status === '報廢') return false;
    if (selectedCategory === '全類別') return true;
    return t.category === selectedCategory;
  }).sort((a, b) => {
    // Sort by urgency: CRITICAL first, then lowest remainingLifePct or lowest remainingPmStrokes
    const urgencyScore = (item: typeof enrichedToolings[0]) => {
      let score = 0;
      if (item.urgencyLevel === 'CRITICAL') score += 1000;
      if (item.urgencyLevel === 'WARNING') score += 500;
      score += (100 - item.remainingLifePct);
      return score;
    };
    return urgencyScore(b) - urgencyScore(a);
  });

  // Category level safety stock aggregation
  const categories: ToolingCategory[] = ['繞線模具', '成型模具', '點膠治具', '測試治具'];
  const categorySafetyStock = categories.map(cat => {
    const catItems = enrichedToolings.filter(t => t.category === cat && t.status !== '報廢');
    const total = catItems.length;
    const healthyInStock = catItems.filter(t => t.status === '在庫' && t.urgencyLevel === 'HEALTHY').length;
    const healthyInUse = catItems.filter(t => t.status === '使用中' && t.urgencyLevel === 'HEALTHY').length;
    const totalHealthyAvailable = healthyInStock + healthyInUse;
    const warningOrCritical = catItems.filter(t => t.urgencyLevel !== 'HEALTHY').length;
    const inMaintenance = catItems.filter(t => t.status === '保養中' || t.status === '待修繕').length;

    // Safety Stock Buffer Target (e.g., minimum 2 healthy sets required per category)
    const safetyBufferTarget = Math.max(2, Math.ceil(total * 0.5));
    const isDeficit = totalHealthyAvailable < safetyBufferTarget;
    const isWarning = totalHealthyAvailable === safetyBufferTarget;

    return {
      category: cat,
      total,
      healthyInStock,
      healthyInUse,
      totalHealthyAvailable,
      warningOrCritical,
      inMaintenance,
      safetyBufferTarget,
      stockStatus: isDeficit ? '安全庫存不足' : isWarning ? '安全庫存水位偏低' : '安全庫存充足'
    };
  });

  // Critical counts
  const criticalCount = enrichedToolings.filter(t => t.urgencyLevel === 'CRITICAL').length;
  const warningCount = enrichedToolings.filter(t => t.urgencyLevel === 'WARNING').length;
  const deficitCategoryCount = categorySafetyStock.filter(c => c.stockStatus !== '安全庫存充足').length;

  // Render D3 Chart inside SVG
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawing

    if (viewMode === 'urgency_list') {
      // RENDER D3 BULLET & LIFESPAN BUFFER CHART
      const margin = { top: 20, right: 30, bottom: 30, left: 140 };
      const barHeight = 36;
      const height = Math.max(260, filteredToolings.length * (barHeight + 12) + margin.top + margin.bottom);
      const width = containerWidth;

      svg.attr('width', width).attr('height', height);

      const chartWidth = width - margin.left - margin.right;

      // X Scale: 0% to 100% used capacity
      const xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, chartWidth]);

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Draw Gridlines
      const ticks = [0, 25, 50, 75, 80, 95, 100];
      g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(
          d3.axisBottom(xScale)
            .tickValues(ticks)
            .tickFormat(d => `${d}%`)
            .tickSize(-(height - margin.top - margin.bottom))
        )
        .call(g => g.select('.domain').remove())
        .call(g => g.selectAll('.tick line')
          .attr('stroke', '#334155')
          .attr('stroke-dasharray', '2,2'))
        .call(g => g.selectAll('.tick text')
          .attr('fill', '#94a3b8')
          .attr('font-size', '10px')
          .attr('font-family', 'monospace'));

      // Warning Zone Shading (80% to 95%)
      g.append('rect')
        .attr('x', xScale(80))
        .attr('y', 0)
        .attr('width', xScale(95) - xScale(80))
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', '#f59e0b')
        .attr('opacity', 0.08);

      // Critical Zone Shading (95% to 100%)
      g.append('rect')
        .attr('x', xScale(95))
        .attr('y', 0)
        .attr('width', xScale(100) - xScale(95))
        .attr('height', height - margin.top - margin.bottom)
        .attr('fill', '#ef4444')
        .attr('opacity', 0.12);

      // Render Each Tooling Row
      filteredToolings.forEach((tool, i) => {
        const y = i * (barHeight + 12);

        const rowG = g.append('g')
          .attr('class', 'tool-row')
          .style('cursor', 'pointer')
          .on('click', () => {
            if (onSelectTooling) onSelectTooling(tool);
          })
          .on('mouseenter', (event) => {
            setHoveredTool(tool);
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
            setHoveredTool(null);
            setTooltipPos(null);
          });

        // Y-Axis Label (Tool ID & Name)
        const textG = rowG.append('g').attr('transform', `translate(-12, ${y + 16})`);
        
        textG.append('text')
          .attr('text-anchor', 'end')
          .attr('fill', '#2563eb')
          .attr('font-weight', 'bold')
          .attr('font-size', '11px')
          .attr('font-family', 'monospace')
          .text(tool.id);

        textG.append('text')
          .attr('y', 14)
          .attr('text-anchor', 'end')
          .attr('fill', '#64748b')
          .attr('font-size', '10px')
          .text(tool.name.length > 10 ? tool.name.slice(0, 10) + '...' : tool.name);

        // Background Bar Track (Total Max Life Capacity = 100%)
        rowG.append('rect')
          .attr('x', 0)
          .attr('y', y)
          .attr('width', chartWidth)
          .attr('height', barHeight - 8)
          .attr('rx', 6)
          .attr('fill', '#f1f5f9')
          .attr('stroke', '#e2e8f0');

        // Current Usage Bar Length
        const usedPct = Math.min(100, tool.lifeRatio * 100);
        const barColor = tool.urgencyLevel === 'CRITICAL' ? '#ef4444' :
                         tool.urgencyLevel === 'WARNING' ? '#f59e0b' : '#10b981';

        rowG.append('rect')
          .attr('x', 0)
          .attr('y', y)
          .attr('width', 0) // Animate from 0
          .attr('height', barHeight - 8)
          .attr('rx', 6)
          .attr('fill', barColor)
          .attr('opacity', 0.9)
          .transition()
          .duration(600)
          .attr('width', Math.max(4, xScale(usedPct)));

        // Maintenance PM Cycle Trigger Marker Line (If PM due before max life)
        const pmDueStrokes = tool.lastMaintenanceStrokes + tool.maintenanceInterval;
        const pmDueRatio = Math.min(100, (pmDueStrokes / tool.maxStrokes) * 100);

        if (pmDueRatio <= 100) {
          rowG.append('line')
            .attr('x1', xScale(pmDueRatio))
            .attr('x2', xScale(pmDueRatio))
            .attr('y1', y - 2)
            .attr('y2', y + barHeight - 6)
            .attr('stroke', '#0284c7')
            .attr('stroke-width', 2.5)
            .attr('stroke-dasharray', '3,2');

          rowG.append('text')
            .attr('x', xScale(pmDueRatio))
            .attr('y', y - 4)
            .attr('text-anchor', 'middle')
            .attr('fill', '#0284c7')
            .attr('font-size', '9px')
            .attr('font-weight', 'bold')
            .text('PM');
        }

        // Percentage Text on Bar Right Side
        rowG.append('text')
          .attr('x', chartWidth + 6)
          .attr('y', y + 18)
          .attr('fill', barColor)
          .attr('font-weight', 'bold')
          .attr('font-size', '11px')
          .attr('font-family', 'monospace')
          .text(`${usedPct.toFixed(1)}%`);
      });

    } else {
      // RENDER D3 CATEGORY SAFETY STOCK GROUPED BAR CHART
      const margin = { top: 30, right: 30, bottom: 40, left: 100 };
      const height = 280;
      const width = containerWidth;

      svg.attr('width', width).attr('height', height);

      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // X Scale (Categories)
      const x0Scale = d3.scaleBand()
        .domain(categorySafetyStock.map(c => c.category))
        .range([0, chartWidth])
        .padding(0.25);

      // Sub-bars: [Healthy Available, Warning/Critical, Target Safety Line]
      const maxVal = d3.max(categorySafetyStock, c => Math.max(c.total, c.safetyBufferTarget + 1)) || 5;

      const yScale = d3.scaleLinear()
        .domain([0, maxVal])
        .nice()
        .range([chartHeight, 0]);

      // Y-Axis
      g.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format('d')))
        .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
        .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
        .call(g => g.selectAll('.tick text').attr('fill', '#64748b').attr('font-size', '10px'));

      // X-Axis
      g.append('g')
        .attr('transform', `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x0Scale))
        .call(g => g.select('.domain').attr('stroke', '#cbd5e1'))
        .call(g => g.selectAll('.tick line').attr('stroke', '#cbd5e1'))
        .call(g => g.selectAll('.tick text').attr('fill', '#1e293b').attr('font-size', '11px').attr('font-weight', 'bold'));

      const subBarWidth = x0Scale.bandwidth() / 2 - 4;

      categorySafetyStock.forEach((catData) => {
        const catX = x0Scale(catData.category) || 0;

        // Bar 1: Total Healthy Available (Green)
        g.append('rect')
          .attr('x', catX)
          .attr('y', yScale(0))
          .attr('width', subBarWidth)
          .attr('height', 0)
          .attr('rx', 4)
          .attr('fill', '#10b981')
          .transition()
          .duration(600)
          .attr('y', yScale(catData.totalHealthyAvailable))
          .attr('height', chartHeight - yScale(catData.totalHealthyAvailable));

        // Value text
        g.append('text')
          .attr('x', catX + subBarWidth / 2)
          .attr('y', yScale(catData.totalHealthyAvailable) - 6)
          .attr('text-anchor', 'middle')
          .attr('fill', '#059669')
          .attr('font-weight', 'bold')
          .attr('font-size', '11px')
          .text(catData.totalHealthyAvailable);

        // Bar 2: Risk / Maintenance Tools (Orange/Red)
        g.append('rect')
          .attr('x', catX + subBarWidth + 4)
          .attr('y', yScale(0))
          .attr('width', subBarWidth)
          .attr('height', 0)
          .attr('rx', 4)
          .attr('fill', catData.warningOrCritical > 0 ? '#f59e0b' : '#cbd5e1')
          .transition()
          .duration(600)
          .attr('y', yScale(catData.warningOrCritical))
          .attr('height', chartHeight - yScale(catData.warningOrCritical));

        // Value text
        g.append('text')
          .attr('x', catX + subBarWidth + 4 + subBarWidth / 2)
          .attr('y', yScale(catData.warningOrCritical) - 6)
          .attr('text-anchor', 'middle')
          .attr('fill', catData.warningOrCritical > 0 ? '#d97706' : '#94a3b8')
          .attr('font-weight', 'bold')
          .attr('font-size', '11px')
          .text(catData.warningOrCritical);

        // Safety Stock Target Threshold Line Across the Category Band
        const targetY = yScale(catData.safetyBufferTarget);
        g.append('line')
          .attr('x1', catX - 4)
          .attr('x2', catX + x0Scale.bandwidth() + 4)
          .attr('y1', targetY)
          .attr('y2', targetY)
          .attr('stroke', '#ef4444')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4,3');
      });

      // Target Safety Stock Line Legend
      const legend = g.append('g').attr('transform', `translate(0, -14)`);
      legend.append('line')
        .attr('x1', chartWidth - 140)
        .attr('x2', chartWidth - 110)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,3');

      legend.append('text')
        .attr('x', chartWidth - 104)
        .attr('y', 4)
        .attr('fill', '#dc2626')
        .attr('font-size', '10px')
        .attr('font-weight', 'bold')
        .text('最低安全庫存門檻');
    }

  }, [filteredToolings, viewMode, containerWidth, categorySafetyStock]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Top Header Card & View Mode Toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4 text-emerald-600" />
            <span>D3.js 視覺化安全庫存與保養 Buffer 倒數監控</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>模治具安全庫存與保養預警評估</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              D3 Engine
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            動態推算每組模具剩餘沖次、定期保養 (PM) 倒數與各類別健康可用備模水位
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('urgency_list')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === 'urgency_list'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>壽命/PM 倒數</span>
            </button>

            <button
              onClick={() => setViewMode('category_stock')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                viewMode === 'category_stock'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>類別庫存水位</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          {viewMode === 'urgency_list' && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-300 text-slate-900 text-xs rounded-xl px-3 py-1.5 outline-none font-bold focus:border-blue-500"
            >
              <option value="全類別">全類別模具</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-red-50/60 p-3.5 rounded-xl border border-red-200 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-100 text-red-600 border border-red-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-red-700">{criticalCount} <span className="text-xs font-normal text-slate-500">組</span></div>
            <div className="text-[11px] text-slate-600 font-medium">達 95% 臨界 / 急需下機保養</div>
          </div>
        </div>

        <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 border border-amber-200">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-mono font-bold text-amber-700">{warningCount} <span className="text-xs font-normal text-slate-500">組</span></div>
            <div className="text-[11px] text-slate-600 font-medium">達 80% 預警 / 需安排提前 PM</div>
          </div>
        </div>

        <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 border border-emerald-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className={`text-xl font-mono font-bold ${deficitCategoryCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {deficitCategoryCount > 0 ? `${deficitCategoryCount} 類告警` : '安全量充足'}
            </div>
            <div className="text-[11px] text-slate-600 font-medium">各類別健康備品安全水位</div>
          </div>
        </div>
      </div>

      {/* Main D3 Canvas Area */}
      <div ref={containerRef} className="relative bg-slate-50 rounded-2xl p-4 border border-slate-200 overflow-x-auto min-h-[280px]">
        <svg ref={svgRef} className="w-full h-auto font-sans" />

        {/* Hover Tooltip overlay for D3 chart */}
        {hoveredTool && tooltipPos && (
          <div
            className="absolute z-20 pointer-events-none bg-white border border-slate-200 text-slate-900 rounded-xl p-3 shadow-xl text-xs space-y-1.5 w-64 backdrop-blur-md"
            style={{
              left: Math.min(tooltipPos.x + 15, containerWidth - 270),
              top: tooltipPos.y - 10
            }}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-1">
              <span className="font-mono font-bold text-blue-600">{hoveredTool.id}</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                hoveredTool.status === '使用中' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {hoveredTool.status}
              </span>
            </div>

            <div className="font-bold text-slate-900 truncate">{hoveredTool.name}</div>
            
            <div className="text-slate-600 space-y-0.5 text-[11px]">
              <div>類別: <span className="text-slate-900 font-medium">{hoveredTool.category}</span></div>
              <div>架位: <span className="text-slate-900 font-medium">{hoveredTool.location}</span></div>
              <div>累積沖次: <span className="font-mono text-emerald-700 font-bold">{hoveredTool.currentStrokes.toLocaleString()}</span> / {hoveredTool.maxStrokes.toLocaleString()}</div>
              <div>剩餘壽命: <span className="font-mono text-blue-700 font-bold">{(hoveredTool.maxStrokes - hoveredTool.currentStrokes).toLocaleString()} 沖次</span></div>
              <div>距下推 PM: <span className="font-mono text-amber-700 font-bold">{Math.max(0, hoveredTool.maintenanceInterval - (hoveredTool.currentStrokes - hoveredTool.lastMaintenanceStrokes)).toLocaleString()} 沖次</span></div>
            </div>

            {openOperationWizard && (
              <div className="pt-1.5 border-t border-slate-100 text-[10px] text-blue-600 font-bold flex items-center justify-between">
                <span>點擊該列發起保養/領退</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Safety Stock Category Cards List (Shown when in Category Stock view) */}
      {viewMode === 'category_stock' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {categorySafetyStock.map(c => (
            <div key={c.category} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs">{c.category}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  c.stockStatus === '安全庫存不足' ? 'bg-red-50 text-red-700 border-red-200' :
                  c.stockStatus === '安全庫存水位偏低' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {c.stockStatus}
                </span>
              </div>

              <div className="text-slate-600 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>健康可用備模:</span>
                  <b className="text-emerald-700 font-mono">{c.totalHealthyAvailable} / {c.total} 組</b>
                </div>
                <div className="flex justify-between">
                  <span>最低安全門檻:</span>
                  <b className="text-slate-900 font-mono">{c.safetyBufferTarget} 組</b>
                </div>
                <div className="flex justify-between">
                  <span>預警或維修中:</span>
                  <b className={c.warningOrCritical > 0 ? 'text-amber-700 font-mono' : 'text-slate-400 font-mono'}>{c.warningOrCritical} 組</b>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
