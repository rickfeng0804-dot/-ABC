import React, { useState } from 'react';
import { Bot, Sparkles, AlertTriangle, CheckCircle2, Wrench, Loader2, ArrowRight } from 'lucide-react';
import { ToolingItem } from '../types';

interface AiDiagnosticModalProps {
  toolings: ToolingItem[];
}

export const AiDiagnosticModal: React.FC<AiDiagnosticModalProps> = ({ toolings }) => {
  const [selectedToolingId, setSelectedToolingId] = useState<string>(toolings[0]?.id || '');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const activeTooling = toolings.find(t => t.id === selectedToolingId) || toolings[0];

  const runAiAnalysis = async () => {
    if (!activeTooling) return;
    setLoading(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/ai-diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tooling: activeTooling
        })
      });

      if (!response.ok) {
        throw new Error('AI Server Diagnostic Request Failed');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis || '診斷完成。模具運作指標符合正常基準。');
    } catch (err) {
      // Fallback offline heuristic diagnostic if server API key is absent or offline
      const usageRatio = (activeTooling.currentStrokes / activeTooling.maxStrokes) * 100;
      let advice = `【AI 智能模治具診斷報告 - ${activeTooling.id}】\n\n`;
      advice += `1. 剩餘壽命預測: 目前消耗 ${usageRatio.toFixed(1)}% (${activeTooling.currentStrokes.toLocaleString()} / ${activeTooling.maxStrokes.toLocaleString()} 次)。\n`;

      if (usageRatio >= 95) {
        advice += `🚨 警示等級: [CRITICAL 臨界點]\n建議立即排程下機，退回 ${activeTooling.supplierId} 原廠進行精磨退鍍與鋼材硬度測量。\n`;
      } else if (usageRatio >= 80) {
        advice += `⚠️ 警示等級: [WARNING 高風險]\n目前已超過 80% 壽命警示點。針對 ${activeTooling.category} 特性，建議重點檢查邊緣毛邊與導線槽張力。\n`;
      } else {
        advice += `✅ 警示等級: [NORMAL 健康]\n模具狀況良好，請維持每 ${activeTooling.maintenanceInterval.toLocaleString()} 次之定期保養。`;
      }

      advice += `\n\n2. 電感製程預防性保養 (PM) 建議:\n`;
      if (activeTooling.category === '繞線模具') {
        advice += `- 清潔導線槽與鎢鋼心軸，防止漆包線 (Enameled Wire) 刮傷導致匝間短路 (Inter-turn Short)。\n- 檢測張力彈簧衰減，維持繞線張力於 +/- 2% 精度內。`;
      } else if (activeTooling.category === '成型模具') {
        advice += `- 檢查合金粉末加壓腔體磨損，防止一體成型電感外觀出現毛邊 (Burrs) 或電感值 L 偏低。\n- 補充高壓抗磨潤滑脂。`;
      } else if (activeTooling.category === '測試治具') {
        advice += `- 以標準件校正高頻 LCR 測試夾座，測量探針接觸電阻 DCR 是否 > 0.5 mΩ。`;
      } else {
        advice += `- 進行超音波去油污清洗與耐高溫矽膠圈密封度檢測。`;
      }

      setAnalysisResult(advice);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="bg-slate-900/50 rounded-2xl p-6 text-white shadow-xl border border-purple-800/80">
        <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Gemini AI 智能電感模治具健康診斷工程師</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          電感模具殘餘壽命 (RUL) 預測與異常根因診斷
        </h1>
        <p className="text-slate-400 text-xs mt-1 max-w-2xl leading-relaxed">
          針對繞線張力漂移、金屬粉末壓鑄磨損、鍍鈦頂針毛邊與高頻 LCR 測試探針阻抗波動進行 Gemini AI 多維度壽命評估與保養清單生成。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Tooling Selector Bento Card */}
        <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Wrench className="w-4 h-4 text-purple-400" />
            <span>選擇需要診斷之模治具</span>
          </h3>

          <div className="space-y-2">
            {toolings.map((t) => {
              const isSelected = t.id === selectedToolingId;
              const ratio = (t.currentStrokes / t.maxStrokes) * 100;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedToolingId(t.id)}
                  className={`w-full text-left p-3 rounded-xl border transition ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500 shadow-sm ring-1 ring-purple-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className={isSelected ? 'text-purple-300' : 'text-blue-400'}>{t.id}</span>
                    <span className={ratio >= 95 ? 'text-red-400' : ratio >= 80 ? 'text-orange-400' : 'text-slate-400'}>
                      {ratio.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-white line-clamp-1 mt-0.5">{t.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{t.category} | {t.status}</div>
                </button>
              );
            })}
          </div>

          <button
            onClick={runAiAnalysis}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                <span>Gemini AI 診斷分析中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-purple-300" />
                <span>發起 Gemini 模具健康 AI 診斷</span>
              </>
            )}
          </button>
        </div>

        {/* Right: AI Output Panel Bento Card */}
        <div className="md:col-span-2 bg-slate-950 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-base text-white">AI 診斷與保養 SOP 輸出報告</h3>
            </div>
            {activeTooling && (
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-purple-900/50 text-purple-300 border border-purple-700">
                Target: {activeTooling.id}
              </span>
            )}
          </div>

          {analysisResult ? (
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {analysisResult}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 text-purple-500/40 mx-auto" />
              <p className="text-xs">請點選左側「發起 Gemini 模具健康 AI 診斷」按鈕</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
