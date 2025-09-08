import { Global, css } from "@emotion/react";

export const GlobalStyles = () => (
  <Global
    styles={css`
      :root {
        --rounded-label-font:
          "M PLUS Rounded 1c", "Hiragino Kaku Gothic ProN", "Noto Sans JP", system-ui,
          -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Apple Color Emoji",
          "Segoe UI Emoji";
      }

      /* アプリ全体の基本フォント */
      html,
      body,
      #root {
        font-family: var(--rounded-label-font);
        font-weight: 500;
        letter-spacing: 0.2px;
        /* 画面幅に応じて本文サイズを流体的に調整（より小さめの最小値） */
        font-size: clamp(14px, 0.55vw + 12px, 17px);
      }

      body {
        line-height: 1.65;
      }

      /* ボタンのラベルはやや強調 */
      .mantine-Button-label {
        font-family: var(--rounded-label-font);
        font-weight: 700;
        letter-spacing: 0.2px;
      }

      /* MantineのTextも明示しておく */
      .mantine-Text-root {
        font-family: var(--rounded-label-font);
      }

      /* 入力テキストにわずかに字間を付与 */
      .mantine-Input-input,
      .mantine-Textarea-input,
      .mantine-DateInput-input {
        letter-spacing: 0.2px;
        font-size: clamp(10px, 0.45vw + 10px, 16px);
        line-height: 1.6;
      }

      /* フォームのラベル類を丸ゴ系に */
      .mantine-InputWrapper-label,
      .mantine-Input-label,
      .mantine-Checkbox-label {
        font-family: var(--rounded-label-font);
        font-weight: 500;
        letter-spacing: 0.2px;
        font-size: clamp(12px, 0.35vw + 11px, 14px);
      }

      /* 日付関連（カレンダー/ポップオーバー）のフォントも統一 */
      .mantine-Calendar-root,
      .mantine-Calendar-root *,
      .mantine-DatesProvider {
        font-family: var(--rounded-label-font);
      }

      /* 見出し（Mantine Title）を流体スケールに */
      .mantine-Title-root[data-order="3"] {
        font-size: clamp(16px, 0.8vw + 16px, 20px);
        line-height: 1.35;
        font-weight: 700;
      }
      .mantine-Title-root[data-order="4"] {
        font-size: clamp(15px, 0.7vw + 14px, 18px);
        line-height: 1.4;
        font-weight: 700;
      }

      /* Mantine Text の size 属性に対応した流体スケール */
      .mantine-Text-root[data-size="xs"] {
        font-size: clamp(12px, 0.35vw + 10.5px, 13.5px);
      }
      .mantine-Text-root[data-size="sm"] {
        font-size: clamp(13px, 0.4vw + 11.5px, 14.5px);
      }
    `}
  />
);
