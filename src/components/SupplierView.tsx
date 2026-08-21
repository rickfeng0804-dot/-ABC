import React, { useState } from 'react';
import { Building2, Phone, Mail, Clock, Star, MapPin, Download, Search } from 'lucide-react';
import { SupplierItem } from '../types';
import { downloadCSV } from '../utils/csvExport';

interface SupplierViewProps {
  suppliers: SupplierItem[];
}

export const SupplierView: React.FC<SupplierViewProps> = ({ suppliers }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(sup => 
    sup.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.categories.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportCSV = () => {
    const headers = [
      '供應商編號',
      '廠商名稱',
      '聯絡窗口',
      '連絡電話',
      'Email',
      '平均交期 (天)',
      '評價星級',
      '專業開模/維修類別',
      '廠商地址',
      '備註'
    ];

    const rows = filteredSuppliers.map(sup => [
      sup.id,
      sup.name,
      sup.contactPerson,
      sup.phone,
      sup.email,
      sup.leadTimeDays,
      sup.rating,
      sup.categories.join(' / '),
      sup.address,
      sup.notes || ''
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`Supplier_Info_${dateStr}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-700" />
              <span>供應商與開模廠商資料 (Supplier_Info)</span>
            </h1>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              管理電感繞線心軸、金屬粉末壓鑄超硬模具與 LCR 高頻測試治具開模外送廠商
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-bold border border-emerald-200 transition shadow-xs self-start sm:self-auto shrink-0"
            title="匯出供應商名冊為 CSV 檔案"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>匯出 CSV</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative pt-2 border-t border-indigo-100">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-4.5" />
          <input
            type="text"
            placeholder="搜尋供應商編號、名稱、聯絡人或類別..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:border-indigo-500 outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuppliers.map((sup) => (
          <div key={sup.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition space-y-3">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                  {sup.id}
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">{sup.name}</h3>
              </div>

              <div className="flex items-center gap-1 text-amber-800 font-extrabold text-xs bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{sup.rating.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>窗口：<b className="text-slate-900 font-bold">{sup.contactPerson}</b> ({sup.phone})</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-700 font-semibold">{sup.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>平均採購交期 (Lead Time)：<b className="text-indigo-700 font-mono font-bold">{sup.leadTimeDays} 天</b></span>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span className="text-slate-600">{sup.address}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
              {sup.categories.map((cat) => (
                <span key={cat} className="px-2 py-0.5 bg-indigo-50 text-indigo-800 font-bold rounded-lg text-[11px] border border-indigo-100">
                  {cat}
                </span>
              ))}
            </div>

            {sup.notes && (
              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                "{sup.notes}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
