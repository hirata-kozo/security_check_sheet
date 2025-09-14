import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import chatRoutes from "./routes";

const app = express();

// JSONパース
app.use(express.json());

// CORS許可（開発環境用）
app.use(cors({
  origin: "http://localhost:3000", // フロントエンドURL
  credentials: true,
}));

// uploadsフォルダの存在チェックと作成
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("uploadsフォルダを作成しました:", uploadsDir);
}

// downloadsフォルダの存在チェックと作成
const downloadsDir = path.join(__dirname, "../downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
  console.log("downloadsフォルダを作成しました:", downloadsDir);
}

// downloadsフォルダを静的配信
app.use("/downloads", express.static(downloadsDir));

// ルーティング
app.use("/api", chatRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
