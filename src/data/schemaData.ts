import { SchemaTable } from '../types';

export const GOOGLE_SHEET_SCHEMAS: SchemaTable[] = [
  {
    tabName: 'Tooling_Master',
    tabLabel: '模治具主檔',
    description: '記錄全廠所有模具與治具之基本規格、庫位、累積壽命、保養狀態與領用機台等核心資料。',
    fields: [
      {
        columnLetter: 'A',
        fieldName: 'tooling_id',
        fieldLabel: '模治具編號',
        dataType: 'String',
        required: true,
        exampleValue: 'TL-WND-001',
        description: '主鍵唯一編號，作為條碼/QR Code 識別碼 (例如: TL-WND-xxx, TL-MOLD-xxx)'
      },
      {
        columnLetter: 'B',
        fieldName: 'tooling_name',
        fieldLabel: '模治具名稱',
        dataType: 'String',
        required: true,
        exampleValue: '微型一體成型電感 0402 扁平線繞線模組 A套',
        description: '模治具完整中文名稱'
      },
      {
        columnLetter: 'C',
        fieldName: 'category',
        fieldLabel: '分類',
        dataType: 'Enum',
        required: true,
        exampleValue: '繞線模具',
        description: '可選：繞線模具 / 成型模具 / 點膠治具 / 測試治具'
      },
      {
        columnLetter: 'D',
        fieldName: 'specification',
        fieldLabel: '規格描述',
        dataType: 'String',
        required: false,
        exampleValue: '適線徑 0.05-0.12mm, 12-Slot, 超硬鎢鋼心軸',
        description: '模具技術規格、穴數、線徑、適用磁芯尺寸等'
      },
      {
        columnLetter: 'E',
        fieldName: 'location',
        fieldLabel: '存放位置/庫位',
        dataType: 'String',
        required: true,
        exampleValue: 'A區-01架-2層',
        description: '架位編號或無塵室存放位置'
      },
      {
        columnLetter: 'F',
        fieldName: 'status',
        fieldLabel: '目前狀態',
        dataType: 'Enum',
        required: true,
        exampleValue: '使用中',
        description: '可選：在庫 / 使用中 / 保養中 / 待修繕 / 報廢'
      },
      {
        columnLetter: 'G',
        fieldName: 'current_strokes',
        fieldLabel: '目前累積次數/時數',
        dataType: 'Number',
        required: true,
        exampleValue: '412000',
        description: '自投入使用以來累積之沖壓次數、繞線迴數或使用時數'
      },
      {
        columnLetter: 'H',
        fieldName: 'max_strokes',
        fieldLabel: '總壽命上限',
        dataType: 'Number',
        required: true,
        exampleValue: '500000',
        description: '模具預期報廢前的最高極限使用次數'
      },
      {
        columnLetter: 'I',
        fieldName: 'usage_rate',
        fieldLabel: '壽命消耗率(%)',
        dataType: 'Formula',
        required: true,
        exampleValue: '82.4%',
        description: 'Google Sheet 試算表公式 `=G2/H2` (用於條件式格式自動標註顏色)'
      },
      {
        columnLetter: 'J',
        fieldName: 'maintenance_interval',
        fieldLabel: '保養週期次數',
        dataType: 'Number',
        required: true,
        exampleValue: '100000',
        description: '每隔多少次使用次數即需進行一次定期保養'
      },
      {
        columnLetter: 'K',
        fieldName: 'last_maintenance_strokes',
        fieldLabel: '上次保養時累積次數',
        dataType: 'Number',
        required: true,
        exampleValue: '400000',
        description: '最近一次完成 PM 保養時記錄的累積沖數'
      },
      {
        columnLetter: 'L',
        fieldName: 'last_maintenance_date',
        fieldLabel: '上次保養日期',
        dataType: 'Date',
        required: false,
        exampleValue: '2026-07-15',
        description: 'Format: YYYY-MM-DD'
      },
      {
        columnLetter: 'M',
        fieldName: 'next_maintenance_target',
        fieldLabel: '下次保養目標沖數',
        dataType: 'Formula',
        required: true,
        exampleValue: '500000',
        description: 'Google Sheet 試算表公式 `=K2+J2` (GAS 觸發預警之判斷依據)'
      },
      {
        columnLetter: 'N',
        fieldName: 'safety_stock',
        fieldLabel: '安全庫存量',
        dataType: 'Number',
        required: true,
        exampleValue: '2',
        description: '同規格備用模治具之最少庫存警戒數量'
      },
      {
        columnLetter: 'O',
        fieldName: 'current_user',
        fieldLabel: '目前領用人',
        dataType: 'String',
        required: false,
        exampleValue: 'EMP-2045 (陳工程師)',
        description: '當狀態為「使用中」或「保養中」時寫入負責人員'
      },
      {
        columnLetter: 'P',
        fieldName: 'current_machine',
        fieldLabel: '掛載機台/產線',
        dataType: 'String',
        required: false,
        exampleValue: '自動繞線 02 號機 (Line A1)',
        description: '記錄當前架設之生產機器或線別'
      },
      {
        columnLetter: 'Q',
        fieldName: 'supplier_id',
        fieldLabel: '供應商編號',
        dataType: 'String',
        required: true,
        exampleValue: 'SUP-002',
        description: '對應 Supplier_Info 之主鍵 ID'
      },
      {
        columnLetter: 'R',
        fieldName: 'unit_cost',
        fieldLabel: '採購單價(TWD)',
        dataType: 'Number',
        required: false,
        exampleValue: '68000',
        description: '模治具原始採購費用'
      },
      {
        columnLetter: 'S',
        fieldName: 'notes',
        fieldLabel: '備註說明',
        dataType: 'String',
        required: false,
        exampleValue: '預估再 88,000 次達到總壽命上限',
        description: '補充說明或異常歷史紀錄'
      }
    ]
  },
  {
    tabName: 'Transaction_Log',
    tabLabel: '異動記錄檔',
    description: '詳實記載每一次入庫、領用出庫、歸還、發起保養、維護完成與報廢的完整流水帳紀錄。',
    fields: [
      {
        columnLetter: 'A',
        fieldName: 'transaction_id',
        fieldLabel: '單號',
        dataType: 'String',
        required: true,
        exampleValue: 'TXN-20260805-001',
        description: '自動生成唯一異動單號 (例如 TXN-YYYYMMDD-xxx)'
      },
      {
        columnLetter: 'B',
        fieldName: 'timestamp',
        fieldLabel: '異動時間',
        dataType: 'DateTime',
        required: true,
        exampleValue: '2026-08-05 09:15:22',
        description: '系統自動記錄 YYYY-MM-DD HH:mm:ss'
      },
      {
        columnLetter: 'C',
        fieldName: 'tooling_id',
        fieldLabel: '模治具編號',
        dataType: 'String',
        required: true,
        exampleValue: 'TL-MOLD-002',
        description: '連動 Tooling_Master tooling_id'
      },
      {
        columnLetter: 'D',
        fieldName: 'tooling_name',
        fieldLabel: '模治具名稱',
        dataType: 'String',
        required: true,
        exampleValue: '大電流功率電感 1004 鐵粉芯壓鑄上/下模組',
        description: '歷史備查快照'
      },
      {
        columnLetter: 'E',
        fieldName: 'transaction_type',
        fieldLabel: '異動類型',
        dataType: 'Enum',
        required: true,
        exampleValue: '保養發起',
        description: '可選：入庫 / 領用 / 歸還 / 保養發起 / 維護完成 / 報廢'
      },
      {
        columnLetter: 'F',
        fieldName: 'operator',
        fieldLabel: '作業人員',
        dataType: 'String',
        required: true,
        exampleValue: 'EMP-1082 (王技師)',
        description: '執行本次操作之人員姓名或工號'
      },
      {
        columnLetter: 'G',
        fieldName: 'machine_or_line',
        fieldLabel: '機台/產線',
        dataType: 'String',
        required: false,
        exampleValue: '成型 3 號機',
        description: '領用投產或歸還拆下之機台編號'
      },
      {
        columnLetter: 'H',
        fieldName: 'delta_strokes',
        fieldLabel: '本次新增沖次/時數',
        dataType: 'Number',
        required: false,
        exampleValue: '12500',
        description: '歸還或保養時，現場機台計數器回報之本趟使用量'
      },
      {
        columnLetter: 'I',
        fieldName: 'resulting_strokes',
        fieldLabel: '異動後累積沖數',
        dataType: 'Number',
        required: true,
        exampleValue: '289500',
        description: '更新後之最新累積沖數（同步回寫 Tooling_Master）'
      },
      {
        columnLetter: 'J',
        fieldName: 'previous_status',
        fieldLabel: '異動前狀態',
        dataType: 'Enum',
        required: true,
        exampleValue: '使用中',
        description: '備查狀態狀態機過渡'
      },
      {
        columnLetter: 'K',
        fieldName: 'new_status',
        fieldLabel: '異動後狀態',
        dataType: 'Enum',
        required: true,
        exampleValue: '保養中',
        description: '異動後最新狀態'
      },
      {
        columnLetter: 'L',
        fieldName: 'notes',
        fieldLabel: '作業備註',
        dataType: 'String',
        required: false,
        exampleValue: '累計沖次 289,500 次（壽命 96.5%），警示系統觸發',
        description: '領用原因、工單單號 WO# 或異常說明'
      }
    ]
  },
  {
    tabName: 'Maintenance_Log',
    tabLabel: '保養維護記錄',
    description: '詳細紀錄模治具之定期保養 (PM) 與異常修繕 (RM) 歷程、換件明細、維修費用與品管驗收結果。',
    fields: [
      {
        columnLetter: 'A',
        fieldName: 'maintenance_id',
        fieldLabel: '維護單號',
        dataType: 'String',
        required: true,
        exampleValue: 'MNT-20260801-01',
        description: '唯一維修保養單號 (例如 MNT-YYYYMMDD-xx)'
      },
      {
        columnLetter: 'B',
        fieldName: 'maintenance_date',
        fieldLabel: '維修保養日期',
        dataType: 'Date',
        required: true,
        exampleValue: '2026-08-01',
        description: '實際執行維保之日期 YYYY-MM-DD'
      },
      {
        columnLetter: 'C',
        fieldName: 'tooling_id',
        fieldLabel: '模治具編號',
        dataType: 'String',
        required: true,
        exampleValue: 'TL-MOLD-002',
        description: '對應模治具主檔 TOOLING_ID'
      },
      {
        columnLetter: 'D',
        fieldName: 'tooling_name',
        fieldLabel: '模治具名稱',
        dataType: 'String',
        required: true,
        exampleValue: '大電流功率電感 1004 鐵粉芯壓鑄上/下模組',
        description: '名稱快照'
      },
      {
        columnLetter: 'E',
        fieldName: 'maintenance_type',
        fieldLabel: '維護類型',
        dataType: 'Enum',
        required: true,
        exampleValue: '定期保養',
        description: '可選：定期保養 (PM) / 異常修繕 (RM) / 首件檢驗 (FAI) / 年度大修'
      },
      {
        columnLetter: 'F',
        fieldName: 'performed_by',
        fieldLabel: '處理人員/廠商',
        dataType: 'String',
        required: true,
        exampleValue: '精誠超硬模具科技 (原廠)',
        description: '廠內維修技師姓名或委外廠商名稱'
      },
      {
        columnLetter: 'G',
        fieldName: 'trigger_reason',
        fieldLabel: '觸發原因',
        dataType: 'String',
        required: true,
        exampleValue: '達 50,000 沖次保養週期與 95% 壽命預警',
        description: '例：壽命預警 / 繞線張力異常線徑變形 / 成型毛邊過大'
      },
      {
        columnLetter: 'H',
        fieldName: 'action_taken',
        fieldLabel: '保養/處置內容',
        dataType: 'String',
        required: true,
        exampleValue: '拆解清光模面壓痕、退鍍拋光、補充抗磨高壓潤滑脂',
        description: '具體研磨、清掃、校正或換件動作記錄'
      },
      {
        columnLetter: 'I',
        fieldName: 'replaced_parts',
        fieldLabel: '更換零件明細',
        dataType: 'String',
        required: false,
        exampleValue: '鍍鈦頂針 x4, 導套 x2',
        description: '耗材更換品名與數量'
      },
      {
        columnLetter: 'J',
        fieldName: 'cost',
        fieldLabel: '維護花費金額(TWD)',
        dataType: 'Number',
        required: false,
        exampleValue: '15000',
        description: '外修費用或零件耗材成本總計'
      },
      {
        columnLetter: 'K',
        fieldName: 'strokes_at_maintenance',
        fieldLabel: '保養時累積沖數',
        dataType: 'Number',
        required: true,
        exampleValue: '289500',
        description: '保養當下 Tooling_Master 之 current_strokes'
      },
      {
        columnLetter: 'L',
        fieldName: 'next_maintenance_target',
        fieldLabel: '設定下次預警目標值',
        dataType: 'Number',
        required: true,
        exampleValue: '339500',
        description: '保養完成後寫回 Tooling_Master 更新下次 PM 基準'
      },
      {
        columnLetter: 'M',
        fieldName: 'result_status',
        fieldLabel: '驗收結果',
        dataType: 'Enum',
        required: true,
        exampleValue: '待覆驗',
        description: '可選：通過 / 待覆驗 / 退件'
      },
      {
        columnLetter: 'N',
        fieldName: 'notes',
        fieldLabel: '評估備註',
        dataType: 'String',
        required: false,
        exampleValue: '原廠評估可再延長約 3-5 萬沖次使用壽命',
        description: '後續注意事項'
      }
    ]
  },
  {
    tabName: 'Supplier_Info',
    tabLabel: '供應商/廠商資料',
    description: '管理模治具開模廠商、精磨維修外包商之聯絡管道、採購交期與服務評等。',
    fields: [
      {
        columnLetter: 'A',
        fieldName: 'supplier_id',
        fieldLabel: '供應商編號',
        dataType: 'String',
        required: true,
        exampleValue: 'SUP-001',
        description: '唯一廠商編號主鍵'
      },
      {
        columnLetter: 'B',
        fieldName: 'supplier_name',
        fieldLabel: '廠商名稱',
        dataType: 'String',
        required: true,
        exampleValue: '精誠超硬模具科技 (Cheng Precision Die)',
        description: '公司全稱'
      },
      {
        columnLetter: 'C',
        fieldName: 'contact_person',
        fieldLabel: '聯絡窗口',
        dataType: 'String',
        required: true,
        exampleValue: '張建國 經理',
        description: '業務或技術窗口人員姓名'
      },
      {
        columnLetter: 'D',
        fieldName: 'phone',
        fieldLabel: '聯絡電話',
        dataType: 'String',
        required: true,
        exampleValue: '03-5789123 #102',
        description: '市話或手機'
      },
      {
        columnLetter: 'E',
        fieldName: 'email',
        fieldLabel: '電子郵件',
        dataType: 'String',
        required: true,
        exampleValue: 'sales@cheng-die.com.tw',
        description: '報價與維修通知 Email'
      },
      {
        columnLetter: 'F',
        fieldName: 'lead_time_days',
        fieldLabel: '開模交期(天)',
        dataType: 'Number',
        required: true,
        exampleValue: '14',
        description: '新模開打或重大修繕所需天數'
      },
      {
        columnLetter: 'G',
        fieldName: 'address',
        fieldLabel: '公司地址',
        dataType: 'String',
        required: false,
        exampleValue: '新竹縣竹北市新竹工業區工業一路88號',
        description: '模具交貨與外修收送地址'
      },
      {
        columnLetter: 'H',
        fieldName: 'categories',
        fieldLabel: '專長模具類別',
        dataType: 'String',
        required: false,
        exampleValue: '成型模具, 繞線模具',
        description: '專長技術項目'
      },
      {
        columnLetter: 'I',
        fieldName: 'rating',
        fieldLabel: '服務評等(1-5)',
        dataType: 'Number',
        required: false,
        exampleValue: '4.9',
        description: '年度評鑑分數或星級'
      },
      {
        columnLetter: 'J',
        fieldName: 'notes',
        fieldLabel: '備註評價',
        dataType: 'String',
        required: false,
        exampleValue: '擅長金屬粉末壓鑄超硬鎢鋼模具，壽命高且尺寸穩定',
        description: '廠商實力評語'
      }
    ]
  }
];
