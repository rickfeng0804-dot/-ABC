export interface SopSection {
  title: string;
  subtitle: string;
  steps: {
    num: string;
    stepName: string;
    content: string;
    highlight?: string;
  }[];
}

export const FACTORY_SOP_SECTIONS: SopSection[] = [
  {
    title: '現場作業員（平板 / 藍芽條碼槍）優化建議',
    subtitle: '為工廠車間量身打造之高效率、零誤刷掃碼異動流程',
    steps: [
      {
        num: '01',
        stepName: '條碼 / QR Code 一維與二維碼貼標規範',
        content: '建議每一組繞線模、壓鑄模或測試治具本體皆以鐳雕 (Laser Marking) 或金屬抗油污銘牌附上 QR Code（包含 tooling_id 例如 TL-WND-001），庫位架上也貼上庫位 Barcode。',
        highlight: '鐳雕貼標抗油污、耐高溫燒結與超音波清洗，確保 3 年以上清晰可讀。'
      },
      {
        num: '02',
        stepName: '無線藍芽條碼槍 (HID Mode) 或 平板鏡頭掃碼',
        content: '現場領用員持 Android/iOS 平板開啟本系統（或 AppSheet App），只需按下「掃碼領用」，以相機鏡頭對準模具標籤即可自動讀取 ID，完全免除手動輸入誤打欄位的風險。',
        highlight: '平均領用/歸還耗時由 3 分鐘縮短至 5 秒鐘！'
      },
      {
        num: '03',
        stepName: '機台計數器 (Counter) 一鍵抄錄歸還',
        content: '歸還時只需輸入機台產線顯示之本次生產數量（例如新增 15,000 沖次），系統自動在後端計算累積沖數 `= 原沖數 + 本次沖數` 並進行門檻檢核。',
        highlight: '若歸還後沖數觸發 80% 預警，系統立即跳出提示音，指導作業員將該模具擺放至「待保養區」。'
      }
    ]
  },
  {
    title: 'AppSheet 免程式碼行動化 App 無縫擴充建議',
    subtitle: '利用 Google 原生 AppSheet 連結 Google Sheet 資料庫',
    steps: [
      {
        num: '01',
        stepName: '一鍵導入 Sheet 轉化為原生 Mobile App',
        content: '開啟 Google Sheet，點選上方功能列「擴充功能」->「AppSheet」->「建立應用程式」。系統將自動掃描 Tooling_Master, Transaction_Log, Maintenance_Log 等工作表並建置手機介面。',
        highlight: '完全免費且原廠支援，作業員在 iPad 或 Android 手持終端上即可原生操作。'
      },
      {
        num: '02',
        stepName: '設定照片拍照存證與電子簽章 (Signature)',
        content: '在 AppSheet 的 Maintenance_Log 表單中開拍照上傳與技師簽署功能。模具保養完成或修繕退件時，技師可以拍照存證（拍攝模面拋光後狀態、導針更換品），以備 QA 查驗。',
        highlight: '落實電感車規級 (AEC-Q200) 品管溯源要求！'
      },
      {
        num: '03',
        stepName: '推播通知 (Push Notification) 設定',
        content: '在 AppSheet 建立 Automation Bot。當 Tooling_Master 的 usage_rate 大於 0.90 時，自動發送手機 App 推播至設備工程師手機，即時性高於 Email 郵件。',
        highlight: '零遺漏任何臨界磨損模具，防止壞模投產導致批次性電感不良。'
      }
    ]
  },
  {
    title: '電感元件模治具預防性保養 (PM) 標準 SOP',
    subtitle: '針對繞線、壓鑄成型、點膠與高頻測試治具之專用維護週期',
    steps: [
      {
        num: '01',
        stepName: '繞線模具 (Winding Molds)',
        content: '每 50,000 - 100,000 迴數需進行導線溝槽超音波去油污清洗、檢查張力簧衰減率，並使用顯微鏡觀察鎢鋼心軸是否有漆包線刮傷痕跡。',
        highlight: '防止線徑刮傷導致電感短路 (Inter-turn Short) 或 Q 值下降。'
      },
      {
        num: '02',
        stepName: '成型壓鑄模具 (Molding Dies)',
        content: '每 30,000 - 50,000 沖次需拆解檢視金屬粉末加壓腔體，檢查鍍鈦頂針磨損與模面咬模（Galling）現象。必要時送原廠退鍍拋光與重新鍍鈦。',
        highlight: '確保一體成型電感外觀無毛邊、密度均勻且感值 (L) 尺寸公差在 +/- 3% 內。'
      },
      {
        num: '03',
        stepName: '測試治具 (LCR / DCR Fixtures)',
        content: '每 20,000 次點測需使用標準件阻抗開路/短路校正，檢測金針彈力與表面氧化狀態，電阻差 > 0.5 mΩ 即安排更換探針。',
        highlight: '防止測試誤判 (False Alarm) 導致良率虛低。'
      }
    ]
  }
];
