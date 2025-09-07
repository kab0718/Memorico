import { Button, Center, Paper, Stack, Text, Title } from "@mantine/core";
import { css } from "@emotion/react";

export interface GenerateResultProps {
  onRestart: () => void;
  pdfBlob: Blob;
}

export const GenerateResult = ({ onRestart, pdfBlob }: GenerateResultProps) => {
  return (
    <Center h="100vh">
      <Paper withBorder p="lg" radius="md" css={paperStyle}>
        <Stack align="center" gap="sm">
          <Title order={3}>しおりの生成が完了しました</Title>
          <Text c="dimmed">PDFのプレビュー/ダウンロードができます。</Text>
          <Stack gap="xs" w="100%">
            <Button onClick={() => downloadPdf(pdfBlob, "Memorico.pdf")}>PDFをダウンロード</Button>
            <Button onClick={() => openPdf(pdfBlob)}>PDFのプレビュー</Button>
            <Button variant="light" onClick={onRestart}>
              最初からやり直す
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Center>
  );
};

const openPdf = (pdfBlob: Blob): void => {
  // 念のためPDF MIMEを保証
  const blob =
    pdfBlob.type === "application/pdf" ? pdfBlob : new Blob([pdfBlob], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  // 新規タブで開く（ユーザー操作内で呼ぶ）
  const win = window.open(url, "_blank", "noopener,noreferrer");

  // 開けなかった場合のフォールバック（アンカークリック）
  if (!win) {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  }

  // メモリ解放
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

const downloadPdf = (pdfBlob: Blob, fileName: string): void => {
  const blob =
    pdfBlob.type === "application/pdf" ? pdfBlob : new Blob([pdfBlob], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();

  // iOS/Safariなどでdownload非対応の場合のフォールバック
  if (!("download" in HTMLAnchorElement.prototype)) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

const paperStyle = css`
  width: 560px;
`;
