import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, Zap, Mail, ShieldAlert, Layers, ArrowUpRight } from 'lucide-react';
import { GAS_CODE_GS } from '../data/gasCodeTemplate';

export const GasCodeHub: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(GAS_CODE_GS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Bento Card */}
      <div className="bg-slate-900/50 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>Google Apps Script (GAS) 核心程式碼 Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            自動化壽命警示與異動連動腳本 (Code.gs)
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
            無縫整合 Google Sheet。當模治具沖數消耗達到 80% 預警或 95% 臨界點時，腳本自動將 Google Sheet 儲存格塗上紅黃底色並寄發 Email 提醒通知！
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition shadow-lg shadow-blue-900/30 shrink-0"
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 text-emerald-300" />
              <span>已複製完整 GAS 腳本！</span>
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              <span>一鍵複製 GAS 完整 Code.gs</span>
            </>
          )}
        </button>
      </div>

      {/* Logic Breakdown Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <span>1. 壽命與 PM 保養自動巡檢</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            <code className="text-blue-400 bg-slate-950 px-1 py-0.5 rounded font-mono">checkToolingLifespanAndAlert()</code> 每天定時比對 <code className="text-slate-300">current_strokes</code> 與 <code className="text-slate-300">max_strokes</code>。超過 80% 標黃底，超過 95% 標紅底並觸發 Email。
          </p>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>2. 領退驗證與原子連動</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            <code className="text-blue-400 bg-slate-950 px-1 py-0.5 rounded font-mono">processTransaction()</code> 自動更新 Tooling_Master 目前狀態與掛載機台，同時在 Transaction_Log 自動建立獨一號次 (TXN-YYYYMMDD-xxx)。
          </p>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-white text-sm mb-1">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>3. REST API Web App 部署</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            內建 <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded font-mono">doGet()</code> 與 <code className="text-emerald-400 bg-slate-950 px-1 py-0.5 rounded font-mono">doPost()</code> 介面，供平板、藍芽條碼槍或 AppSheet 行動 App 直接呼叫 JSON REST API。
          </p>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 font-mono font-bold text-blue-400">
            <Code2 className="w-4 h-4" />
            <span>Code.gs (Google Apps Script Engine)</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="p-4 text-slate-300 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed select-all">
          {GAS_CODE_GS}
        </pre>
      </div>

      {/* Deployment Installation Steps */}
      <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-800 shadow-lg space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-400" />
          <span>Google Apps Script 部署與觸發器安裝四步驟</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-white">步驟 1：建立 Google Sheet 並建置 4 個工作表</div>
            <p className="text-slate-400">
              在雲端硬碟建立試算表，新增 `Tooling_Master`、`Transaction_Log`、`Maintenance_Log`、`Supplier_Info` 分頁（可點選本系統「Schema 分頁」複製表頭）。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-white">步驟 2：開啟 Apps Script 編輯器</div>
            <p className="text-slate-400">
              在 Google Sheet 上方選單點選「擴充功能」-&gt;「Apps Script」，將既有的程式碼全部清除，並貼上上方複製之 `Code.gs`。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-white">步驟 3：設定每日定時自動巡檢觸發器</div>
            <p className="text-slate-400">
              在 GAS 編輯器左側點選「觸發器 (鬧鐘圖示)」，新增觸發器：函數選擇 `checkToolingLifespanAndAlert`，時間型觸發器設定「每日上午 8:00」。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <div className="font-bold text-white">步驟 4：發布為 Web 應用程式 (API 串接)</div>
            <p className="text-slate-400">
              點選右上方「部署」-&gt;「新部署作業」，類型選擇「Web 應用程式」，執行身分選擇「我」，存取權限選擇「任何人」。即可取得 Web API URL！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
