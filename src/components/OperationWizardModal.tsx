import React, { useState } from 'react';
import { Wrench, CheckCircle2, ArrowLeftRight, AlertTriangle, X, Send } from 'lucide-react';
import { ToolingItem, TransactionType, ToolingStatus, MaintenanceType } from '../types';

interface OperationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  selectedTooling?: ToolingItem | null;
  allToolings: ToolingItem[];
  onSubmitOperation: (
    toolingId: string,
    type: TransactionType,
    operator: string,
    machineOrLine: string,
    deltaStrokes: number,
    notes: string,
    maintenanceInfo?: {
      mntType: MaintenanceType;
      actionTaken: string;
      replacedParts: string;
      cost: number;
    }
  ) => void;
}

export const OperationWizardModal: React.FC<OperationWizardModalProps> = ({
  isOpen,
  onClose,
  type,
  selectedTooling,
  allToolings,
  onSubmitOperation
}) => {
  if (!isOpen) return null;

  const [targetToolingId, setTargetToolingId] = useState(selectedTooling ? selectedTooling.id : allToolings[0]?.id || '');
  const [operator, setOperator] = useState('EMP-2045 (陳工程師)');
  const [machineOrLine, setMachineOrLine] = useState('自動繞線 02 號機 (Line A1)');
  const [deltaStrokes, setDeltaStrokes] = useState<number>(15000);
  const [notes, setNotes] = useState('');

  // Maintenance specific
  const [mntType, setMntType] = useState<MaintenanceType>('定期保養');
  const [actionTaken, setActionTaken] = useState('超音波溝槽清洗、拋光模面、更換微調張力彈簧與潤滑補充');
  const [replacedParts, setReplacedParts] = useState('導線張力彈簧 x2');
  const [cost, setCost] = useState<number>(3500);

  const activeTooling = allToolings.find(t => t.id === targetToolingId) || selectedTooling;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetToolingId) return;

    onSubmitOperation(
      targetToolingId,
      type,
      operator,
      machineOrLine,
      Number(deltaStrokes) || 0,
      notes,
      type === '保養發起' || type === '維護完成' ? {
        mntType,
        actionTaken,
        replacedParts,
        cost: Number(cost) || 0
      } : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-800 overflow-hidden relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-2xl border ${
            type === '領用' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            type === '歸還' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
            type === '保養發起' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              現場【{type}】快速作業精靈
            </h2>
            <p className="text-xs text-slate-400">
              自動同步連動 Google Sheet 資料庫與更新 Tooling_Master 異動欄位
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Tooling Choice */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1">選擇模治具 *</label>
            <select
              value={targetToolingId}
              onChange={(e) => setTargetToolingId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono font-semibold text-white focus:border-blue-500 outline-none"
            >
              {allToolings.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} - {t.name} ({t.status})
                </option>
              ))}
            </select>
          </div>

          {activeTooling && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-slate-400">
              <div className="flex justify-between">
                <span>目前狀態：<b className="text-white">{activeTooling.status}</b></span>
                <span>存放架位：<b className="text-white">{activeTooling.location}</b></span>
              </div>
              <div>
                累積使用：<b className="text-blue-400 font-mono">{activeTooling.currentStrokes.toLocaleString()}</b> / {activeTooling.maxStrokes.toLocaleString()} 次
              </div>
            </div>
          )}

          {/* Operator & Line */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">作業人員 / 工號 *</label>
              <input
                type="text"
                required
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-500 outline-none"
                placeholder="EMP-xxxx"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">掛載機台 / 產線</label>
              <input
                type="text"
                value={machineOrLine}
                onChange={(e) => setMachineOrLine(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-500 outline-none"
                placeholder="例如: 繞線 02 機"
              />
            </div>
          </div>

          {/* Delta Strokes for Return / Maintenance */}
          {(type === '歸還' || type === '保養發起') && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                本次新增生產沖次 / 迴數 (Counter Delta) *
              </label>
              <input
                type="number"
                required
                value={deltaStrokes}
                onChange={(e) => setDeltaStrokes(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-sm font-bold text-emerald-400 focus:border-blue-500 outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-0.5">
                系統將自動加算至原沖數，若超過保養週期將發送 GAS 警示 Email
              </p>
            </div>
          )}

          {/* Maintenance details */}
          {(type === '保養發起' || type === '維護完成') && (
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-3">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-400" />
                <span>維護與保養細節紀錄 (Maintenance Log)</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-400 mb-0.5">保養類型</label>
                  <select
                    value={mntType}
                    onChange={(e) => setMntType(e.target.value as MaintenanceType)}
                    className="w-full p-2 rounded-xl border border-slate-800 bg-slate-900 text-white"
                  >
                    <option value="定期保養">定期保養 (PM)</option>
                    <option value="異常修繕">異常修繕 (RM)</option>
                    <option value="首件檢驗">首件檢驗 (FAI)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-400 mb-0.5">保養費用 (TWD)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full p-2 rounded-xl border border-slate-800 bg-slate-900 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-0.5">保養內容處置</label>
                <input
                  type="text"
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-400 mb-0.5">更換備件</label>
                <input
                  type="text"
                  value={replacedParts}
                  onChange={(e) => setReplacedParts(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-800 bg-slate-900 text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">備註 / 工單 WO# / 說明</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-500 outline-none"
              placeholder="請填寫工單單號或任何注意事項..."
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition shadow-md shadow-blue-900/30 flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>確認送出並同步 Sheet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
