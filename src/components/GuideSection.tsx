import React from 'react';
import { BookOpenCheck } from 'lucide-react';
import { FACTORY_SOP_SECTIONS } from '../data/sopGuideData';

export const GuideSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="bg-purple-50/50 rounded-2xl p-6 text-slate-900 shadow-xs border border-purple-200/80">
        <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-wider mb-1">
          <BookOpenCheck className="w-4 h-4 text-purple-700" />
          <span>工廠現場作業 & AppSheet 擴充優化建議</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          現場作業員與工程師操作最佳實務 (SOP Guide)
        </h1>
        <p className="text-slate-600 text-xs mt-1 max-w-2xl leading-relaxed font-medium">
          針對電感元件生產線（繞線、壓鑄、點膠、測試）之環境特性，提供平板/藍芽條碼槍零誤刷流程、AppSheet 行動 UI 擴充與預防性保養 PM 標準作業程序。
        </p>
      </div>

      {/* Operations Advice Cards */}
      <div className="space-y-6">
        {FACTORY_SOP_SECTIONS.map((section, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  0{idx + 1}
                </span>
                <span>{section.title}</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 ml-8 font-medium">{section.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {section.steps.map((step) => (
                <div key={step.num} className="bg-purple-50/20 p-4 rounded-xl border border-purple-100 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        STEP {step.num}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-xs">{step.stepName}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">{step.content}</p>
                  </div>

                  {step.highlight && (
                    <div className="pt-2 border-t border-purple-100 text-[11px] font-bold text-purple-900 bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                      💡 {step.highlight}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

