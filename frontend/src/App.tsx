import React, { useState } from "react";
import ChatUI from "./components/ChatUI";
import "./App.css";

function App() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (prompt: string, files: File[], outputFile?: File) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("prompt", prompt);
      files.forEach(file => formData.append("files", file));
      if (outputFile) formData.append("outputFile", outputFile);

      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        { role: "user", content: prompt },
        { role: "assistant", content: data.reply || "回答が取得できませんでした。" },
      ]);

      // バックエンドでExcel保存した場合、通知
      if (data.downloadUrl) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: `回答をExcelファイルに保存しました。自動でダウンロードを開始します。` },
        ]);

        // 自動ダウンロードを別タブで実行
        window.open(`http://localhost:3001${data.downloadUrl}`, "_blank");
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "エラーが発生しました。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>セキュリティチェックシート AI</h1>
      <ChatUI messages={messages} onSend={sendMessage} loading={loading} />
    </div>
  );
}

export default App;
