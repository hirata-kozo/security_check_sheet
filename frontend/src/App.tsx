import React, { useState } from "react";
import ChatUI from "./components/ChatUI";
import "./index.css";

function App() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (prompt: string, files: File[], outputFile?: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      files.forEach((file) => formData.append("files", file));
      if (outputFile) {
        formData.append("outputFile", outputFile);
      }

      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content: data.reply || "回答が取得できませんでした。" },
      ]);

      // ダウンロードリンクは自動で新しいタブで開く
      if (data.downloadUrl) {
        window.open(`http://localhost:3001${data.downloadUrl}`, "_blank");
      }

    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "エラーが発生しました。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white p-4 text-center text-2xl font-bold">
        セキュリティチェックシート AI
      </header>
      <main className="p-4">
        <ChatUI messages={messages} onSend={sendMessage} loading={loading} />
      </main>
    </div>
  );
}

export default App;
