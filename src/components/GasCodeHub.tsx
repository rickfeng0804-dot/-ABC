import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  Zap, 
  Mail, 
  ShieldAlert, 
  Layers, 
  ArrowUpRight, 
  Link, 
  Settings, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { GAS_CODE_GS } from '../data/gasCodeTemplate';
import { DEFAULT_GAS_URL, getGasUrl } from '../services/googleSheetService';

interface GasCodeHubProps {
  openSettings?: () => void;
}

export const GasCodeHub: React.FC<GasCodeHubProps> = ({ openSettings }) => {
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(getGasUrl());

  useEffect(() => {
    setCurrentUrl(getGasUrl());
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(GAS_CODE_GS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyUrl = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Bento Card */}
      <div className="bg-sky-50/60 rounded-2xl p-6 text-slate-900 shadow-xs border border-sky-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-sky-800 font-bold text-xs uppercase tracking-wider mb-1">
            <Zap className="w-4 h-4 text-sky-700" />
            <span>Google Apps Script (GAS) 核心程式碼 Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            自動化壽命警示與異動連動腳本 (Code.gs)
          </h1>
          <p className="text-slate-600 text-xs mt-1 max-w-2xl leading-relaxed font-medium">
            無縫整合 Google Sheet。當模治具沖數消耗達到 80% 預警或 95% 臨界點時，腳本自動將 Google Sheet 儲存格塗上紅黃底色並寄發 Email 提醒通知！
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition shadow-xs shrink-0"
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

      {/* GAS Web App Endpoint URL Card */}
      <div className="bg-white rounded-2xl p-5 border border-sky-300 shadow-xs space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
              <Link className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-sm">自動化壽命警示與異動連動腳本 (Code.gs) 部署 Web App URL</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                  API Active
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                前端與 Google Sheet 雙向同步的 REST API 端點，可於系統設定隨時更新、修改、儲存與測試連線
              </p>
            </div>
          </div>

          {openSettings && (
            <button
              onClick={openSettings}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold border border-slate-200 transition self-start sm:self-auto shrink-0 shadow-xs"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span>前往系統設定修改 URL</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <div className="flex-1 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-xs text-blue-800 break-all select-all flex items-center justify-between gap-2 shadow-inner font-semibold">
            <span className="truncate">{currentUrl}</span>
            {currentUrl === DEFAULT_GAS_URL && (
              <span className="shrink-0 px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                預設 URL
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleCopyUrl(currentUrl)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition shadow-xs"
            >
              {copiedUrl ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>已複製 URL</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>複製 URL</span>
                </>
              )}
            </button>

            <a
              href={currentUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 transition shadow-xs"
              title="在新分頁開啟 Endpoint"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Logic Breakdown Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm mb-1">
            <ShieldAlert className="w-4 h-4 text-orange-600" />
            <span>1. 壽命與 PM 保養自動巡檢</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
            <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono border border-blue-100 font-bold">checkToolingLifespanAndAlert()</code> 每天定時比對 <code className="text-slate-900 font-bold">current_strokes</code> 與 <code className="text-slate-900 font-bold">max_strokes</code>。超過 80% 標黃底，超過 95% 標紅底並觸發 Email。
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm mb-1">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>2. 領退驗證與原子連動</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
            <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-mono border border-blue-100 font-bold">processTransaction()</code> 自動更新 Tooling_Master 目前狀態與掛載機台，同時在 Transaction_Log 自動建立獨一號次 (TXN-YYYYMMDD-xxx)。
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm mb-1">
            <Terminal className="w-4 h-4 text-emerald-600" />
            <span>3. REST API Web App 部署</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
            內建 <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono border border-emerald-100 font-bold">doGet()</code> 與 <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-mono border border-emerald-100 font-bold">doPost()</code> 介面，供平板、藍芽條碼槍或 AppSheet 行動 App 直接呼叫 JSON REST API。
          </p>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 font-mono font-bold text-sky-400">
            <Code2 className="w-4 h-4" />
            <span>Code.gs (Google Apps Script Engine)</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg transition text-xs font-bold"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <pre className="p-4 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed select-all">
          {GAS_CODE_GS}
        </pre>
      </div>

      {/* Deployment Installation Steps */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-600" />
          <span>Google Apps Script 部署與觸發器安裝四步驟</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-slate-900">步驟 1：建立 Google Sheet 並建置 4 個工作表</div>
            <p className="text-slate-600 font-medium">
              在雲端硬碟建立試算表，新增 `Tooling_Master`、`Transaction_Log`、`Maintenance_Log`、`Supplier_Info` 分頁（可點選本系統「Schema 分頁」複製表頭）。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-slate-900">步驟 2：開啟 Apps Script 編輯器</div>
            <p className="text-slate-600 font-medium">
              在 Google Sheet 上方選單點選「擴充功能」-&gt;「Apps Script」，將既有的程式碼全部清除，並貼上上方複製之 `Code.gs`。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-slate-900">步驟 3：設定每日定時自動巡檢觸發器</div>
            <p className="text-slate-600 font-medium">
              在 GAS 編輯器左側點選「觸發器 (鬧鐘圖示)」，新增觸發器：函數選擇 `checkToolingLifespanAndAlert`，時間型觸發器設定「每日上午 8:00」。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="font-extrabold text-slate-900">步驟 4：發布為 Web 應用程式 (API 串接)</div>
            <p className="text-slate-600 font-medium">
              點選右上方「部署」-&gt;「新部署作業」，類型選擇「Web 應用程式」，執行身分選擇「我」，存取權限選擇「任何人」。即可取得 Web API URL！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

