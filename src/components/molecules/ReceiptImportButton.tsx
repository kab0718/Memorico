import { useRef } from "react";
import { Button } from "@mantine/core";

interface Props {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

export const ReceiptImportButton = ({ onSelect, disabled = false }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = (): void => {
    if (disabled) {
      return;
    }
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.currentTarget.files?.[0] || null;
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      e.currentTarget.value = "";
      return;
    }
    onSelect(file);
    // 同じファイルを再選択できるようにリセット
    e.currentTarget.value = "";
  };

  return (
    <>
      <Button variant="light" onClick={handleClick} disabled={disabled}>
        レシート読み込み
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </>
  );
};
