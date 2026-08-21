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
  | 'sop_guide';

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
    { id: 'sop_guide' as TabType, label: '現場指南 & AppSheet', icon: BookOpenCheck }
  ];

  const fontSizeOptions: { id: FontSizeLevel; label: string; scaleText: string }[] = [
    { id: 'normal', label: '標準', scaleText: '100%' },
    { id: 'large', label: '大', scaleText: '115%' },
    { id: 'xlarge', label: '特大', scaleText: '130%' },
    { id: 'xxlarge', label: '超大', scaleText: '145%' }
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md text-slate-900 sticky top-0 z-40 border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo / Brand Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight text-slate-900">
                  千如電子集團楊梅二廠模治具管理系統 <span className="text-blue-600 font-mono text-xs font-bold">Demo版</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hidden lg:inline-block font-semibold">
                  GAS + Sheet Core
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block uppercase tracking-wider font-semibold text-[10px]">
                ABC Taiwan Electronics Corp. Yangmei Plant #2 TMS Demo
              </p>
            </div>
          </div>

          {/* Action Buttons & Font Settings */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Font Size Selector Control */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1 px-2 text-slate-600 border-r border-slate-300 mr-1 hidden md:flex">
                <Type className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-bold text-slate-700">字體:</span>
              </div>
              <div className="flex space-x-0.5">
                {fontSizeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFontSize(opt.id)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                      fontSize === opt.id
                        ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-semibold text-xs transition shrink-0 shadow-xs"
              title="Google Sheet 同步與系統 API 設定"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Sheet 設定</span>
              <Settings className="w-3.5 h-3.5 text-slate-500" />
            </button>

            <button
              onClick={openBarcodeScanner}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-sm active:scale-95 shrink-0"
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden md:inline">條碼掃描領退</span>
            </button>

            {alertCount > 0 && (
              <button
                onClick={() => setActiveTab('toolings')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition shrink-0"
                title={`${alertCount} 個模治具達預警或保養門檻`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
                <span>{alertCount} 預警</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation - Functional Menu List (Enlarged Font Size) */}
        <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-2.5 border-t border-slate-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            // Font size scaling for functional menu list
            const navTextSize = 
              fontSize === 'xxlarge' ? 'text-lg sm:text-xl' :
              fontSize === 'xlarge' ? 'text-base sm:text-lg' :
              fontSize === 'large' ? 'text-sm sm:text-base' :
              'text-sm sm:text-base';

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl ${navTextSize} font-bold whitespace-nowrap transition-all tracking-wide ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-extrabold'
                    : 'text-slate-700 hover:text-blue-700 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-blue-600'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
