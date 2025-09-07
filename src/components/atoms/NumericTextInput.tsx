import { TextInput, TextInputProps } from "@mantine/core";
import { useEffect, useState } from "react";

interface NumericTextInputProps extends Omit<TextInputProps, "value" | "onChange"> {
  value: number;
  onChange: (v: number) => void;
}

const toHalfWidthDigits = (s: string): string =>
  s.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0));

const extractDigits = (s: string): string => toHalfWidthDigits(s).replace(/[^0-9]/g, "");

// TextInput ベースの数値入力。
// - 全角/半角の数字を受け付け、編集中は入力文字列をそのまま保持
// - onChange は常に数値（または空文字）を親に返す
// - blur 時に表示文字列を半角数字へ正規化
export const NumericTextInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
  ...rest
}: NumericTextInputProps) => {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState<string>(String(value));

  // 親値の変更はフォーカスが外れている時のみ反映
  useEffect(() => {
    if (!focused) {
      setText(String(value));
    }
  }, [value, focused]);

  const handleChange = (raw: string) => {
    setText(raw);
    const digits = extractDigits(raw);
    if (digits.length === 0) {
      onChange(0);
    } else {
      onChange(Number.parseInt(digits, 10));
    }
  };

  return (
    <TextInput
      {...rest}
      value={text}
      inputMode="numeric"
      pattern="[0-9０-９]*"
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onChange={(e) => handleChange(e.currentTarget.value)}
      onBlur={(e) => {
        setFocused(false);
        const normalized = extractDigits(text);
        setText(normalized);
        if (normalized.length === 0) {
          onChange(0);
        } else {
          onChange(Number.parseInt(normalized, 10));
        }
        onBlur?.(e);
      }}
    />
  );
};
