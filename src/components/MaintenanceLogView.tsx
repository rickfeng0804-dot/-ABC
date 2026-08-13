import React, { useState } from 'react';
import { Wrench, Search, Download, DollarSign, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { MaintenanceRecord, ToolingItem } from '../types';
import { downloadCSV } from '../utils/csvExport';
import { MaintenanceCostChart } from './MaintenanceCostChart';

interface MaintenanceLogViewProps {
  maintenanceLogs: MaintenanceRecord[];
  toolings?: ToolingItem[];
  openOperationWizard?: (type: '領用' | '歸還' | '保養發起' | '報廢', item?: ToolingItem) => void;
}

export const MaintenanceLogView: React.FC<MaintenanceLogViewProps> = ({ 
  maintenanceLogs,
  toolings = [],
  openOperationWizard 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = maintenanceLogs.filter(
    (log) =>
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.toolingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.toolingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionTaken.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCost = maintenanceLogs.reduce((acc, curr) => acc + (curr.cost || 0), 0);
  const pmCount = maintenanceLogs.filter(l => l.type === '定期保養').length;
  const rmCount = maintenanceLogs.filter(l => l.type === '異常修繕').length;

  const exportToCsv = () => {
    const headers = [
      '維護單號',
      '保養日期',
      '模治具編號',
      '模治具名稱',
      '維護類型',
      '處理人員/廠商',
      '觸發原因',
      '處置內容',
      '更換耗件明細',
      '費用(TWD)',
      '保養時沖數',
      '下次預警目標沖數',
      '驗收狀態'
    ];

    const rows = filteredLogs.map(l => [
      l.id,
      l.maintenanceDate,
      l.toolingId,
      l.toolingName,
      l.type,
      l.performedBy,
      l.triggerReason,
      l.actionTaken,
      l.replacedParts || '無',
      l.cost,
      l.strokesAtMaintenance,
      l.nextMaintenanceTarget,
      l.resultStatus
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`Maintenance_Log_${dateStr}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Bento Card */}
      <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-400" />
            <span>保養維護記錄 (Maintenance_Log)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            記載繞線研磨、壓鑄模鍍鈦退鍍、測試金針更換與預防性保養 (PM) / 異常修繕 (RM) 成本
          </p>
        </div>

        <div className="flex items-center gap-3">
          {openOperationWizard && (
            <button
              onClick={() => openOperationWizard('保養發起')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition shadow-md shadow-blue-900/20"
            >
              <Wrench className="w-4 h-4" />
              <span>發起 PM 保養</span>
            </button>
          )}

          <button
            onClick={exportToCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800 font-semibold text-xs hover:bg-slate-800 transition shadow-sm"
            title="匯出當前篩選之保養維護歷程為 CSV 檔案"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>匯出維護歷程 CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">總累積保養花費</div>
          <div className="text-2xl font-bold text-white mt-1 font-mono">
            NT$ {totalCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">包含原廠精磨與備件費用</div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">定期保養 (PM) 執行</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{pmCount} <span className="text-xs font-normal text-slate-400">次</span></div>
          <div className="text-[11px] text-emerald-400 mt-0.5 font-medium">預防性保養執行率 100%</div>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">異常修繕 (RM) 記錄</div>
          <div className="text-2xl font-bold text-orange-400 mt-1 font-mono">{rmCount} <span className="text-xs font-normal text-slate-400">次</span></div>
          <div className="text-[11px] text-slate-400 mt-0.5">包含跳線刮痕與測試針阻抗異常</div>
        </div>
      </div>

      {/* D3 Maintenance Cost Analytics Chart */}
      <MaintenanceCostChart 
        maintenanceLogs={maintenanceLogs}
        toolings={toolings}
      />

      {/* Search Input Bento Box */}
      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-lg">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜尋維護單號、模具名稱、技師/廠商或處置內容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Log Cards List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 text-center text-slate-500 text-xs">
            查無符合之保養維護紀錄
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 shadow-lg hover:border-slate-700 transition space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-950 px-2.5 py-1 rounded text-blue-400 border border-slate-800">
                    {log.id}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                    log.type === '定期保養' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">📅 {log.maintenanceDate}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">處理人員/廠商: <b className="text-white">{log.performedBy}</b></span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    NT$ {log.cost.toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <div className="font-bold text-white text-sm">
                  {log.toolingId} - {log.toolingName}
                </div>
                <div className="text-xs text-amber-400 font-medium mt-1">
                  觸發原因：{log.triggerReason}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
                <div>
                  <div className="font-semibold text-slate-300">保養/處置內容：</div>
                  <div className="text-slate-400 mt-0.5">{log.actionTaken}</div>
                </div>

                <div>
                  <div className="font-semibold text-slate-300">更換零件明細：</div>
                  <div className="text-slate-400 mt-0.5">{log.replacedParts || '無更換主要耗材'}</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 font-mono">
                <div>
                  保養時沖數：<b className="text-white">{log.strokesAtMaintenance.toLocaleString()}</b> 次 | 
                  下次預警目標：<b className="text-blue-400">{log.nextMaintenanceTarget.toLocaleString()}</b> 次
                </div>

                <div className="flex items-center gap-1 font-semibold text-emerald-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>驗收狀態：{log.resultStatus}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
