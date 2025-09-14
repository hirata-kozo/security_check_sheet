import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import ExcelJS from "exceljs";
import { fileHandler } from "./fileHandler";

const router = Router();
const upload = multer({ dest: "uploads/" });
const cpUpload = upload.fields([
  { name: "files", maxCount: 10 },
  { name: "outputFile", maxCount: 1 },
]);

let documentTexts: string[] = [];
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- uploads フォルダの作成 ---
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("uploadsフォルダを作成しました:", uploadsDir);
}

// --- downloads フォルダの作成 ---
const downloadsDir = path.join(__dirname, "../downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
  console.log("downloadsフォルダを作成しました:", downloadsDir);
}

// --- ChatGPT呼び出し ---
router.post("/chat", cpUpload, async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt || prompt.trim() === "")
    return res.status(400).json({ error: "Prompt is required" });

  try {
    // 入力ファイルのテキスト抽出
    const files = (req.files as Record<string, Express.Multer.File[]>)?.files || [];
    if (files.length > 0) {
      const texts = await Promise.all(files.map(f => fileHandler(f.path, f.mimetype)));
      documentTexts = texts;
      files.forEach(f => fs.unlinkSync(f.path));
    }

    const contextText = documentTexts.join("\n");

    // 出力Excelがある場合の既存内容を取得
    let excelContentText = "";
    const outputFiles = (req.files as Record<string, Express.Multer.File[]>)?.outputFile;
    if (outputFiles && outputFiles.length > 0) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(outputFiles[0].path);
      workbook.eachSheet(sheet => {
        const rows: string[] = [];
        sheet.eachRow(row => rows.push(row.values.slice(1).join("\t"))); // row.values[0]はundefined
        excelContentText += `Sheet: ${sheet.name}\n` + rows.join("\n") + "\n";
      });
    }

    // ChatGPTに質問・既存Excel内容を渡す
    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content:
            "以下の資料・Excel内容を元に質問に答え、Excelに追記する形式で指示してください:\n" +
            contextText +
            "\n" +
            excelContentText,
        },
        { role: "user", content: prompt },
      ],
    });

    const answer = response.choices[0].message?.content || "";

    // ChatGPTの回答をExcelに追記
    let downloadUrl: string | undefined;
    if (outputFiles && outputFiles.length > 0) {
      const uploadedFile = outputFiles[0];
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(uploadedFile.path);

      let sheet = workbook.getWorksheet("回答") || workbook.addWorksheet("回答");
      sheet.addRow(["質問", "回答"]);
      sheet.addRow([prompt, answer]);

      // ファイル名を output_YYYYMMDDHHmmss.xlsx に変更
      const now = new Date();
      const YYYY = now.getFullYear();
      const MM = String(now.getMonth() + 1).padStart(2, "0");
      const DD = String(now.getDate()).padStart(2, "0");
      const HH = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      const outputFileName = `output_${YYYY}${MM}${DD}${HH}${mm}${ss}.xlsx`;

      const savedPath = path.join(downloadsDir, outputFileName);
      await workbook.xlsx.writeFile(savedPath);
      fs.unlinkSync(uploadedFile.path);

      downloadUrl = `/downloads/${encodeURIComponent(outputFileName)}`;
    }

    res.json({ reply: answer, downloadUrl });

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Express で downloads 配下を静的配信 ---
router.use("/downloads", require("express").static(downloadsDir));

export default router;
