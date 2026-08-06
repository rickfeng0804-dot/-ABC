import React, { useState } from 'react';
import { TableProperties, Copy, Check, Info, FileSpreadsheet } from 'lucide-react';
import { GOOGLE_SHEET_SCHEMAS } from '../data/schemaData';

export const SchemaViewer: React.FC = () => {
  const [activeTabName, setActiveTabName] = useState(GOOGLE_SHEET_SCHEMAS[0].tabName);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const activeSchema = GOOGLE_SHEET_SCHEMAS.find(s => s.tabName === activeTabName) || GOOGLE_SHEET_SCHEMAS[0];

  const handleCopyHeaders = (tabName: string) => {
    const schema = GOOGLE_SHEET_SCHEMAS.find(s => s.tabName === tabName);
    if (!schema) return;

    const headers = schema.fields.map(f => f.fieldName).join('\t'); // TSV for pasting directly into Google Sheet row 1
    navigator.clipboard.writeText(headers);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheets 後端資料庫規劃 Schema Specification</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            試算表欄位結構與資料型態規範
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            點選下方分頁查看各工作表欄位名稱、資料型態、運算公式與條件式格式建議
          </p>
        </div>

        <button
          onClick={() => handleCopyHeaders(activeSchema.tabName)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition shadow-md shadow-blue-900/20 shrink-0"
        >
          {copiedTab === activeSchema.tabName ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>已複製表頭 (可直接貼至 Google Sheet)</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>複製 [{activeSchema.tabName}] 試算表第一列表頭</span>
            </>
          )}
        </button>
      </div>

      {/* Sheet Tabs */}
      <div className="flex space-x-2 overflow-x-auto border-b border-slate-800 pb-2 no-scrollbar">
        {GOOGLE_SHEET_SCHEMAS.map((schema) => (
          <button
            key={schema.tabName}
            onClick={() => setActiveTabName(schema.tabName)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTabName === schema.tabName
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>{schema.tabName}</span>
            <span className="text-[10px] opacity-75 font-normal">({schema.tabLabel})</span>
          </button>
        ))}
      </div>

      {/* Description Card */}
      <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-sm text-white mb-0.5">工作表：{activeSchema.tabName} ({activeSchema.tabLabel})</div>
          <div className="text-slate-400">{activeSchema.description}</div>
        </div>
      </div>

      {/* Field Table Bento Box */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-3 w-12 text-center">COL</th>
                <th className="py-3.5 px-4">FIELD KEY</th>
                <th className="py-3.5 px-4">LABEL</th>
                <th className="py-3.5 px-3">TYPE</th>
                <th className="py-3.5 px-2 text-center">REQ</th>
                <th className="py-3.5 px-4">EXAMPLE</th>
                <th className="py-3.5 px-6">LOGIC & DESCRIPTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activeSchema.fields.map((field) => (
                <tr key={field.fieldName} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-blue-400 bg-slate-950/60 border-r border-slate-800">
                    {field.columnLetter}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {field.fieldName}
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    {field.fieldLabel}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                      field.dataType === 'Formula' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                      field.dataType === 'Enum' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      field.dataType === 'Number' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {field.dataType}
                    </span>
                  </td>

                  <td className="py-3.5 px-2 text-center">
                    {field.required ? (
                      <span className="text-red-400 font-bold">✓</span>
                    ) : (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-400 bg-slate-950/40">
                    {field.exampleValue}
                  </td>

                  <td className="py-3.5 px-6 text-slate-400">
                    {field.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
