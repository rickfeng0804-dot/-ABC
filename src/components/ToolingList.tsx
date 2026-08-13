import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  QrCode, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  XCircle,
  Building2,
  ChevronRight,
  Sparkles,
  Layers,
  Download
} from 'lucide-react';
import { ToolingItem, ToolingCategory, ToolingStatus } from '../types';
import { downloadCSV } from '../utils/csvExport';

interface ToolingListProps {
  toolings: ToolingItem[];
  onSelectTooling: (tooling: ToolingItem) => void;
  openOperationWizard: (type: '領用' | '歸還' | '保養發起' | '報廢', item?: ToolingItem) => void;
  onAddNewTooling: (tooling: ToolingItem) => void;
  openBarcodeScanner: () => void;
  initialStatusFilter?: string;
  onStatusFilterChange?: (status: string) => void;
}

export const ToolingList: React.FC<ToolingListProps> = ({
  toolings,
  onSelectTooling,
  openOperationWizard,
  onAddNewTooling,
  openBarcodeScanner,
  initialStatusFilter = 'ALL',
  onStatusFilterChange
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatusFilter);
  const [alertOnly, setAlertOnly] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  React.useEffect(() => {
    if (initialStatusFilter) {
      setSelectedStatus(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // New Tooling Form State
  const [newForm, setNewForm] = useState<Partial<ToolingItem>>({
    id: `TL-WND-00${toolings.length + 1}`,
    name: '',
    category: '繞線模具',
    specification: '',
    location: 'A區-01架-1層',
    status: '在庫',
    currentStrokes: 0,
    maxStrokes: 300000,
    maintenanceInterval: 50000,
    lastMaintenanceStrokes: 0,
    lastMaintenanceDate: new Date().toISOString().split('T')[0],
    safetyStock: 2,
    supplierId: 'SUP-001',
    purchaseDate: new Date().toISOString().split('T')[0],
    unitCost: 50000,
    notes: ''
  });

  // Filter logic
  const filteredToolings = toolings.filter((item) => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.specification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.currentUser && item.currentUser.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesStatus = 
      selectedStatus === 'ALL' || 
      item.status === selectedStatus || 
      (selectedStatus === '維護中' && (item.status === '保養中' || item.status === '待修繕'));
    
    const usageRatio = item.currentStrokes / item.maxStrokes;
    const isMntDue = item.currentStrokes >= (item.lastMaintenanceStrokes + item.maintenanceInterval);
    const matchesAlert = !alertOnly || (usageRatio >= 0.8 || isMntDue);

    return matchesSearch && matchesCategory && matchesStatus && matchesAlert;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.id || !newForm.name) return;

    const newItem: ToolingItem = {
      id: newForm.id!,
      name: newForm.name!,
      category: newForm.category as ToolingCategory,
      specification: newForm.specification || '',
      location: newForm.location || 'A區-01架-1層',
      status: newForm.status as ToolingStatus || '在庫',
      currentStrokes: Number(newForm.currentStrokes) || 0,
      maxStrokes: Number(newForm.maxStrokes) || 300000,
      maintenanceInterval: Number(newForm.maintenanceInterval) || 50000,
      lastMaintenanceStrokes: Number(newForm.lastMaintenanceStrokes) || 0,
      lastMaintenanceDate: newForm.lastMaintenanceDate || new Date().toISOString().split('T')[0],
      safetyStock: Number(newForm.safetyStock) || 2,
      supplierId: newForm.supplierId || 'SUP-001',
      purchaseDate: newForm.purchaseDate || new Date().toISOString().split('T')[0],
      unitCost: Number(newForm.unitCost) || 50000,
      notes: newForm.notes || ''
    };

    onAddNewTooling(newItem);
    setShowAddModal(false);
  };

  const handleExportCSV = () => {
    const headers = [
      '模治具編號',
      '模治具名稱',
      '模具類別',
      '圖號規格',
      '存放架位',
      '目前狀態',
      '累積沖次',
      '壽命上限沖次',
      '保養週期沖次',
      '上次保養沖次',
      '上次保養日期',
      '開模/維修供應商',
      '當前領用人',
      '當前掛載機台',
      '備註'
    ];

    const rows = filteredToolings.map(item => [
      item.id,
      item.name,
      item.category,
      item.specification || '',
      item.location,
      item.status,
      item.currentStrokes,
      item.maxStrokes,
      item.maintenanceInterval,
      item.lastMaintenanceStrokes,
      item.lastMaintenanceDate,
      item.supplierId,
      item.currentUser || '',
      item.currentMachine || '',
      item.notes || ''
    ]);

    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`Tooling_Master_${dateStr}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Search & Action Bar - Bento Card */}
      <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-400" />
              <span>模治具主檔 (Tooling Master Stock)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              維護全廠模治具基礎規格、極限壽命、保養週期門檻與架位即時動向
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 text-emerald-400 hover:bg-slate-800 text-xs font-semibold border border-slate-800 transition shadow-sm"
              title="匯出當前篩選之模治具主檔清單為 CSV 檔案"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>匯出 CSV</span>
            </button>

            <button
              onClick={openBarcodeScanner}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 text-blue-400 hover:bg-slate-800 text-xs font-semibold border border-slate-800 transition"
            >
              <QrCode className="w-4 h-4 text-blue-400" />
              <span>現場平板掃條碼</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition shadow-md shadow-blue-900/20"
            >
              <Plus className="w-4 h-4" />
              <span>新增模治具主檔</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="搜尋編號、名稱、規格或領用人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-blue-500 outline-none"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-blue-500 outline-none"
          >
            <option value="ALL">所有分類 (All Categories)</option>
            <option value="繞線模具">繞線模具 (Winding Molds)</option>
            <option value="成型模具">成型模具 (Molding Dies)</option>
            <option value="點膠治具">點膠治具 (Dispensing)</option>
            <option value="測試治具">測試治具 (Test Fixtures)</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              if (onStatusFilterChange) onStatusFilterChange(e.target.value);
            }}
            className="w-full py-1.5 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:border-blue-500 outline-none font-medium"
          >
            <option value="ALL">所有狀態 (All Status)</option>
            <option value="在庫">在庫 (In Stock)</option>
            <option value="使用中">使用中 (In Use)</option>
            <option value="維護中">維護中 (保養/待修繕)</option>
            <option value="保養中">保養中 (Maintenance)</option>
            <option value="待修繕">待修繕 (Needs Repair)</option>
            <option value="報廢">報廢 (Scrapped)</option>
          </select>

          {/* Alert Toggle */}
          <button
            onClick={() => setAlertOnly(!alertOnly)}
            className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              alertOnly
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <AlertTriangle className={`w-4 h-4 ${alertOnly ? 'text-orange-400' : 'text-slate-500'}`} />
            <span>{alertOnly ? '已篩選：僅顯示預警件' : '只看 80%+ 預警件'}</span>
          </button>
        </div>
      </div>

      {/* Tooling Bento Table */}
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">UID / TOOL NAME</th>
                <th className="py-3.5 px-3">CATEGORY</th>
                <th className="py-3.5 px-3">STATUS / LOCATION</th>
                <th className="py-3.5 px-4">USAGE LIFE %</th>
                <th className="py-3.5 px-3">USER / MACHINE</th>
                <th className="py-3.5 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredToolings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    查無符合條件之模治具資料
                  </td>
                </tr>
              ) : (
                filteredToolings.map((item) => {
                  const usageRatio = (item.currentStrokes / item.maxStrokes) * 100;
                  const isCritical = usageRatio >= 95;
                  const isWarning = usageRatio >= 80;
                  const isMntDue = item.currentStrokes >= (item.lastMaintenanceStrokes + item.maintenanceInterval);

                  return (
                    <tr 
                      key={item.id}
                      className={`hover:bg-slate-800/40 transition cursor-pointer ${
                        isCritical ? 'bg-red-950/10' : isWarning ? 'bg-orange-950/10' : ''
                      }`}
                      onClick={() => onSelectTooling(item)}
                    >
                      {/* ID & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            {item.id}
                          </span>
                          {isCritical && (
                            <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 animate-pulse">
                              95% CRITICAL
                            </span>
                          )}
                          {isWarning && !isCritical && (
                            <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
                              80% WARN
                            </span>
                          )}
                          {isMntDue && (
                            <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                              PM DUE
                            </span>
                          )}
                        </div>
                        <div className="font-semibold text-white mt-1 line-clamp-1">{item.name}</div>
                        <div className="text-slate-400 text-[11px] line-clamp-1">{item.specification}</div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 font-medium text-xs border border-slate-800">
                          {item.category}
                        </span>
                      </td>

                      {/* Status & Location */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                          item.status === '在庫' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                          item.status === '使用中' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          item.status === '保養中' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                          item.status === '待修繕' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === '在庫' ? 'bg-blue-400' :
                            item.status === '使用中' ? 'bg-emerald-400' :
                            item.status === '保養中' ? 'bg-orange-400' :
                            item.status === '待修繕' ? 'bg-amber-400' :
                            'bg-red-400'
                          }`}></span>
                          {item.status}
                        </span>
                        <div className="text-slate-400 text-[11px] mt-1 font-mono">📍 {item.location}</div>
                      </td>

                      {/* Lifespan Gauge */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                          <span>{item.currentStrokes.toLocaleString()} / {item.maxStrokes.toLocaleString()}</span>
                          <span className={isCritical ? 'text-red-400 font-bold' : isWarning ? 'text-orange-400 font-bold' : 'text-slate-400'}>
                            {usageRatio.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              isCritical ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(usageRatio, 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          INTERVAL: {item.maintenanceInterval.toLocaleString()}
                        </div>
                      </td>

                      {/* Current User / Machine */}
                      <td className="py-3.5 px-3">
                        {item.currentUser ? (
                          <div>
                            <div className="font-medium text-slate-200 text-xs">{item.currentUser}</div>
                            <div className="text-slate-400 text-[11px]">{item.currentMachine || '無機台'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">（在庫備用）</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status === '在庫' && (
                            <button
                              onClick={() => openOperationWizard('領用', item)}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition shadow-sm"
                            >
                              領用
                            </button>
                          )}
                          {item.status === '使用中' && (
                            <button
                              onClick={() => openOperationWizard('歸還', item)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition shadow-sm"
                            >
                              歸還
                            </button>
                          )}
                          <button
                            onClick={() => openOperationWizard('保養發起', item)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition"
                          >
                            保養
                          </button>
                          <button
                            onClick={() => onSelectTooling(item)}
                            className="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800"
                            title="查看詳細"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Tooling Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-800 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>新增模治具主檔 (Tooling Master Entry)</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">模治具編號 *</label>
                  <input
                    type="text"
                    required
                    value={newForm.id}
                    onChange={(e) => setNewForm({ ...newForm, id: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white focus:border-blue-500 outline-none"
                    placeholder="TL-WND-001"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">分類 *</label>
                  <select
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value as ToolingCategory })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-blue-500 outline-none"
                  >
                    <option value="繞線模具">繞線模具 (Winding Mold)</option>
                    <option value="成型模具">成型模具 (Molding Die)</option>
                    <option value="點膠治具">點膠治具 (Dispensing Fixture)</option>
                    <option value="測試治具">測試治具 (Test Fixture)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">模治具完整名稱 *</label>
                  <input
                    type="text"
                    required
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-500 outline-none"
                    placeholder="例如: 功率電感 0603 扁平線繞線心軸組"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">規格描述</label>
                  <input
                    type="text"
                    value={newForm.specification}
                    onChange={(e) => setNewForm({ ...newForm, specification: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-500 outline-none"
                    placeholder="例如: 線徑 0.08mm, 12 Pin, 鎢鋼材質"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">存放架位/庫位 *</label>
                  <input
                    type="text"
                    required
                    value={newForm.location}
                    onChange={(e) => setNewForm({ ...newForm, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-blue-500 outline-none"
                    placeholder="A區-02架-1層"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">預設狀態</label>
                  <select
                    value={newForm.status}
                    onChange={(e) => setNewForm({ ...newForm, status: e.target.value as ToolingStatus })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:border-blue-500 outline-none"
                  >
                    <option value="在庫">在庫 (In Stock)</option>
                    <option value="使用中">使用中 (In Use)</option>
                    <option value="保養中">保養中 (Maintenance)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">總壽命上限 (沖次/小時) *</label>
                  <input
                    type="number"
                    required
                    value={newForm.maxStrokes}
                    onChange={(e) => setNewForm({ ...newForm, maxStrokes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">保養週期 (沖次) *</label>
                  <input
                    type="number"
                    required
                    value={newForm.maintenanceInterval}
                    onChange={(e) => setNewForm({ ...newForm, maintenanceInterval: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-white focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 transition shadow-md shadow-blue-900/30"
                >
                  寫入模治具主檔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
