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

// uploads フォルダ作成
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// downloads フォルダ作成
const downloadsDir = path.join(__dirname, "../downloads");
if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir, { recursive: true });

// ChatGPT 呼び出し
router.post("/chat", cpUpload, async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt?.trim()) return res.status(400).json({ error: "Prompt is required" });

  try {
    const files = (req.files as Record<string, Express.Multer.File[]>)?.files || [];
    if (files.length > 0) {
      const texts = await Promise.all(files.map(f => fileHandler(f.path, f.mimetype)));
      documentTexts = texts;
      files.forEach(f => fs.unlinkSync(f.path));
    }
    const contextText = documentTexts.join("\n");

    const outputFiles = (req.files as Record<string, Express.Multer.File[]>)?.outputFile;
    let excelContentText = "";
    if (outputFiles?.length) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(outputFiles[0].path);
      workbook.eachSheet(sheet => {
        const rows: string[] = [];
        sheet.eachRow(row => rows.push(row.values.slice(1).join("\t")));
        excelContentText += `Sheet: ${sheet.name}\n` + rows.join("\n") + "\n";
      });
    }

    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "system",
          content: "以下の資料・Excel内容を元に質問に答え、Excelに追記してください:\n" +
                   contextText + "\n" + excelContentText,
        },
        { role: "user", content: prompt },
      ],
    });

    const answer = response.choices[0].message?.content || "";

    let downloadUrl: string | undefined;
    if (outputFiles?.length) {
      const uploadedFile = outputFiles[0];
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(uploadedFile.path);

      let sheet = workbook.getWorksheet("回答") || workbook.addWorksheet("回答");
      sheet.addRow(["質問", "回答"]);
      sheet.addRow([prompt, answer]);

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

      downloadUrl = `/downloads/${outputFileName}`;
    }

    res.json({ reply: answer, downloadUrl });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 静的配信
router.use("/downloads", require("express").static(downloadsDir));

export default router;
