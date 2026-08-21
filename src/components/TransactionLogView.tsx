import React, { useState } from 'react';
import { History, Search, Download, ArrowLeftRight, Filter } from 'lucide-react';
import { TransactionRecord, TransactionType } from '../types';

interface TransactionLogViewProps {
  transactions: TransactionRecord[];
}

export const TransactionLogView: React.FC<TransactionLogViewProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filteredTxns = transactions.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.toolingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.toolingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.operator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.machineOrLine && txn.machineOrLine.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'ALL' || txn.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const exportToCsv = () => {
    const headers = ['單號', '異動時間', '模治具編號', '模治具名稱', '異動類型', '作業人員', '機台/產線', '新增沖次', '結果沖次', '異動前狀態', '異動後狀態', '備註'];
    const rows = filteredTxns.map(t => [
      t.id,
      t.timestamp,
      t.toolingId,
      `"${t.toolingName.replace(/"/g, '""')}"`,
      t.type,
      t.operator,
      t.machineOrLine || '',
      t.deltaStrokes || 0,
      t.resultingStrokes,
      t.previousStatus,
      t.newStatus,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Transaction_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Bento Card */}
      <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-700" />
            <span>異動記錄檔 (Transaction_Log)</span>
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            完整紀錄領用出庫、歸還結算、保養發起與報廢操作，具備無縫流水號與審計追溯性
          </p>
        </div>

        <button
          onClick={exportToCsv}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition shadow-xs shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>匯出 CSV 檔 (Google Sheet 同步)</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜尋單號、模具編號、作業人員或產線..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 font-medium outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 font-semibold outline-none focus:border-emerald-500"
        >
          <option value="ALL">所有異動類型 (All Transaction Types)</option>
          <option value="領用">領用 (Check-Out)</option>
          <option value="歸還">歸還 (Check-In)</option>
          <option value="保養發起">保養發起 (Maintenance Start)</option>
          <option value="維護完成">維護完成 (Maintenance Done)</option>
          <option value="報廢">報廢 (Scrapped)</option>
        </select>
      </div>

      {/* Log Table Bento Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-emerald-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4">TXN ID / TIME</th>
                <th className="py-3.5 px-3">TOOLING ITEM</th>
                <th className="py-3.5 px-3">TYPE</th>
                <th className="py-3.5 px-3">OPERATOR / MACHINE</th>
                <th className="py-3.5 px-3">DELTA / RESULT STROKES</th>
                <th className="py-3.5 px-4">STATUS OVERVIEW</th>
                <th className="py-3.5 px-4">NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    查無異動紀錄
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-emerald-50/30 transition">
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-slate-900">{txn.id}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{txn.timestamp}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block">{txn.toolingId}</div>
                      <div className="font-bold text-slate-900 line-clamp-1 mt-0.5">{txn.toolingName}</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                        txn.type === '領用' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        txn.type === '歸還' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        txn.type === '保養發起' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {txn.type}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{txn.operator}</div>
                      <div className="text-slate-600 text-[11px] font-medium">{txn.machineOrLine || '-'}</div>
                    </td>

                    <td className="py-3.5 px-3 font-mono">
                      {txn.deltaStrokes ? (
                        <div className="text-emerald-700 font-bold">+{(txn.deltaStrokes).toLocaleString()} 次</div>
                      ) : (
                        <div className="text-slate-400">-</div>
                      )}
                      <div className="text-slate-800 font-bold">累積: {(txn.resultingStrokes).toLocaleString()} 次</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="text-slate-500 font-medium">{txn.previousStatus}</span>
                        <span className="text-slate-400">→</span>
                        <span className="text-slate-900 font-extrabold">{txn.newStatus}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate font-medium">
                      {txn.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
