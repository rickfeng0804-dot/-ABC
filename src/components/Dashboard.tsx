import React from 'react';
import { 
  Wrench, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  QrCode, 
  FileCode2, 
  Table, 
  Sparkles,
  BarChart2,
  Activity,
  Layers,
  Radio,
  XCircle,
  ArrowRight,
  Box,
  Check
} from 'lucide-react';
import { ToolingItem, ToolingCategory, TransactionRecord, MaintenanceRecord } from '../types';
import { SafetyStockChart } from './SafetyStockChart';
import { DailyStrokesTrendChart } from './DailyStrokesTrendChart';

interface DashboardProps {
  toolings: ToolingItem[];
  transactions: TransactionRecord[];
  maintenanceLogs?: MaintenanceRecord[];
  onSelectTooling: (tooling: ToolingItem) => void;
  openOperationWizard: (type: '領用' | '歸還' | '保養發起' | '報廢', item?: ToolingItem) => void;
  openBarcodeScanner: () => void;
  setActiveTab: (tab: any) => void;
  onFilterStatusNavigate?: (status: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  toolings,
  transactions,
  maintenanceLogs = [],
  onSelectTooling,
  openOperationWizard,
  openBarcodeScanner,
  setActiveTab,
  onFilterStatusNavigate
}) => {
  // KPI Metrics
  const totalCount = toolings.length;
  const inUseCount = toolings.filter(t => t.status === '使用中').length;
  const maintenanceCount = toolings.filter(t => t.status === '保養中' || t.status === '待修繕').length;
  const scrappedCount = toolings.filter(t => t.status === '報廢').length;
  const inStockCount = toolings.filter(t => t.status === '在庫').length;

  // Availability percentage
  const availabilityRate = totalCount > 0 ? (((inStockCount + inUseCount) / totalCount) * 100).toFixed(0) : '100';

  // Alerts
  const alertToolings = toolings.filter(t => {
    if (t.status === '報廢') return false;
    const usageRatio = t.currentStrokes / t.maxStrokes;
    const isMntDue = t.currentStrokes >= (t.lastMaintenanceStrokes + t.maintenanceInterval);
    return usageRatio >= 0.80 || isMntDue;
  });

  const criticalToolings = alertToolings.filter(t => (t.currentStrokes / t.maxStrokes) >= 0.95);

  // Categories
  const categories: ToolingCategory[] = ['繞線模具', '成型模具', '點膠治具', '測試治具'];

  return (
    <div className="space-y-6">
      {/* Top Welcome Header - Light Hero Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-slate-900 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>千如電子集團楊梅二廠模治具管理系統 Demo版</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            現場模治具狀態與自動化壽命預警
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            即時記錄繞線模具、成型壓鑄模、點膠石英夾具與高頻 LCR 測試治具之迴數壽命。整合 Google Sheets 資料庫與 GAS 郵件告警腳本。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={openBarcodeScanner}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>條碼掃描領退</span>
          </button>
          <button
            onClick={() => openOperationWizard('領用')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition border border-slate-300"
          >
            <span>快速領用</span>
          </button>
          <button
            onClick={() => openOperationWizard('歸還')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition border border-slate-300"
          >
            <span>歸還結算</span>
          </button>
        </div>
      </div>

      {/* 即時狀態看板 (Real-Time Status Board) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3.5">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wider mb-0.5">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>Real-Time Fleet Status Monitor</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>即時狀態看板</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                Live Status
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              全廠模具即時狀態計數，點擊任一卡片可直接跳轉至全廠清單並自動執行狀態篩選
            </p>
          </div>

          <button
            onClick={() => onFilterStatusNavigate ? onFilterStatusNavigate('ALL') : setActiveTab('toolings')}
            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition"
          >
            <span>檢視全部 {totalCount} 組模具</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 在庫 (In Stock) */}
          <div
            onClick={() => onFilterStatusNavigate ? onFilterStatusNavigate('在庫') : setActiveTab('toolings')}
            className="group bg-emerald-50/40 p-4 rounded-xl border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/80 transition cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 group-hover:scale-110 transition">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                在庫 (In Stock)
              </span>
            </div>

            <div>
              <div className="text-3xl font-mono font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
                {inStockCount} <span className="text-xs font-normal text-slate-500">組</span>
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">在庫備用</div>
              <p className="text-[11px] text-slate-600 mt-0.5">健康備品隨時可領用上機</p>
            </div>

            <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px] text-emerald-700 font-bold group-hover:translate-x-0.5 transition">
              <span>跳轉篩選在庫模具</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 使用中 (In Use) */}
          <div
            onClick={() => onFilterStatusNavigate ? onFilterStatusNavigate('使用中') : setActiveTab('toolings')}
            className="group bg-blue-50/40 p-4 rounded-xl border border-blue-200 hover:border-blue-400 hover:bg-blue-50/80 transition cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700 border border-blue-200 group-hover:scale-110 transition">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-300">
                使用中 (In Use)
              </span>
            </div>

            <div>
              <div className="text-3xl font-mono font-extrabold text-slate-900 group-hover:text-blue-700 transition">
                {inUseCount} <span className="text-xs font-normal text-slate-500">組</span>
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">線上投產中</div>
              <p className="text-[11px] text-slate-600 mt-0.5">產線機台掛載連續沖壓中</p>
            </div>

            <div className="pt-2 border-t border-blue-200/80 flex items-center justify-between text-[11px] text-blue-700 font-bold group-hover:translate-x-0.5 transition">
              <span>跳轉篩選使用中模具</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 維護中 (In Maintenance / Repair) */}
          <div
            onClick={() => onFilterStatusNavigate ? onFilterStatusNavigate('維護中') : setActiveTab('toolings')}
            className="group bg-amber-50/40 p-4 rounded-xl border border-amber-200 hover:border-amber-400 hover:bg-amber-50/80 transition cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 group-hover:scale-110 transition">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                維護中 (Maintenance)
              </span>
            </div>

            <div>
              <div className="text-3xl font-mono font-extrabold text-slate-900 group-hover:text-amber-700 transition">
                {maintenanceCount} <span className="text-xs font-normal text-slate-500">組</span>
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">保養與修繕中</div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                保養中: {toolings.filter(t=>t.status==='保養中').length} / 待修: {toolings.filter(t=>t.status==='待修繕').length}
              </p>
            </div>

            <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-[11px] text-amber-700 font-bold group-hover:translate-x-0.5 transition">
              <span>跳轉篩選維護中模具</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* 報廢 (Scrapped) */}
          <div
            onClick={() => onFilterStatusNavigate ? onFilterStatusNavigate('報廢') : setActiveTab('toolings')}
            className="group bg-rose-50/40 p-4 rounded-xl border border-rose-200 hover:border-rose-400 hover:bg-rose-50/80 transition cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden shadow-xs"
          >
            <div className="flex items-start justify-between">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 group-hover:scale-110 transition">
                <XCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                報廢 (Scrapped)
              </span>
            </div>

            <div>
              <div className="text-3xl font-mono font-extrabold text-slate-900 group-hover:text-rose-700 transition">
                {scrappedCount} <span className="text-xs font-normal text-slate-500">組</span>
              </div>
              <div className="text-xs font-bold text-slate-900 mt-1">退役報廢</div>
              <p className="text-[11px] text-slate-600 mt-0.5">達沖次上限或毀損封存</p>
            </div>

            <div className="pt-2 border-t border-rose-200/80 flex items-center justify-between text-[11px] text-rose-700 font-bold group-hover:translate-x-0.5 transition">
              <span>跳轉篩選報廢模具</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Fleet Health Bento Metrics Card (Col-Span 4) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600">Fleet Health Summary</h2>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center">
                <p className="text-3xl font-mono font-extrabold text-slate-900">{totalCount}</p>
                <p className="text-[10px] uppercase font-bold text-slate-500 mt-1">Total Tools</p>
              </div>

              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200 text-center">
                <p className="text-3xl font-mono font-extrabold text-emerald-700">{availabilityRate}%</p>
                <p className="text-[10px] uppercase font-bold text-emerald-800 mt-1">Availability</p>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 text-center">
                <p className="text-3xl font-mono font-extrabold text-amber-700">{alertToolings.length}</p>
                <p className="text-[10px] uppercase font-bold text-amber-800 mt-1">Maint. Soon</p>
              </div>

              <div className="bg-rose-50/60 p-3.5 rounded-xl border border-rose-200 text-center">
                <p className="text-3xl font-mono font-extrabold text-rose-700">{scrappedCount}</p>
                <p className="text-[10px] uppercase font-bold text-rose-800 mt-1">Scrapped</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-600 text-[11px]">
              <span>線上投產中: <b className="text-emerald-700 font-mono">{inUseCount}</b></span>
              <span>在庫備用: <b className="text-blue-700 font-mono">{inStockCount}</b></span>
              <span>維修/待修: <b className="text-amber-700 font-mono">{maintenanceCount}</b></span>
            </div>
          </div>
        </div>

        {/* Middle Column: Critical Maintenance Alerts Bento Card (Col-Span 8) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Critical Alerts & Maintenance Triggers ({alertToolings.length})</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-500 font-semibold">THRESHOLD: 80% / 95%</span>
          </div>

          {alertToolings.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <span>目前全廠模治具狀態健康，尚無達 80% 預警門檻之項目</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {alertToolings.slice(0, 4).map((tool) => {
                const usageRatio = (tool.currentStrokes / tool.maxStrokes) * 100;
                const isCritical = usageRatio >= 95;

                return (
                  <div
                    key={tool.id}
                    onClick={() => onSelectTooling(tool)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                      isCritical
                        ? 'bg-rose-50/60 border-rose-200 hover:border-rose-400'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono font-bold text-blue-700">{tool.id}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          isCritical
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {usageRatio.toFixed(1)}% LIFE
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{tool.name}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">類別: {tool.category} | 架位: {tool.location}</p>
                    </div>

                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>USAGE</span>
                        <span className="font-semibold text-slate-700">{tool.currentStrokes.toLocaleString()} / {tool.maxStrokes.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isCritical ? 'bg-rose-600' : 'bg-amber-500'}`}
                          style={{ width: `${Math.min(usageRatio, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 text-[11px]">點擊任一警示項目可跳轉至模具詳細規格頁</span>
            <button
              onClick={() => setActiveTab('toolings')}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 text-xs"
            >
              檢視完整 Master 清單 <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recharts 近 7 日維護沖次趨勢折線圖 */}
      <DailyStrokesTrendChart
        transactions={transactions}
        toolings={toolings}
        maintenanceLogs={maintenanceLogs}
      />

      {/* D3 Safety Stock & Maintenance Buffer Chart */}
      <SafetyStockChart
        toolings={toolings}
        onSelectTooling={onSelectTooling}
        openOperationWizard={openOperationWizard}
      />

      {/* Category Breakdown Bento Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <span>Inductor Tooling Categories Overview</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const catItems = toolings.filter(t => t.category === cat);
            const catInUse = catItems.filter(t => t.status === '使用中').length;
            const catAlerts = catItems.filter(t => (t.currentStrokes / t.maxStrokes) >= 0.8).length;

            return (
              <div key={cat} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition shadow-xs">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      {cat}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                      {catItems.length} SETS
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-500">In Use:</span> <b className="text-emerald-700 font-mono">{catInUse}</b>
                    </div>
                    <div>
                      <span className="text-slate-500">Warning:</span> <b className={catAlerts > 0 ? 'text-amber-700 font-mono' : 'text-slate-600 font-mono'}>{catAlerts}</b>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Transaction Stream & Architecture Integration Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left 8 Cols: Live Activity Log Stream */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Live Transaction Stream</span>
            </h2>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              檢視完整流水紀錄 →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {transactions.slice(0, 4).map((txn) => (
              <div key={txn.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  txn.type === '領用' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                  txn.type === '歸還' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                  txn.type === '保養發起' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  <span className="text-xs font-bold">{txn.type.slice(0, 2)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{txn.toolingId}</p>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0 font-medium">{txn.timestamp.slice(11, 16)}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">{txn.toolingName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{txn.operator} | {txn.machineOrLine || '無機台'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 4 Cols: GAS & System Architecture Box */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
              <FileCode2 className="w-4 h-4" />
              <span>Google Sheet & GAS Engine</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">後端資料庫與腳本中心</h3>
            <p className="text-slate-600 text-xs mt-1 leading-relaxed">
              對應 Tooling_Master, Transaction_Log, Maintenance_Log 與 Supplier_Info 4 大試算表，內建 Email 告警腳本與 REST API。
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('schema')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition"
            >
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-blue-600" />
                <span>Google Sheet Schema 規格</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('gas_code')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition"
            >
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-emerald-600" />
                <span>複製 GAS Code.gs 腳本</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setActiveTab('sop_guide')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>現場平板條碼 & AppSheet 指南</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
