export type ToolingCategory = 
  | '繞線模具' // Winding Molds
  | '成型模具' // Molding / Pressing Dies
  | '點膠治具' // Dispensing / Sintering Fixtures
  | '測試治具'; // Test Fixtures

export type ToolingStatus = 
  | '在庫' // In Stock
  | '使用中' // In Use
  | '保養中' // Maintenance
  | '待修繕' // Needs Repair
  | '報廢'; // Scrapped

export type TransactionType = 
  | '入庫'
  | '領用'
  | '歸還'
  | '保養發起'
  | '維護完成'
  | '報廢';

export type MaintenanceType = 
  | '定期保養' // PM
  | '異常修繕' // RM
  | '首件檢驗' // FAI
  | '年度大修'; // Overhaul

export interface ToolingItem {
  id: string; // e.g. "TL-WIND-001"
  name: string; // e.g. "高頻功率電感 0603 繞線模具 A組"
  category: ToolingCategory;
  specification: string; // e.g. "適於 0.08mm 漆包線, 12 Pin"
  location: string; // e.g. "A區-02架-3層"
  status: ToolingStatus;
  currentStrokes: number; // 目前累積沖壓/使用次數 (或時數)
  maxStrokes: number; // 總壽命上限 (沖數/小時)
  maintenanceInterval: number; // 保養週期 (例如每 50,000 次保養一次)
  lastMaintenanceStrokes: number; // 上次保養時的累積沖數
  lastMaintenanceDate: string; // YYYY-MM-DD
  safetyStock: number; // 安全庫存量
  supplierId: string;
  purchaseDate: string;
  unitCost: number; // TWD
  qrCodeUrl?: string;
  currentUser?: string; // 領用人員
  currentMachine?: string; // 目前掛載機台, e.g. "成型 3 號機"
  notes?: string;
}

export interface TransactionRecord {
  id: string; // e.g. "TXN-20260805-001"
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  toolingId: string;
  toolingName: string;
  type: TransactionType;
  operator: string; // 作業人員 / 員工編號
  machineOrLine?: string; // 產線 / 機台
  deltaStrokes?: number; // 本次新增沖次
  resultingStrokes: number; // 異動後總累積沖數
  previousStatus: ToolingStatus;
  newStatus: ToolingStatus;
  notes?: string;
}

export interface MaintenanceRecord {
  id: string; // e.g. "MNT-20260805-01"
  maintenanceDate: string; // YYYY-MM-DD
  toolingId: string;
  toolingName: string;
  type: MaintenanceType;
  performedBy: string; // 維修技師 / 廠商
  triggerReason: string; // e.g. "達到週期 50,000 次" / "繞線張力異常線徑變形"
  actionTaken: string; // e.g. "更換磨損導線針、研磨導頭、重新校正"
  replacedParts?: string;
  cost: number; // 維修成本 TWD
  strokesAtMaintenance: number;
  nextMaintenanceTarget: number; // 下次預警沖次
  resultStatus: '通過' | '待覆驗' | '退件';
  notes?: string;
}

export interface SupplierItem {
  id: string; // e.g. "SUP-001"
  name: string; // e.g. "精密模具科技股份有限公司"
  contactPerson: string;
  phone: string;
  email: string;
  leadTimeDays: number; // 採購交期 (天)
  address: string;
  categories: ToolingCategory[];
  rating: number; // 1-5 顆星
  notes?: string;
}

export interface SchemaField {
  columnLetter: string;
  fieldName: string;
  fieldLabel: string;
  dataType: 'String' | 'Number' | 'Date' | 'DateTime' | 'Enum' | 'Formula' | 'Boolean';
  required: boolean;
  exampleValue: string;
  description: string;
}

export interface SchemaTable {
  tabName: string;
  tabLabel: string;
  description: string;
  fields: SchemaField[];
}

export interface AlertThresholdConfig {
  warningPercentage: number; // default 80%
  criticalPercentage: number; // default 95%
  alertEmail: string;
  autoFormatCells: boolean;
}
