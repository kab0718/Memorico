import { css } from "@emotion/react";
import { Group, Stack, Text } from "@mantine/core";
import { Dropzone, FileRejection } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";

interface UploadDropzoneProps {
  onFilesAdded: (files: File[]) => void;
  accept?: string[];
  maxSize?: number; // bytes
}

export const UploadDropzone = ({
  onFilesAdded,
  accept = ["image/*", "video/*"],
  maxSize = 50 * 1024 * 1024, // 50MB
}: UploadDropzoneProps) => {
  const handleDrop = (files: File[]) => {
    if (!files?.length) {
      return;
    }
    onFilesAdded(files);
    notifications.show({ title: "ファイルを追加しました", message: `${files.length}件` });
  };

  const handleReject = (rejections: FileRejection[]) => {
    const total = rejections?.length || 0;
    if (total === 0) {
      return;
    }
    const reasons = new Set<string>();
    rejections.forEach((r) => r.errors.forEach((e) => reasons.add(e.code)));
    notifications.show({
      color: "red",
      title: "一部のファイルを受け付けできません",
      message: `件数: ${total} / 理由: ${Array.from(reasons).join(", ")}`,
    });
  };

  return (
    <Dropzone
      onDrop={handleDrop}
      onReject={handleReject}
      accept={accept}
      maxSize={maxSize}
      multiple
      css={dropzoneStyle}
    >
      <Group justify="center" mih={140}>
        <Stack gap={4} align="center">
          <Text fw={600}>ここに画像をドラッグ&ドロップ</Text>
          <Text c="dimmed" size="sm">
            最大 {Math.round(maxSize / (1024 * 1024))}MB / ファイル
          </Text>
        </Stack>
      </Group>
    </Dropzone>
  );
};

const dropzoneStyle = css`
  border: none;
`;
