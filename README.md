# Security Check Sheet AI

セキュリティチェックシートを ChatGPT に質問・回答させ、Excel に追記できる Web アプリケーションです。  
Docker Compose でフロントエンド・バックエンドを同時に立ち上げることができます。

---

## 機能

- 質問と資料ファイルをアップロードして ChatGPT に問い合わせ
- 回答を Excel ファイルに追記
- 出力 Excel ファイルをブラウザでダウンロード
- PDF、Word（docx）、Excel（xlsx）、PPTX、テキストファイルに対応
- 自動で Excel ファイル名を `output_YYYYMMDDHHmmss.xlsx` として保存

---

## ディレクトリ構成

```
security_check_sheet/
├─ backend/           # Express + TypeScript バックエンド
│  ├─ src/
│  │  ├─ index.ts
│  │  ├─ routes.ts
│  │  └─ fileHandler.ts
│  ├─ Dockerfile.dev
│  └─ .env
├─ frontend/          # React フロントエンド
│  ├─ src/
│  │  ├─ App.tsx
│  │  └─ components/ChatUI.tsx
│  ├─ Dockerfile.dev
│  └─ package.json
├─ docker-compose.yml
└─ README.md
```

---

## 必要環境

- Docker
- Docker Compose
- OpenAI API Key

---

## セットアップ

### 1. リポジトリをクローン

```bash
git clone https://github.com/hirata-kozo/security_check_sheet.git
cd security_check_sheet
```

### 2. バックエンドの環境変数設定

`backend/.env` を作成し、以下を設定:

```env
OPENAI_API_KEY=あなたのOpenAI APIキー
PORT=3001
```

---

## Docker Compose で起動

```bash
docker-compose up --build
```

- フロントエンド: `http://localhost:3000`
- バックエンド: `http://localhost:3001/api`

`downloads` ディレクトリをボリュームとしてマウントしているので、作成された Excel ファイルをホスト側からも参照できます。

---

## 使用方法

1. フロントエンド画面で質問を入力
2. 資料ファイル（PDF、Word、Excel、PPTX など）をアップロード
3. 追記したい Excel ファイルをアップロード（任意）
4. 「送信」をクリック
5. 回答が表示され、Excel が作成されれば自動でブラウザにダウンロードされます

---

## 注意点

- Docker で起動している場合、`/downloads` はコンテナ内で作成されます。ボリュームマウントによりホスト側でもファイルを確認できます。
- Excel ファイル名は自動で `output_YYYYMMDDHHmmss.xlsx` に変更されます。
- フロントエンドは `localhost:3000` に固定しています。必要に応じて `VITE_API_BASE_URL` を変更してください。

---

## ライセンス
MIT