import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for Gemini AI Tooling Diagnostics
  app.post("/api/ai-diagnostic", async (req, res) => {
    try {
      const { tooling } = req.body;
      if (!tooling) {
        return res.status(400).json({ error: "Missing tooling parameter" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          analysis: `【AI 智能模治具診斷報告 - ${tooling.id}】\n\n` +
            `1. 剩餘壽命與風險評估:\n` +
            `- 目前累積次數: ${tooling.currentStrokes?.toLocaleString()} / ${tooling.maxStrokes?.toLocaleString()} 次 (${((tooling.currentStrokes / tooling.maxStrokes) * 100).toFixed(1)}%)\n` +
            `- 類別: ${tooling.category} | 規格: ${tooling.specification}\n\n` +
            `2. 電感專用保養建議:\n` +
            `- 繞線/成型模具建議定期清掃並檢驗鋼材表面硬度與導針磨損狀態。\n` +
            `- 超過 80% 壽命請排程原廠精磨與拋光。`
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `你是一位專業的「電感元件工廠模治具管理與維護專家」。
請針對以下電感模治具資料進行健康診斷，提供殘餘壽命預測、常見電感不良根因分析與預防性保養 (PM) SOP 檢核點：

模具編號: ${tooling.id}
名稱: ${tooling.name}
分類: ${tooling.category}
規格: ${tooling.specification}
狀態: ${tooling.status}
目前累積沖次/迴數: ${tooling.currentStrokes}
總壽命上限: ${tooling.maxStrokes}
保養週期: ${tooling.maintenanceInterval}
上次保養沖次: ${tooling.lastMaintenanceStrokes}
備註/歷史: ${tooling.notes || '無'}

請以簡明專業的條列繁體中文回答：
1. 剩餘可使用壽命 (RUL) 與風險評級 (正常/預警/臨界風險)
2. 針對該電感類別 (繞線/成型/點膠/測試) 可能發生的品質瑕疵 (例如漆包線短路、成型毛邊、LCR接觸電阻漂移)
3. 建議執行的 3 項關鍵保養處置步驟`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
      });

      res.json({ analysis: response.text });
    } catch (err: any) {
      console.error("Gemini AI Diagnostic Error:", err);
      res.status(500).json({ error: err.message || "Internal Server Error" });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
