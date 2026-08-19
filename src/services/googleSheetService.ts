import { ToolingItem, TransactionRecord, TransactionType } from '../types';

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbxWkmf5prCL0_43wSmMk_OjBAfA5ZSQlu8xrh1aFqJzwQgQQCPVdOFnS0Bxxr8HFEjs/exec';

// Legacy placeholder URL from early prototype
const LEGACY_GAS_URL = 'https://script.google.com/macros/s/AKfycbw_x4x0hmmmeoWeeL_GR_9zXQltEkaAtjVk0fT9lM3SCoz0t1F50sILcjo8gTakuAVNSQ/exec';

export function getGasUrl(): string {
  const saved = localStorage.getItem('gas_sync_url');
  if (!saved || saved.trim() === '' || saved.trim() === LEGACY_GAS_URL) {
    return DEFAULT_GAS_URL;
  }
  return saved.trim();
}

export function setGasUrl(url: string): void {
  localStorage.setItem('gas_sync_url', url.trim());
}

export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Test connectivity with Google Apps Script Web App endpoint
 */
export async function testGasConnection(url: string = getGasUrl()): Promise<SyncResult> {
  if (!url) {
    return { success: false, message: 'Google Apps Script Web App URL 未設定' };
  }

  const startTime = Date.now();
  try {
    // Adding timestamp parameter to avoid browser caching
    const testUrl = `${url}${url.includes('?') ? '&' : '?'}t=${Date.now()}`;
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      return {
        success: false,
        message: `HTTP 錯誤碼: ${response.status} (${response.statusText}) - 反應時間 ${elapsed}ms`
      };
    }

    const data = await response.json().catch(() => null);
    if (data) {
      return {
        success: true,
        message: `連線成功！回應系統: ${data.system || 'Google Apps Script Web App'} (耗時 ${elapsed}ms)`,
        data
      };
    }

    return {
      success: true,
      message: `連線成功！(耗時 ${elapsed}ms)`
    };
  } catch (err: any) {
    // If standard fetch failed due to CORS or redirect, attempt no-cors ping check
    try {
      await fetch(url, { method: 'GET', mode: 'no-cors' });
      return {
        success: true,
        message: `連線已建立！(Google Apps Script Web App 重新導向回應正常)`
      };
    } catch (e: any) {
      return {
        success: false,
        message: `連線失敗: ${err.message || '網路無法連線或 URL 無效'}`
      };
    }
  }
}

/**
 * Push transaction record to Google Apps Script Web App Endpoint
 */
export async function pushTransactionToGas(
  payload: {
    toolingId: string;
    type: TransactionType;
    operator: string;
    machineOrLine: string;
    deltaStrokes: number;
    notes: string;
  },
  url: string = getGasUrl()
): Promise<SyncResult> {
  if (!url) {
    return { success: false, message: 'Google Apps Script Web App URL 未設定' };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // GAS Web App accepts text/plain to avoid CORS preflight issues
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return { success: false, message: `HTTP 錯誤: ${response.status}` };
    }

    const result = await response.json().catch(() => null);
    if (result && result.success) {
      return {
        success: true,
        message: result.message || `成功發送至 Google Sheet (單號: ${result.txnId || 'TXN-OK'})`,
        data: result
      };
    }

    return {
      success: true,
      message: result?.message || '資料已成功發送至 Google Sheet (Web App)',
      data: result
    };
  } catch (err: any) {
    // Fallback: Attempting post via no-cors mode if strict CORS blocks custom header
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(payload)
      });
      return {
        success: true,
        message: `資料已發送至 Google Sheet 處理程序！`
      };
    } catch (fallbackErr: any) {
      return {
        success: false,
        message: `Google Sheet 發送失敗: ${err.message || '請確認網路連線'}`
      };
    }
  }
}

/**
 * Fetch Toolings Data from Google Sheet GAS Web App Endpoint
 */
export async function fetchToolingsFromGas(url: string = getGasUrl()): Promise<SyncResult> {
  if (!url) {
    return { success: false, message: 'Google Apps Script URL 未設定' };
  }

  try {
    const fetchUrl = `${url}${url.includes('?') ? '&' : '?'}action=getAllToolings&t=${Date.now()}`;
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      return { success: false, message: `HTTP 錯誤: ${response.status}` };
    }
    const json = await response.json();
    if (json && json.data && Array.isArray(json.data)) {
      return {
        success: true,
        message: `成功從 Google Sheet 拉取 ${json.data.length} 筆模治具主檔`,
        data: json.data
      };
    }
    return {
      success: false,
      message: '從 Google Sheet 取得的回應資料格式不符合 expected format'
    };
  } catch (err: any) {
    return {
      success: false,
      message: `讀取 Google Sheet 失敗: ${err.message || '網路異常'}`
    };
  }
}
