import React, { useState } from "react";

interface ChatUIProps {
  messages: { role: string; content: string }[];
  onSend: (prompt: string, files: File[], outputFile?: File) => void;
  loading: boolean;
}

const ChatUI: React.FC<ChatUIProps> = ({ messages, onSend, loading }) => {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [outputFile, setOutputFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onSend(prompt, files, outputFile || undefined);
    setPrompt("");
    setFiles([]);
    setOutputFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4">
        {/* 出力用Excelファイル */}
        <label className="inline-block mb-2">
          <span className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700">
            出力用Excelファイルを指定
          </span>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => setOutputFile(e.target.files?.[0] || null)}
            style={{ display: "none" }}
          />
        </label>
        <div className="text-sm text-gray-600">
          {outputFile?.name || "未選択"}
        </div>
      </div>

      <div className="mb-4">
        {/* インプット情報ファイル */}
        <label className="inline-block mb-2">
          <span className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700">
            インプット情報ファイルを選択
          </span>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files || []))}
            style={{ display: "none" }}
          />
        </label>
        <div className="text-sm text-gray-600">
          {files.map((f) => f.name).join(", ") || "未選択"}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full h-32 p-2 border border-gray-300 rounded mb-2 resize-none"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="質問を入力してください"
        />

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={loading || !outputFile}
        >
          {loading ? "問い合わせ中..." : "送信"}
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded ${
              msg.role === "user"
                ? "bg-blue-100 text-blue-900 self-end"
                : "bg-gray-100 text-gray-900 self-start"
            }`}
          >
            <strong>{msg.role === "user" ? "あなた" : "AI"}:</strong>
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="p-2 bg-yellow-100 text-yellow-800 rounded">
            問い合わせ中...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatUI;
