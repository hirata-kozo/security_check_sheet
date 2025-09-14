import React, { useState } from "react";

interface ChatUIProps {
  messages: { role: string; content: string }[];
  onSend: (prompt: string, files: File[], outputFile?: File) => Promise<{ downloadUrl?: string }>;
  loading: boolean;
}

const ChatUI: React.FC<ChatUIProps> = ({ messages, onSend, loading }) => {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [outputFile, setOutputFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setDownloadUrl(null); // 前回リンクをクリア
    const result = await onSend(prompt, files, outputFile || undefined);
    if (result.downloadUrl) setDownloadUrl(result.downloadUrl);

    setPrompt("");
    setFiles([]);
    setOutputFile(null);
  };

  return (
    <div>
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.role}`}>
            <div className="bubble">
              <strong>{msg.role === "user" ? "あなた" : "AI"}:</strong>
              <div className="bubble-text" style={{ whiteSpace: "pre-wrap" }}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant">
            <div className="bubble">
              <div className="spinner"></div>
              <span>問い合わせ中...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="質問を入力してください"
        />

        <div className="form-actions">
          {/* 入力ファイル */}
          <label className="file-label">
            インプット情報ファイルを選択
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              style={{ display: "none" }}
            />
          </label>
          <span>{files.map((f) => f.name).join(", ")}</span>

          {/* 出力Excel */}
          <label className="file-label">
            出力用Excelファイルを指定
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setOutputFile(e.target.files?.[0] || null)}
              style={{ display: "none" }}
            />
          </label>
          <span>{outputFile?.name}</span>

          <button type="submit">送信</button>
        </div>

        {/* ダウンロードリンク */}
        {downloadUrl && (
          <div style={{ marginTop: "8px" }}>
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
              追記済みExcelをダウンロード
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

export default ChatUI;
