# TravelGuide (MVP scaffold)

フロントエンドのみ（Vite + React のSPA）で構成。UIは Mantine v7、スタイルは Emotion を併用。バックエンドは未決定（TBD）。

## ワークスペース

```
.
├─ src/       # React + TS（Mantine + Emotion）
├─ docs/
│  └─ sow.md
├─ index.html
├─ vite.config.ts
└─ tsconfig.json
```

## セットアップ

1. 依存関係のインストール（ルートで実行）

```
npm i
```

2. 開発サーバ起動

- `npm run dev`

http://localhost:5173 にアクセス。

## 技術スタック（現状）

- フレームワーク: Vite + React + TypeScript
- UIコンポーネント: Mantine v7（`@mantine/core`, `@mantine/hooks`, `@mantine/notifications`, `@mantine/dropzone`）
- スタイリング: Emotion（css prop, styled, Global/Theme は必要時に適用）
- コード品質: ESLint + Prettier（統合済み）

## コード整形（Prettier）

- 実行: `npm run format`（全ファイルを書き換え）
- 確認: `npm run format:check`（差分のみ検出）

## Lint（ESLint + Prettier統合）

- 実行: `npm run lint`（エラーは0件になるまで修正）
- 自動修正: `npm run lint:fix`
- ルール: TypeScript/React/React Hooksを有効化、`eslint-config-prettier`で競合を無効化

補足: Emotionの`css` propを許可するため、ESLintの`react/no-unknown-property`で`css`をignore設定済みです。

## 次のステップ

- Web: アップロードUI、EXIF抽出、確認UIの実装
- API: 実装方針が決まり次第スキャフォールド（現状は未定）
- PDF: 実装方針（クライアント/サーバ）決定後に対応
