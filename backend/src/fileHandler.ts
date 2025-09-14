import fs from "fs";
import pdfParse from "pdf-parse";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import pptxParser from "node-pptx-parser"; // npm install node-pptx-parser

/**
 * アップロードされたファイルからテキストを抽出
 * @param path ファイルパス
 * @param mimetype MIMEタイプ
 * @returns ファイルのテキスト内容
 */
export async function fileHandler(path: string, mimetype: string): Promise<string> {
  try {
    switch (mimetype) {
      case "application/pdf": {
        const pdfData = fs.readFileSync(path);
        const pdfResult = await pdfParse(pdfData);
        return pdfResult.text;
      }

      case "text/plain":
        return fs.readFileSync(path, "utf-8");

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
        // docxファイルをテキストに変換
        const result = await mammoth.extractRawText({ path });
        return result.value;
      }

      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        // Excelファイルをテキストに変換
        const workbook = XLSX.readFile(path);
        const sheetNames = workbook.SheetNames;
        const texts: string[] = [];

        sheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const sheetText = XLSX.utils.sheet_to_csv(sheet);
          texts.push(sheetText);
        });

        return texts.join("\n");
      }

      case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      case "application/vnd.ms-powerpoint": {
        // PPTXファイルをテキストに変換
        const pptx = await pptxParser.parse(path);
        const texts = pptx.slides.map((slide: any) => slide.text).join("\n");
        return texts;
      }

      default:
        throw new Error(`Unsupported file type: ${mimetype}`);
    }
  } catch (err) {
    console.error(`fileHandler error for file ${path}:`, err);
    throw err;
  }
}
