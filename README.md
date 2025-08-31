# TravelGuide (MVP scaffold)

フロントエンドのみ（Vite + React のSPA）で構成されています。バックエンド実装は未決定のため含めていません。

## ワークスペース

```
.
├─ src/       # React + TS
├─ docs/
│  └─ sow.md
├─ index.html
├─ vite.config.ts
└─ tsconfig.json
```

## セットアップ

1) 依存関係のインストール（ルートで実行）

```
npm i
```

2) 開発サーバ起動

- `npm run dev`

http://localhost:5173 にアクセス。

## 次のステップ

- Web: アップロードUI、EXIF抽出、確認UIの実装
- API: 実装方針が決まり次第スキャフォールド（現状は未定）
- PDF: 実装方針（クライアント/サーバ）決定後に対応
