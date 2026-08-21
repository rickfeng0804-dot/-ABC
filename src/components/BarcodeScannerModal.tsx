import React, { useState } from 'react';
import { QrCode, Scan, Camera, Wrench, CheckCircle2, ArrowRight, AlertTriangle, X } from 'lucide-react';
import { ToolingItem } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolings: ToolingItem[];
  onScanResult: (tooling: ToolingItem, action: '領用' | '歸還' | '保養發起') => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  toolings,
  onScanResult
}) => {
  const [scannedId, setScannedId] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [matchedTooling, setMatchedTooling] = useState<ToolingItem | null>(null);

  if (!isOpen) return null;

  const handleManualScan = (idToScan: string) => {
    setScannedId(idToScan);
    const found = toolings.find(t => t.id.toLowerCase() === idToScan.trim().toLowerCase());
    setMatchedTooling(found || null);
    setIsScanning(false);
  };

  const handleActionSelect = (action: '領用' | '歸還' | '保養發起') => {
    if (matchedTooling) {
      onScanResult(matchedTooling, action);
      onClose();
    }
  };

  const resetScanner = () => {
    setScannedId('');
    setMatchedTooling(null);
    setIsScanning(true);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white text-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-700">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">工廠現場平板 - 條碼/QR掃描器</h2>
            <p className="text-xs text-slate-600 font-medium">支援藍芽一維 Barcode 槍與二維 QR Code 掃描</p>
          </div>
        </div>

        {/* Viewport Simulation */}
        {isScanning ? (
          <div className="space-y-4">
            <div className="relative w-full h-52 bg-slate-900 rounded-2xl border-2 border-dashed border-amber-400/60 flex flex-col items-center justify-center overflow-hidden">
              {/* Scan Line Animation */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse top-1/2 shadow-[0_0_15px_#f59e0b]" />

              <Scan className="w-12 h-12 text-slate-400 animate-bounce mb-2" />
              <span className="text-xs font-mono text-slate-300">對準模治具銘牌上的條碼...</span>
              <span className="text-[10px] text-amber-300 mt-1 font-semibold">相機偵測中 (Ready for Input)</span>
            </div>

            {/* Quick Demo Selector */}
            <div>
              <div className="text-xs font-bold text-slate-700 mb-2">點擊以下示範銘牌測試掃描：</div>
              <div className="grid grid-cols-2 gap-2">
                {toolings.slice(0, 4).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleManualScan(t.id)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 text-left transition shadow-xs"
                  >
                    <div className="font-mono font-bold text-xs text-amber-700">{t.id}</div>
                    <div className="text-[11px] text-slate-800 font-semibold truncate">{t.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Input Fallback */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">或手動輸入 Barcode ID：</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="例如: T-INDUCT-001"
                  value={scannedId}
                  onChange={(e) => setScannedId(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono outline-none focus:border-amber-500 focus:bg-white font-semibold"
                />
                <button
                  onClick={() => handleManualScan(scannedId)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition shadow-xs"
                >
                  解碼確認
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Scanned Result & Quick Action Card */
          <div className="space-y-4">
            {matchedTooling ? (
              <div className="bg-amber-50/30 p-4 rounded-2xl border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-amber-800 px-2 py-0.5 rounded bg-amber-100/70 border border-amber-300">
                    {matchedTooling.id}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    matchedTooling.status === '在庫' ? 'bg-emerald-100 text-emerald-800' :
                    matchedTooling.status === '使用中' ? 'bg-blue-100 text-blue-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {matchedTooling.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{matchedTooling.name}</h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium">規格: {matchedTooling.specification}</p>
                  <p className="text-xs text-slate-600 font-medium">庫位: {matchedTooling.location}</p>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-amber-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">累積沖數:</span>
                  <span className="font-mono font-extrabold text-slate-900">
                    {matchedTooling.currentStrokes.toLocaleString()} / {matchedTooling.maxStrokes.toLocaleString()}
                  </span>
                </div>

                {/* Quick Transaction Action Choice */}
                <div className="pt-2 space-y-2">
                  <div className="text-xs font-bold text-slate-900">請選擇現場異動作業：</div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {matchedTooling.status === '在庫' && (
                      <button
                        onClick={() => handleActionSelect('領用')}
                        className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <span>領用出庫</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    {matchedTooling.status === '使用中' && (
                      <button
                        onClick={() => handleActionSelect('歸還')}
                        className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                      >
                        <span>歸還入庫/結算</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleActionSelect('保養發起')}
                      className="p-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>發起 PM 保養</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-red-50 p-4 rounded-2xl border border-red-200 text-red-800 space-y-2">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                <div className="font-extrabold text-sm">找不到編號 「{scannedId}」 之模治具</div>
                <div className="text-xs text-red-600 font-medium">請重新確認 Barcode 貼紙或至主檔新增資料</div>
              </div>
            )}

            <button
              onClick={resetScanner}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
            >
              重新掃描其他銘牌
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
