import { Global, css } from "@emotion/react";

export const GlobalStyles = () => (
  <Global
    styles={css`
      :root {
        --rounded-label-font: "M PLUS Rounded 1c", "Hiragino Kaku Gothic ProN", "Noto Sans JP",
          system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial,
          "Apple Color Emoji", "Segoe UI Emoji";
      }

      /* アプリ全体の基本フォント */
      html, body, #root {
        font-family: var(--rounded-label-font);
        font-weight: 500;
        letter-spacing: 0.2px;
      }

      /* ボタンのラベルはやや強調 */
      .mantine-Button-label {
        font-family: var(--rounded-label-font);
        font-weight: 700;
        letter-spacing: 0.2px;
      }

      /* 入力テキストにわずかに字間を付与 */
      .mantine-Input-input,
      .mantine-Textarea-input,
      .mantine-Select-input,
      .mantine-DateInput-input {
        letter-spacing: 0.2px;
      }

      /* フォームのラベル類を丸ゴ系に */
      .mantine-InputWrapper-label,
      .mantine-Input-label,
      .mantine-Checkbox-label,
      .mantine-Radio-label,
      .mantine-Switch-label {
        font-family: var(--rounded-label-font);
        font-weight: 500;
        letter-spacing: 0.2px;
      }
    `}
  />
);

