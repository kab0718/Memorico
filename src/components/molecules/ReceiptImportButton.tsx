import { useRef } from "react";
import { Button } from "@mantine/core";

interface Props {
  onSelect: (file: File) => void;
}

export const ReceiptImportButton = ({ onSelect }: Props) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleClick = (): void => {
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
      <Button variant="light" onClick={handleClick}>
        レシート読込
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
