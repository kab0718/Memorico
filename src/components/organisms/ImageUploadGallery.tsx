import { useEffect, useMemo, useState } from "react";
import { Button, Card, Group, Image, SimpleGrid, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { UploadDropzone } from "../molecules/UploadDropzone";
import { extractBasicExif } from "../../utils/exif";
import { css } from "@emotion/react";
import { MediaExif } from "../../types/mediaExif";
import { ExifDetail } from "../molecules/ExifDetail";
import { ImageAsset } from "../../types/imageAsset";

interface Props {
  onChange: (images: ImageAsset[]) => void;
  value: ImageAsset[];
  onLandmarkLoadingChange: (loading: boolean) => void;
}

export const ImageUploadGallery = ({ onChange, value, onLandmarkLoadingChange }: Props) => {
  const accept = ["image/*"];
  const maxSize = 50 * 1024 * 1024; // 50MB

  const [images, setImages] = useState<ImageAsset[]>(value);
  const [exifMap, setExifMap] = useState<Record<string, MediaExif>>({});
  const [placeMap, setPlaceMap] = useState<Record<string, string>>({});
  const [landmarkLoadingMap, setLandmarkLoadingMap] = useState<Record<string, boolean>>({});

  // Sync from controlled value
  useEffect(() => {
    setImages(value);
  }, [value]);

  const fileKey = (f: File) => `${f.name}__${f.type}__${f.size}__${f.lastModified}`;

  const handleAdd = (added: File[]) => {
    if (!added.length) {
      return;
    }

    const onlyImages = added.filter((file) => file.type.startsWith("image/"));
    const existing = new Set(images.map((image) => fileKey(image.file)));
    const unique: ImageAsset[] = [];
    let skipped = 0;

    for (const file of onlyImages) {
      const key = fileKey(file);
      if (existing.has(key)) {
        skipped += 1;
        continue;
      }
      existing.add(key);
      unique.push({ file });
    }

    if (unique.length > 0) {
      setImages((prev) => {
        const next = [...prev, ...unique];
        onChange(next);
        return next;
      });
    }

    if (skipped > 0) {
      notifications.show({ color: "yellow", title: "重複をスキップ", message: `${skipped}件` });
    }
  };

  const removeByKey = (key: string) => {
    setImages((prev) => {
      const next = prev.filter((image) => fileKey(image.file) !== key);
      onChange(next);
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

  useEffect(() => {
    const run = async () => {
      for (const image of images) {
        const key = fileKey(image.file);
        if (exifMap[key]) {
          continue;
        }
        setExifMap((prev) => ({ ...prev, [key]: { status: "pending" } }));
        try {
          const exif = await extractBasicExif(image.file);
          setExifMap((prev) => ({ ...prev, [key]: { status: "ok", exif } }));
          // EXIFから日時が取れたら images に反映し、親にも伝播
          if (exif?.date) {
            setImages((prev) => {
              const next = prev.map((img) =>
                fileKey(img.file) === key ? { ...img, dateTime: exif.date } : img,
              );
              onChange(next);
              return next;
            });
          }
        } catch {
          setExifMap((prev) => ({ ...prev, [key]: { status: "error" } }));
        }
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  // 場所名の編集 / 自動補完を images に反映し、親へ伝播
  useEffect(() => {
    setImages((prev) => {
      let changed = false;
      const next = prev.map((img) => {
        const key = fileKey(img.file);
        const name = placeMap[key];
        if (typeof name === "string" && name !== img.placeName) {
          changed = true;
          return { ...img, placeName: name };
        }
        return img;
      });
      if (changed) {
        onChange(next);
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeMap]);

  // 子（ExifDetail）からのロード状態を集約して親へ伝える
  useEffect(() => {
    const anyLoading = Object.values(landmarkLoadingMap).some((v) => v);
    onLandmarkLoadingChange(anyLoading);
  }, [landmarkLoadingMap, onLandmarkLoadingChange]);

  const previews = useMemo(
    () =>
      images.map((image, idx) => {
        const file = image.file;
        const url = URL.createObjectURL(file);
        const key = fileKey(file);

        return (
          <Card key={`${file.name}-${idx}`} withBorder padding="xs" css={imageCardStyle}>
            <Image src={url} alt={file.name} fit="cover" radius="sm" />
            <div>
              <ExifDetail
                mediaExif={exifMap[key]}
                placeName={placeMap[key] ?? ""}
                onPlaceNameChange={(v) => setPlaceMap((prev) => ({ ...prev, [key]: v }))}
                onPlaceLoadingChange={(loading) =>
                  setLandmarkLoadingMap((prev) => ({ ...prev, [key]: loading }))
                }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, exifMap, placeMap],
  );

  return (
    <Stack gap="sm">
      <UploadDropzone onFilesAdded={handleAdd} accept={accept} maxSize={maxSize} />
      {images.length > 0 && (
        <>
          <Group justify="space-between">
            <Text fw={600}>選択済み画像（{images.length}）</Text>
          </Group>
          <SimpleGrid cols={{ base: 2, sm: 4, md: 5 }}>{previews}</SimpleGrid>
        </>
      )}
    </Stack>
  );
};

const imageCardStyle = css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
`;
