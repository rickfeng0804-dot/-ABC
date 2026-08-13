import React, { useState, useEffect } from 'react';
import { Navbar, TabType, FontSizeLevel } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ToolingList } from './components/ToolingList';
import { TransactionLogView } from './components/TransactionLogView';
import { MaintenanceLogView } from './components/MaintenanceLogView';
import { SupplierView } from './components/SupplierView';
import { SchemaViewer } from './components/SchemaViewer';
import { GasCodeHub } from './components/GasCodeHub';
import { GuideSection } from './components/GuideSection';
import { OperationWizardModal } from './components/OperationWizardModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { SettingsModal } from './components/SettingsModal';
import { pushTransactionToGas } from './services/googleSheetService';

import { 
  INITIAL_TOOLINGS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_MAINTENANCE_LOGS, 
  INITIAL_SUPPLIERS 
} from './data/mockData';
import { ToolingItem, TransactionRecord, MaintenanceRecord, SupplierItem, TransactionType, MaintenanceType } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Font Size Settings State (Default to 'large' per user request: "字體請放大")
  const [fontSize, setFontSize] = useState<FontSizeLevel>(() => {
    const saved = localStorage.getItem('tms_font_size');
    return (saved as FontSizeLevel) || 'large';
  });

  useEffect(() => {
    localStorage.setItem('tms_font_size', fontSize);
  }, [fontSize]);
  
  // App Core State
  const [toolings, setToolings] = useState<ToolingItem[]>(INITIAL_TOOLINGS);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE_LOGS);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(INITIAL_SUPPLIERS);

  // Modals & Wizard State
  const [selectedTooling, setSelectedTooling] = useState<ToolingItem | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardType, setWizardType] = useState<TransactionType>('領用');
  const [wizardItem, setWizardItem] = useState<ToolingItem | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [toolingStatusFilter, setToolingStatusFilter] = useState<string>('ALL');

  const handleFilterStatusNavigate = (status: string) => {
    setToolingStatusFilter(status);
    setActiveTab('toolings');
  };

  // Alert Count Calculation
  const alertCount = toolings.filter(t => {
    if (t.status === '報廢') return false;
    const ratio = t.currentStrokes / t.maxStrokes;
    const isMntDue = t.currentStrokes >= (t.lastMaintenanceStrokes + t.maintenanceInterval);
    return ratio >= 0.80 || isMntDue;
  }).length;

  const handleOpenWizard = (type: TransactionType, item?: ToolingItem) => {
    setWizardType(type);
    setWizardItem(item || null);
    setWizardOpen(true);
  };

  const handleScanResult = (item: ToolingItem, action: '領用' | '歸還' | '保養發起') => {
    handleOpenWizard(action, item);
  };

  const handleAddNewTooling = (newTooling: ToolingItem) => {
    setToolings(prev => [newTooling, ...prev]);
  };

  const handleSubmitOperation = (
    toolingId: string,
    type: TransactionType,
    operator: string,
    machineOrLine: string,
    deltaStrokes: number,
    notes: string,
    maintenanceInfo?: {
      mntType: MaintenanceType;
      actionTaken: string;
      replacedParts: string;
      cost: number;
    }
  ) => {
    const targetItem = toolings.find(t => t.id === toolingId);
    if (!targetItem) return;

    let newStatus = targetItem.status;
    let newStrokes = targetItem.currentStrokes;
    let newUser = targetItem.currentUser;
    let newMachine = targetItem.currentMachine;

    if (type === '領用') {
      newStatus = '使用中';
      newUser = operator;
      newMachine = machineOrLine;
    } else if (type === '歸還') {
      newStatus = '在庫';
      newStrokes += deltaStrokes;
      newUser = undefined;
      newMachine = undefined;
    } else if (type === '保養發起') {
      newStatus = '保養中';
      newStrokes += deltaStrokes;
    } else if (type === '維護完成') {
      newStatus = '在庫';
    } else if (type === '報廢') {
      newStatus = '報廢';
      newUser = undefined;
      newMachine = undefined;
    }

    // Update Tooling Master
    setToolings(prev => prev.map(t => {
      if (t.id === toolingId) {
        return {
          ...t,
          status: newStatus,
          currentStrokes: newStrokes,
          currentUser: newUser,
          currentMachine: newMachine,
          lastMaintenanceDate: (type === '保養發起' || type === '維護完成') ? new Date().toISOString().split('T')[0] : t.lastMaintenanceDate,
          lastMaintenanceStrokes: (type === '保養發起' || type === '維護完成') ? newStrokes : t.lastMaintenanceStrokes
        };
      }
      return t;
    }));

    // Create Transaction Record
    const newTxn: TransactionRecord = {
      id: `TXN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      toolingId,
      toolingName: targetItem.name,
      type,
      operator,
      machineOrLine,
      deltaStrokes: deltaStrokes > 0 ? deltaStrokes : undefined,
      resultingStrokes: newStrokes,
      previousStatus: targetItem.status,
      newStatus,
      notes
    };
    setTransactions(prev => [newTxn, ...prev]);

    // Create Maintenance Record if applicable
    if (maintenanceInfo) {
      const newMnt: MaintenanceRecord = {
        id: `MNT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
        maintenanceDate: new Date().toISOString().split('T')[0],
        toolingId,
        toolingName: targetItem.name,
        type: maintenanceInfo.mntType,
        performedBy: operator,
        triggerReason: notes || `作業觸發 ${maintenanceInfo.mntType}`,
        actionTaken: maintenanceInfo.actionTaken,
        replacedParts: maintenanceInfo.replacedParts,
        cost: maintenanceInfo.cost,
        strokesAtMaintenance: newStrokes,
        nextMaintenanceTarget: newStrokes + targetItem.maintenanceInterval,
        resultStatus: '通過',
        notes
      };
      setMaintenanceLogs(prev => [newMnt, ...prev]);
    }

    // Auto Push to Google Sheet
    const autoSyncEnabled = localStorage.getItem('tms_auto_sync') !== 'false';
    if (autoSyncEnabled) {
      pushTransactionToGas({
        toolingId,
        type,
        operator,
        machineOrLine,
        deltaStrokes,
        notes
      }).then((res) => {
        if (res.success) {
          setSyncNotice(`✅ 成功即時同步 [${type}] 至 Google Sheet (單號: ${res.data?.txnId || 'TXN-OK'})`);
          setTimeout(() => setSyncNotice(null), 4000);
        }
      });
    }
  };

  const handleSyncToolingsFromSheet = (sheetData: any[]) => {
    if (!Array.isArray(sheetData) || sheetData.length === 0) return;
    
    // Map raw sheet data to ToolingItem array
    const mapped: ToolingItem[] = sheetData.map((row: any, idx: number) => ({
      id: row.tooling_id || row['模治具編號'] || `T-${idx + 1}`,
      name: row.tooling_name || row['模治具名稱'] || `模具 ${idx + 1}`,
      category: row.category || row['模具類別'] || '繞線模具',
      drawingNumber: row.drawing_number || row['圖號'] || 'DWG-000',
      location: row.location || row['存放架位'] || 'A-01-01',
      status: row.status || row['狀態'] || '在庫',
      currentStrokes: Number(row.current_strokes || row['累積使用沖次']) || 0,
      maxStrokes: Number(row.max_strokes || row['壽命上限沖次']) || 1000000,
      initialStrokes: 0,
      maintenanceInterval: Number(row.maintenance_interval || row['保養週期沖次']) || 100000,
      lastMaintenanceStrokes: Number(row.last_maintenance_strokes) || 0,
      lastMaintenanceDate: row.last_maintenance_date || '2026-01-01',
      supplierId: row.supplier_id || 'SUP-001',
      supplierName: row.supplier_name || '原廠供應商',
      currentUser: row.current_user || undefined,
      currentMachine: row.current_machine || undefined,
      purchaseDate: '2025-01-01',
      cost: 50000
    }));

    setToolings(mapped);
    setSyncNotice(`✅ 已從 Google Sheet 載入 ${mapped.length} 筆最新模治具主檔紀錄！`);
    setTimeout(() => setSyncNotice(null), 4000);
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans selection:bg-blue-500 selection:text-white font-scale-${fontSize}`}>
      {/* Sync Toast Notification */}
      {syncNotice && (
        <div className="fixed top-18 right-6 z-50 bg-emerald-900/90 text-emerald-200 border border-emerald-500/40 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold font-mono animate-bounce flex items-center gap-2">
          <span>{syncNotice}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openBarcodeScanner={() => setScannerOpen(true)}
        openSettings={() => setSettingsOpen(true)}
        alertCount={alertCount}
        fontSize={fontSize}
        setFontSize={setFontSize}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            toolings={toolings}
            transactions={transactions}
            onSelectTooling={(t) => {
              setSelectedTooling(t);
              setActiveTab('toolings');
            }}
            openOperationWizard={handleOpenWizard}
            openBarcodeScanner={() => setScannerOpen(true)}
            setActiveTab={setActiveTab}
            onFilterStatusNavigate={handleFilterStatusNavigate}
          />
        )}

        {activeTab === 'toolings' && (
          <ToolingList
            toolings={toolings}
            onSelectTooling={(t) => setSelectedTooling(t)}
            openOperationWizard={handleOpenWizard}
            onAddNewTooling={handleAddNewTooling}
            openBarcodeScanner={() => setScannerOpen(true)}
            initialStatusFilter={toolingStatusFilter}
            onStatusFilterChange={setToolingStatusFilter}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionLogView transactions={transactions} />
        )}

        {activeTab === 'maintenance' && (
          <MaintenanceLogView
            maintenanceLogs={maintenanceLogs}
            toolings={toolings}
            openOperationWizard={handleOpenWizard}
          />
        )}

        {activeTab === 'suppliers' && (
          <SupplierView suppliers={suppliers} />
        )}

        {activeTab === 'schema' && (
          <SchemaViewer />
        )}

        {activeTab === 'gas_code' && (
          <GasCodeHub />
        )}

        {activeTab === 'sop_guide' && (
          <GuideSection />
        )}
      </main>

      {/* Bento Grid Theme Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 sm:px-8 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-slate-400 font-bold">TMS Pro v2.4</span>
            <span className="text-slate-600">|</span>
            <span>SHEET_ID: 1h_8p_Gv..._901</span>
            <span className="text-slate-600">|</span>
            <span>SYNC_LAST: 即時已連線</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-300">DB_CONNECTED: GOOGLE_SHEETS</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="text-slate-400">
              Factory Node: <span className="text-blue-400 font-semibold">KUNSHAN_PLANT_B</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      <OperationWizardModal
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        type={wizardType}
        selectedTooling={wizardItem}
        allToolings={toolings}
        onSubmitOperation={handleSubmitOperation}
      />

      <BarcodeScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        toolings={toolings}
        onScanResult={handleScanResult}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSyncToolingsFromSheet={handleSyncToolingsFromSheet}
      />
    </div>
  );
}
