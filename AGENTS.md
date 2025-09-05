## プロジェクト構成とモジュール

- ルートSPA: Vite + React + TypeScript。
- 主なパス:
  - `src/` — アプリ本体（`components/`, `hooks/`, `features/`, `utils/` を推奨）。
  - `docs/` — 製品ドキュメント（例: `sow.md`）。
  - `index.html`, `vite.config.ts`, `tsconfig.json` — ビルド/ツール設定。
- UIスタック: Mantine v7（UI）+ Emotion（css prop / styled）。バックエンドは未定（TBD）。

## ビルド・テスト・開発コマンド

- `npm run dev` — 開発サーバ起動（http://localhost:5173）。
- `npm run build` — 本番ビルド（`dist/` 出力）。
- `npm run preview` — ビルド成果物をローカル配信。
- `npm run lint` / `npm run lint:fix` — ESLint 実行 / 自動修正。
- `npm run format` / `npm run format:check` — Prettier 整形 / 差分チェック。

## コーディング規約・命名

- TypeScript strict。拡張子: コンポーネントは `.tsx`、ロジックは `.ts`。
- 命名: コンポーネントは `PascalCase`（例: `UploadDropzone.tsx`）、関数/変数は `camelCase`、フックは `useX`（例: `useExif.ts`）。
- スタイル: Emotion の `css` prop / `styled` を使用可（ESLint で `css` prop を許可済み）。
- 静的解析: PR 前に `npm run lint` 警告0、`npm run format:check` 差分0を維持。
- コンポーネントのpropsの型定義はtypeじゃなくてinterfaceで定義すること
- 基本的にcssを書くときはemotionで書くこと
- any型は極力使わないこと、as anyなどのanyへの型変換も極力使わないこと
- コンポーネント設計は原則atomic designに従うこと
- 関数の戻り値、引数には特に型を書くようにしてください
- eslintやprettierの設定に従うこと
- シングルクォテーションじゃなくダブルクォテーションを使ってください
- コンポーネントの粒度は原則Atomic Designに従うこと

## テストガイドライン

- フレームワーク: 未決定（推奨: Vitest + React Testing Library）。
- 配置/命名: 対象付近に `ComponentName.test.tsx`、または `__tests__/`。
- 対象領域: アップロード、EXIF解析、確認UIなど主要フロー。UIは役割/ラベルで最小限のアクセシビリティ検証。

## コミット・プルリク方針

- コミット: 明確で小さな単位（例: `feat: add upload dropzone`, `fix: handle large videos`）。Conventional Commits を推奨。
- PR: 目的、主要変更点、UIスクリーンショット、動作確認手順、関連Issueのリンクを記載。小さく焦点を絞ること。

## セキュリティと設定

- 秘密情報や `.env` をコミットしない。`.gitignore` を尊重。
- 大容量メディアは避け、必要ならサンプル/モックを使用。
- 依存更新時はセキュリティ影響を確認（`npm audit` の実行を推奨）。

## その他

- 日本語で回答してください
- このプロジェクトの概要はdocs配下に置かれています。ここに書かれている仕様を参考にしてください
