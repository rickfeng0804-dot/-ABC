import React from 'react';
import { Building2, Phone, Mail, Clock, Star, MapPin } from 'lucide-react';
import { SupplierItem } from '../types';

interface SupplierViewProps {
  suppliers: SupplierItem[];
}

export const SupplierView: React.FC<SupplierViewProps> = ({ suppliers }) => {
  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-lg">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          <span>供應商與開模廠商資料 (Supplier_Info)</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          管理電感繞線心軸、金屬粉末壓鑄超硬模具與 LCR 高頻測試治具開模外送廠商
        </p>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {suppliers.map((sup) => (
          <div key={sup.id} className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-lg hover:border-slate-700 transition space-y-3">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono font-bold text-xs bg-slate-950 text-blue-400 px-2 py-0.5 rounded border border-slate-800">
                  {sup.id}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{sup.name}</h3>
              </div>

              <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{sup.rating.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>窗口：<b className="text-slate-200">{sup.contactPerson}</b> ({sup.phone})</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-slate-300">{sup.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>平均採購交期 (Lead Time)：<b className="text-blue-400 font-mono">{sup.leadTimeDays} 天</b></span>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span className="text-slate-400">{sup.address}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5">
              {sup.categories.map((cat) => (
                <span key={cat} className="px-2 py-0.5 bg-slate-950 text-slate-300 font-medium rounded-lg text-[11px] border border-slate-800">
                  {cat}
                </span>
              ))}
            </div>

            {sup.notes && (
              <p className="text-[11px] text-slate-400 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                "{sup.notes}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
