export const GAS_CODE_GS = `/**
 * ============================================================================
 * 電感元件工廠 - 模治具管理系統 (Tooling Management System)
 * Google Apps Script (GAS) 核心自動化與 API 處理核心
 * 版本: v2.4 (2026 Production Edition)
 * 作者: 模治具管理系統架構師 (Factory Automation Architect)
 * ============================================================================
 */

// 全局工作表名稱設定
const TAB_MASTER = "Tooling_Master";
const TAB_TRANSACTION = "Transaction_Log";
const TAB_MAINTENANCE = "Maintenance_Log";
const TAB_SUPPLIER = "Supplier_Info";

// 預設警示 Email (可在 GAS 屬性服務 PropertiesService 覆蓋)
const ALERT_EMAIL = "tooling-alert@yourfactory.com";

/**
 * 1. 壽命與保養自動巡檢警示邏輯 (可設定每日排程觸發器 Time-driven Trigger)
 * 檢測條件：
 *  - 累積壽命消耗率 >= 80% (黃色預警) 或 >= 95% (紅色告警)
 *  - 目前沖數 >= 下次保養目標沖數 (發起 PM 提醒)
 */
function checkToolingLifespanAndAlert() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName(TAB_MASTER);
  if (!masterSheet) {
    Logger.log("錯誤: 找不到 " + TAB_MASTER + " 工作表");
    return;
  }

  const data = masterSheet.getDataRange().getValues();
  if (data.length <= 1) return; // 無資料

  let alertList = [];
  const today = new Date();

  // 遍歷所有模治具列 (第 2 列開始，索引從 1 開始)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const toolingId = row[0]; // Col A: tooling_id
    const name = row[1];      // Col B: tooling_name
    const category = row[2];  // Col C: category
    const status = row[5];    // Col F: status
    const currentStrokes = Number(row[6]) || 0; // Col G: current_strokes
    const maxStrokes = Number(row[7]) || 1;     // Col H: max_strokes
    const lastMntStrokes = Number(row[10]) || 0;// Col K: last_maintenance_strokes
    const mntInterval = Number(row[9]) || 0;   // Col J: maintenance_interval
    
    if (status === "報廢") continue; // 已報廢跳過

    // 計算壽命消耗比例
    const usageRatio = currentStrokes / maxStrokes;
    const nextMntTarget = lastMntStrokes + mntInterval;

    const rowNum = i + 1;
    const rangeRow = masterSheet.getRange(rowNum, 1, 1, 19);

    // 格式與警示判斷
    let isCritical = false;
    let isWarning = false;
    let isMntDue = false;

    if (usageRatio >= 0.95) {
      isCritical = true;
      rangeRow.setBackground("#FEE2E2"); // 淺紅底背景
    } else if (usageRatio >= 0.80) {
      isWarning = true;
      rangeRow.setBackground("#FEF3C7"); // 淺黃底背景
    } else {
      rangeRow.setBackground(i % 2 === 0 ? "#FFFFFF" : "#F9FAFB"); // 恢復標準白/條紋底
    }

    // 保養週期點檢
    if (mntInterval > 0 && currentStrokes >= nextMntTarget) {
      isMntDue = true;
    }

    if (isCritical || isWarning || isMntDue) {
      alertList.push({
        id: toolingId,
        name: name,
        category: category,
        status: status,
        currentStrokes: currentStrokes,
        maxStrokes: maxStrokes,
        ratioPercent: (usageRatio * 100).toFixed(1) + "%",
        isCritical: isCritical,
        isWarning: isWarning,
        isMntDue: isMntDue,
        nextMntTarget: nextMntTarget
      });
    }
  }

  // 若發現警示項目，發送 Email 通知工程師與廠長
  if (alertList.length > 0) {
    sendAlertEmailNotification(alertList);
  }
}

/**
 * 發送模治具預警 Email 郵件通知
 */
function sendAlertEmailNotification(alertList) {
  const recipient = PropertiesService.getScriptProperties().getProperty("ALERT_EMAIL") || ALERT_EMAIL;
  const subject = "【電感廠模治具警示】發現 " + alertList.length + " 項模治具需要關注/保養/更換";

  let htmlBody = "<h2>電感元件工廠 - 模治具壽命與保養巡檢報告</h2>";
  htmlBody += "<p>檢測時間: " + Utilities.formatDate(new Date(), "Asia/Taipei", "yyyy-MM-dd HH:mm:ss") + "</p>";
  htmlBody += "<table border='1' cellpadding='8' cellspacing='0' style='border-collapse:collapse; font-family:sans-serif;'>";
  htmlBody += "<tr style='background-color:#F3F4F6;'><th>編號</th><th>模治具名稱</th><th>類別</th><th>目前沖次</th><th>壽命上限</th><th>消耗率</th><th>警示類型</th></tr>";

  alertList.forEach(function(item) {
    let alertLabel = "";
    let bgColor = "#FFFFFF";

    if (item.isCritical) {
      alertLabel += "<span style='color:red; font-weight:bold;'>[壽命臨界 95%+]</span> ";
      bgColor = "#FEE2E2";
    } else if (item.isWarning) {
      alertLabel += "<span style='color:#D97706; font-weight:bold;'>[壽命預警 80%+]</span> ";
      bgColor = "#FEF3C7";
    }

    if (item.isMntDue) {
      alertLabel += "<span style='color:#2563EB; font-weight:bold;'>[達到保養週期]</span>";
    }

    htmlBody += "<tr style='background-color:" + bgColor + ";'>";
    htmlBody += "<td>" + item.id + "</td>";
    htmlBody += "<td>" + item.name + "</td>";
    htmlBody += "<td>" + item.category + "</td>";
    htmlBody += "<td>" + item.currentStrokes.toLocaleString() + "</td>";
    htmlBody += "<td>" + item.maxStrokes.toLocaleString() + "</td>";
    htmlBody += "<td>" + item.ratioPercent + "</td>";
    htmlBody += "<td>" + alertLabel + "</td>";
    htmlBody += "</tr>";
  });

  htmlBody += "</table>";
  htmlBody += "<p><br/>請儘速至模治具管理系統發起領退保養或開模備採流程。</p>";

  try {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: htmlBody
    });
    Logger.log("成功發送預警 Email 至 " + recipient);
  } catch(e) {
    Logger.log("發送 Email 失敗: " + e.toString());
  }
}

/**
 * 2. 領用/歸還/保養/報廢原子操作 API 函數 (連動 Tooling_Master & Transaction_Log)
 */
function processTransaction(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const masterSheet = ss.getSheetByName(TAB_MASTER);
  const txnSheet = ss.getSheetByName(TAB_TRANSACTION);

  if (!masterSheet || !txnSheet) {
    return { success: false, message: "資料庫工作表不完整" };
  }

  const toolingId = payload.toolingId;
  const txnType = payload.type; // "領用", "歸還", "保養發起", "維護完成", "報廢"
  const operator = payload.operator || "未填寫";
  const machineOrLine = payload.machineOrLine || "";
  const deltaStrokes = Number(payload.deltaStrokes) || 0;
  const notes = payload.notes || "";

  // 尋找 Tooling_Master 中的對應列
  const masterData = masterSheet.getDataRange().getValues();
  let rowIndex = -1;
  let currentItem = null;

  for (let i = 1; i < masterData.length; i++) {
    if (masterData[i][0] === toolingId) {
      rowIndex = i + 1; // 1-indexed for Sheet
      currentItem = masterData[i];
      break;
    }
  }

  if (rowIndex === -1 || !currentItem) {
    return { success: false, message: "找不到模治具編號: " + toolingId };
  }

  const toolingName = currentItem[1];
  const previousStatus = currentItem[5];
  let currentStrokes = Number(currentItem[6]) || 0;
  let newStatus = previousStatus;
  let newLocation = currentItem[4];
  let currentUser = currentItem[14];
  let currentMachine = currentItem[15];

  // 根據異動類型計算與轉移狀態
  if (txnType === "領用") {
    if (previousStatus === "使用中") {
      return { success: false, message: "該模治具已在「使用中」，無法重複領用" };
    }
    if (previousStatus === "保養中" || previousStatus === "報廢") {
      return { success: false, message: "狀態為「" + previousStatus + "」，無法領用" };
    }
    newStatus = "使用中";
    currentUser = operator;
    currentMachine = machineOrLine;
  } else if (txnType === "歸還") {
    newStatus = "在庫";
    currentStrokes += deltaStrokes; // 加算本趟使用沖次
    currentUser = "";
    currentMachine = "";
  } else if (txnType === "保養發起") {
    newStatus = "保養中";
    currentStrokes += deltaStrokes;
    currentUser = operator;
    currentMachine = "維修保養室";
  } else if (txnType === "維護完成") {
    newStatus = "在庫";
    currentUser = "";
    currentMachine = "";
  } else if (txnType === "報廢") {
    newStatus = "報廢";
    currentUser = "";
    currentMachine = "待報廢區";
  }

  // 1. 更新 Tooling_Master
  masterSheet.getRange(rowIndex, 6).setValue(newStatus); // Status
  masterSheet.getRange(rowIndex, 7).setValue(currentStrokes); // current_strokes
  masterSheet.getRange(rowIndex, 15).setValue(currentUser); // current_user
  masterSheet.getRange(rowIndex, 16).setValue(currentMachine); // current_machine

  // 2. 寫入 Transaction_Log 異動紀錄檔
  const txnId = "TXN-" + Utilities.formatDate(new Date(), "Asia/Taipei", "yyyyMMdd") + "-" + Math.floor(100 + Math.random() * 900);
  const nowStr = Utilities.formatDate(new Date(), "Asia/Taipei", "yyyy-MM-dd HH:mm:ss");

  txnSheet.appendRow([
    txnId,
    nowStr,
    toolingId,
    toolingName,
    txnType,
    operator,
    machineOrLine,
    deltaStrokes,
    currentStrokes,
    previousStatus,
    newStatus,
    notes
  ]);

  return {
    success: true,
    txnId: txnId,
    toolingId: toolingId,
    newStatus: newStatus,
    updatedStrokes: currentStrokes,
    message: "成功執行「" + txnType + "」作業！單號: " + txnId
  };
}

/**
 * 3. Web App HTTP GET & POST REST API 介面 (適用於前端網頁、平板、條碼槍與 AppSheet)
 */
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === "getAllToolings") {
    const data = getTableData(TAB_MASTER);
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "getTransactions") {
    const data = getTableData(TAB_TRANSACTION);
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    system: "Inductor Tooling Management System GAS API",
    time: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const result = processTransaction(payload);
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getTableData(tabName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(tabName);
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows[0];
  const result = [];

  for (let i = 1; i < rows.length; i++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = rows[i][j];
    }
    result.push(obj);
  }
  return result;
}
`;
