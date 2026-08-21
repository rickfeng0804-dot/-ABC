import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Link, 
  RotateCcw, 
  Send, 
  Zap, 
  ExternalLink,
  ShieldCheck,
  Radio,
  Copy,
  Check
} from 'lucide-react';
import { 
  DEFAULT_GAS_URL, 
  getGasUrl, 
  setGasUrl, 
  testGasConnection, 
  fetchToolingsFromGas, 
  pushTransactionToGas,
  SyncResult 
} from '../services/googleSheetService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncToolingsFromSheet?: (toolingsData: any[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSyncToolingsFromSheet
}) => {
  if (!isOpen) return null;

  const [gasUrlInput, setGasUrlInput] = useState<string>('');
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [statusMessage, setStatusMessage] = useState<SyncResult | null>(null);
  const [testing, setTesting] = useState<boolean>(false);
  const [pulling, setPulling] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  useEffect(() => {
    setGasUrlInput(getGasUrl());
    const savedAuto = localStorage.getItem('tms_auto_sync');
    if (savedAuto !== null) {
      setAutoSync(savedAuto === 'true');
    }
  }, [isOpen]);

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = gasUrlInput.trim();
    setGasUrl(cleanUrl);
    localStorage.setItem('tms_auto_sync', String(autoSync));
    
    setSavedSuccess(true);
    setStatusMessage({
      success: true,
      message: '✅ 設定已成功更新並儲存至系統！'
    });

    setTimeout(() => {
      setSavedSuccess(false);
    }, 2500);
  };

  const handleResetDefault = () => {
    setGasUrlInput(DEFAULT_GAS_URL);
    setGasUrl(DEFAULT_GAS_URL);
    setStatusMessage({
      success: true,
      message: '✅ 已重置並儲存為預設 Google Apps Script Web App URL！'
    });
  };

  const handleCopyUrl = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setStatusMessage(null);
    handleSaveSettings();

    const result = await testGasConnection(gasUrlInput.trim());
    setTesting(false);
    setStatusMessage(result);
  };

  const handlePullData = async () => {
    setPulling(true);
    setStatusMessage(null);
    handleSaveSettings();

    const result = await fetchToolingsFromGas(gasUrlInput.trim());
    setPulling(false);
    setStatusMessage(result);

    if (result.success && result.data && onSyncToolingsFromSheet) {
      onSyncToolingsFromSheet(result.data);
    }
  };

  const handleTestPush = async () => {
    setTesting(true);
    setStatusMessage(null);
    handleSaveSettings();

    const result = await pushTransactionToGas({
      toolingId: 'T-INDUCT-001',
      type: '領用',
      operator: 'EMP-TEST (連線測試)',
      machineOrLine: '測試機台 Line 01',
      deltaStrokes: 0,
      notes: '系統設定 - API 測試連線封包'
    }, gasUrlInput.trim());

    setTesting(false);
    setStatusMessage(result);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative my-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <span>Google Sheet 資料同步與系統設定</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                GAS API URL Config
              </span>
            </h2>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              設定與更新自動化壽命警示與異動連動腳本 (Code.gs) 部署網址，實現前端與 Google Sheet 雙向即時同步
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
          {/* GAS URL Input Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Link className="w-4 h-4 text-blue-600" />
                <span>自動化壽命警示與異動連動腳本 (Code.gs) 部署 URL</span>
              </label>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-[11px] text-slate-500 hover:text-blue-700 flex items-center gap-1 transition font-bold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>恢復系統預設 URL</span>
              </button>
            </div>

            <div className="relative flex items-center">
              <input
                type="url"
                required
                value={gasUrlInput}
                onChange={(e) => setGasUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full p-3.5 pr-24 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-blue-900 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition shadow-inner font-semibold"
              />
              <div className="absolute right-2 top-2.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(gasUrlInput)}
                  title="複製目前 URL"
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {gasUrlInput.trim() === DEFAULT_GAS_URL && (
                  <span className="px-2 py-1 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    預設
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-bold">系統預設 URL (Default Web App Endpoint):</span>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(DEFAULT_GAS_URL)}
                  className="text-blue-700 hover:text-blue-900 flex items-center gap-1 font-mono transition font-bold"
                >
                  <Copy className="w-3 h-3" />
                  <span>複製預設 URL</span>
                </button>
              </div>
              <code className="block text-slate-800 font-mono text-[11px] select-all break-all bg-white p-2 rounded border border-slate-200 font-medium">
                {DEFAULT_GAS_URL}
              </code>
            </div>
          </div>

          {/* Auto Sync Toggle */}
          <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-extrabold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                <span>操作異動即時自動同步上傳 (Auto-Sync)</span>
              </div>
              <p className="text-[11px] text-slate-600 font-medium">
                開啟後，現場執行「領用、歸還、保養發起、維護完成」時，系統將自動呼叫 GAS API 寫入 Google Sheet。
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAutoSync(!autoSync)}
              className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${
                autoSync ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing || pulling}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-xs transition border border-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
            >
              <Radio className={`w-4 h-4 text-blue-600 ${testing ? 'animate-pulse' : ''}`} />
              <span>{testing ? '測試連線中...' : '測試 API 連線'}</span>
            </button>

            <button
              type="button"
              onClick={handlePullData}
              disabled={testing || pulling}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-xs transition border border-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-600 ${pulling ? 'animate-spin' : ''}`} />
              <span>{pulling ? '同步載入中...' : '拉取 Sheet 最新資料'}</span>
            </button>

            <button
              type="button"
              onClick={handleTestPush}
              disabled={testing || pulling}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-xs transition border border-slate-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
            >
              <Send className="w-4 h-4 text-purple-600" />
              <span>測試發送封包至 Sheet</span>
            </button>
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs font-mono transition ${
              statusMessage.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                : 'bg-red-50 border-red-200 text-red-800 font-bold'
            }`}>
              {statusMessage.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-bold">{statusMessage.message}</div>
                {statusMessage.data && (
                  <div className="text-[10px] text-slate-600 opacity-90 truncate max-w-lg">
                    Data Payload: {JSON.stringify(statusMessage.data)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <a
              href={gasUrlInput}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-1 font-bold"
            >
              <span>在新視窗開啟 Web App Endpoint</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
              >
                關閉
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{savedSuccess ? '已成功儲存！' : '儲存變更設定'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

