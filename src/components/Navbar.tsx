import React from 'react';
import { 
  LayoutDashboard, 
  Wrench, 
  ArrowLeftRight, 
  History, 
  ShieldAlert, 
  Building2, 
  TableProperties, 
  Code2, 
  BookOpenCheck,
  Bot,
  QrCode,
  Type,
  Settings,
  Cloud
} from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'toolings' 
  | 'transactions' 
  | 'maintenance' 
  | 'suppliers' 
  | 'schema' 
  | 'gas_code' 
  | 'sop_guide' 
  | 'ai_diagnostic';

export type FontSizeLevel = 'normal' | 'large' | 'xlarge' | 'xxlarge';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  openBarcodeScanner: () => void;
  openSettings: () => void;
  alertCount: number;
  fontSize: FontSizeLevel;
  setFontSize: (size: FontSizeLevel) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openBarcodeScanner,
  openSettings,
  alertCount,
  fontSize,
  setFontSize
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: '概覽儀表板', icon: LayoutDashboard },
    { id: 'toolings' as TabType, label: '模治具主檔', icon: Wrench },
    { id: 'transactions' as TabType, label: '領退與異動', icon: ArrowLeftRight },
    { id: 'maintenance' as TabType, label: '保養維護歷程', icon: History },
    { id: 'suppliers' as TabType, label: '供應商管理', icon: Building2 },
    { id: 'schema' as TabType, label: 'Google Sheet 結構', icon: TableProperties },
    { id: 'gas_code' as TabType, label: 'GAS 核心腳本', icon: Code2 },
    { id: 'sop_guide' as TabType, label: '現場指南 & AppSheet', icon: BookOpenCheck },
    { id: 'ai_diagnostic' as TabType, label: 'AI 壽命診斷', icon: Bot, highlight: true }
  ];

  const fontSizeOptions: { id: FontSizeLevel; label: string; scaleText: string }[] = [
    { id: 'normal', label: '標準', scaleText: '100%' },
    { id: 'large', label: '大', scaleText: '115%' },
    { id: 'xlarge', label: '特大', scaleText: '130%' },
    { id: 'xxlarge', label: '超大', scaleText: '145%' }
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md text-white sticky top-0 z-40 border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo / Brand Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/30">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">
                  TMS Pro <span className="text-blue-400 font-mono text-xs">v2.4</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  GAS + Sheet Core
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block uppercase tracking-wider font-semibold text-[10px]">
                Inductor Component Tooling Management
              </p>
            </div>
          </div>

          {/* Action Buttons & Font Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Font Size Selector Control */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-1 px-2 text-slate-400 border-r border-slate-800/80 mr-1 hidden md:flex">
                <Type className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[11px] font-semibold text-slate-300">字體:</span>
              </div>
              <div className="flex space-x-0.5">
                {fontSizeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFontSize(opt.id)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                      fontSize === opt.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title={`調整字體大小為 ${opt.label} (${opt.scaleText})`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Google Sheet Sync & Settings Button */}
            <button
              onClick={openSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white font-semibold text-xs transition shrink-0"
              title="Google Sheet 同步與系統 API 設定"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Sheet 設定</span>
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={openBarcodeScanner}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-md shadow-blue-900/20 active:scale-95 shrink-0"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden md:inline font-semibold">條碼掃描領退</span>
            </button>

            {alertCount > 0 && (
              <button
                onClick={() => setActiveTab('toolings')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-semibold transition shrink-0"
                title={`${alertCount} 個模治具達預警或保養門檻`}
              >
                <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
                <span>{alertCount} 預警</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md font-semibold'
                    : item.highlight
                    ? 'bg-purple-950/50 text-purple-300 border border-purple-800/60 hover:bg-purple-900/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
