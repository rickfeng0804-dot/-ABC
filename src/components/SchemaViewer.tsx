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
      <div className="bg-sky-50/50 rounded-2xl p-5 border border-sky-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-800 font-bold text-xs uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4 text-sky-700" />
            <span>Google Sheets 後端資料庫規劃 Schema Specification</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">
            試算表欄位結構與資料型態規範
          </h1>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            點選下方分頁查看各工作表欄位名稱、資料型態、運算公式與條件式格式建議
          </p>
        </div>

        <button
          onClick={() => handleCopyHeaders(activeSchema.tabName)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition shadow-xs shrink-0"
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
      <div className="flex space-x-2 overflow-x-auto border-b border-slate-200 pb-2 no-scrollbar">
        {GOOGLE_SHEET_SCHEMAS.map((schema) => (
          <button
            key={schema.tabName}
            onClick={() => setActiveTabName(schema.tabName)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap shadow-xs ${
              activeTabName === schema.tabName
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <TableProperties className="w-4 h-4" />
            <span>{schema.tabName}</span>
            <span className="text-[10px] opacity-80 font-normal">({schema.tabLabel})</span>
          </button>
        ))}
      </div>

      {/* Description Card */}
      <div className="bg-blue-50/40 p-4 rounded-2xl border border-blue-200 text-xs text-slate-700 flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <div className="font-extrabold text-sm text-slate-900 mb-0.5">工作表：{activeSchema.tabName} ({activeSchema.tabLabel})</div>
          <div className="text-slate-600 font-medium">{activeSchema.description}</div>
        </div>
      </div>

      {/* Field Table Bento Box */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-sky-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-3 w-12 text-center">COL</th>
                <th className="py-3.5 px-4">FIELD KEY</th>
                <th className="py-3.5 px-4">LABEL</th>
                <th className="py-3.5 px-3">TYPE</th>
                <th className="py-3.5 px-2 text-center">REQ</th>
                <th className="py-3.5 px-4">EXAMPLE</th>
                <th className="py-3.5 px-6">LOGIC & DESCRIPTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeSchema.fields.map((field) => (
                <tr key={field.fieldName} className="hover:bg-sky-50/30 transition">
                  <td className="py-3.5 px-3 text-center font-mono font-bold text-blue-700 bg-slate-50 border-r border-slate-200">
                    {field.columnLetter}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    {field.fieldName}
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-800">
                    {field.fieldLabel}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${
                      field.dataType === 'Formula' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      field.dataType === 'Enum' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      field.dataType === 'Number' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {field.dataType}
                    </span>
                  </td>

                  <td className="py-3.5 px-2 text-center">
                    {field.required ? (
                      <span className="text-red-600 font-extrabold">✓</span>
                    ) : (
                      <span className="text-slate-400 font-bold">-</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-700 bg-slate-50/60 font-medium">
                    {field.exampleValue}
                  </td>

                  <td className="py-3.5 px-6 text-slate-600 font-medium">
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
