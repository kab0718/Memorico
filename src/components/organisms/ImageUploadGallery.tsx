import { useEffect, useMemo, useState } from "react";
import { Button, Card, Group, Image, SimpleGrid, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { UploadDropzone } from "../molecules/UploadDropzone";
import { extractBasicExif, formatDateTime, BasicExif } from "../../utils/exif";
import { css } from "@emotion/react";

interface Props {
  accept?: string[];
  maxSize?: number;
  onChange?: (files: File[]) => void;
  value?: File[];
}

interface MediaExif {
  status: "pending" | "ok" | "error";
  exif?: BasicExif;
}

export function ImageUploadGallery({
  accept = ["image/*"],
  maxSize = 50 * 1024 * 1024,
  onChange,
  value,
}: Props) {
  const [files, setFiles] = useState<File[]>(value ?? []);
  const [exifMap, setExifMap] = useState<Record<string, MediaExif>>({});
  const [placeMap, setPlaceMap] = useState<Record<string, string>>({});

  // Sync from controlled value
  useEffect(() => {
    if (value) {
      setFiles(value);
    }
  }, [value]);

  const fileKey = (f: File) => `${f.name}__${f.type}__${f.size}__${f.lastModified}`;

  const handleAdd = (added: File[]) => {
    if (!added?.length) {
      return;
    }
    const onlyImages = added.filter((f) => f.type.startsWith("image/"));
    const existing = new Set(files.map(fileKey));
    const unique: File[] = [];
    let skipped = 0;
    for (const f of onlyImages) {
      const key = fileKey(f);
      if (existing.has(key)) {
        skipped += 1;
        continue;
      }
      existing.add(key);
      unique.push(f);
    }
    if (unique.length > 0) {
      setFiles((prev) => {
        const next = [...prev, ...unique];
        onChange?.(next);
        return next;
      });
    }
    if (skipped > 0) {
      notifications.show({ color: "yellow", title: "重複をスキップ", message: `${skipped}件` });
    }
  };

  const removeByKey = (key: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => fileKey(f) !== key);
      onChange?.(next);
      return next;
    });
    setExifMap((prev) => {
      const { [key]: _removed, ...rest } = prev;
      return rest;
    });
    setPlaceMap((prev) => {
      const { [key]: _p, ...rest } = prev;
      return rest;
    });
  };

  const clearAll = () => {
    setFiles([]);
    setExifMap({});
    setPlaceMap({});
    onChange?.([]);
  };

  useEffect(() => {
    const run = async () => {
      for (const f of files) {
        const key = fileKey(f);
        if (exifMap[key]) {
          continue;
        }
        setExifMap((prev) => ({ ...prev, [key]: { status: "pending" } }));
        try {
          const exif = await extractBasicExif(f);
          setExifMap((prev) => ({ ...prev, [key]: { status: "ok", exif } }));
        } catch {
          setExifMap((prev) => ({ ...prev, [key]: { status: "error" } }));
        }
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const previews = useMemo(
    () =>
      files.map((file, idx) => {
        const url = URL.createObjectURL(file);
        const key = fileKey(file);

        return (
          <Card key={`${file.name}-${idx}`} withBorder padding="xs" css={imageCardStyle}>
            <Image src={url} alt={file.name} fit="cover" radius="sm" />
            <div>
              <ExifData
                mediaExif={exifMap[key]}
                placeName={placeMap[key] ?? ""}
                onPlaceNameChange={(v) => setPlaceMap((prev) => ({ ...prev, [key]: v }))}
              />
              <Group justify="flex-end" mt={6}>
                <Button
                  justify="flex-end"
                  size="xs"
                  variant="light"
                  color="red"
                  onClick={() => removeByKey(key)}
                >
                  削除
                </Button>
              </Group>
            </div>
          </Card>
        );
      }),
    [files, exifMap, placeMap],
  );

  return (
    <Stack gap="sm">
      <UploadDropzone
        onFilesAdded={handleAdd}
        accept={accept}
        maxSize={maxSize}
        label="旅の思い出"
      />
      {files.length > 0 && (
        <>
          <Group justify="space-between">
            <Text fw={600}>選択済みファイル（{files.length}）</Text>
            <Button variant="light" color="red" size="xs" onClick={clearAll}>
              クリア
            </Button>
          </Group>
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }}>{previews}</SimpleGrid>
        </>
      )}
    </Stack>
  );
}

interface ExifDataProps {
  mediaExif: MediaExif | undefined;
  placeName: string;
  onPlaceNameChange: (value: string) => void;
}

const ExifData = ({ mediaExif, placeName, onPlaceNameChange }: ExifDataProps) => {
  const status = mediaExif?.status;
  const exif = mediaExif?.exif;

  if (status !== "ok") {
    const message = status === "pending" ? "EXIF解析中…" : "EXIF解析失敗";
    return (
      <Text size="xs" c="dimmed" mt={4}>
        {message}
      </Text>
    );
  }

  const ShootingDate = (props: { dateTime?: Date }) => {
    const message = props.dateTime ? formatDateTime(props.dateTime) : "不明";
    return (
      <Text size="sm">
        撮影日時
        <br />
        <div css={shootingMessageStyle}>{message}</div>
      </Text>
    );
  };

  if (!exif) {
    return (
      <Stack gap={4}>
        <ShootingDate />
        <TextInput
          label="場所名（編集可）"
          placeholder="例: 東京駅 丸の内口"
          size="xs"
          value={placeName}
          onChange={(e) => onPlaceNameChange(e.currentTarget.value)}
        />
      </Stack>
    );
  }

  return (
    <Stack gap={4} mt={10}>
      <ShootingDate dateTime={exif.date} />
      <TextInput
        label="場所名（編集可）"
        placeholder="例: 東京駅 丸の内口"
        size="xs"
        value={placeName}
        onChange={(e) => onPlaceNameChange(e.currentTarget.value)}
      />
    </Stack>
  );
};

const imageCardStyle = css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
`;

const shootingMessageStyle = css`
  margin-left: 6px;
`;
