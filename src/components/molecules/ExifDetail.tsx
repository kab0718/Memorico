import { css } from "@emotion/react";
import { Stack, TextInput, Text, Loader } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { MediaExif } from "../../types/mediaExif";
import { formatDateTime } from "../../utils/exif";
import { fetchLandmarkData } from "../../api/landmark";

interface Props {
  mediaExif: MediaExif | undefined;
  placeName: string;
  onPlaceNameChange: (value: string) => void;
  onPlaceLoadingChange: (loading: boolean) => void;
}

export const ExifDetail = ({
  mediaExif,
  placeName,
  onPlaceNameChange,
  onPlaceLoadingChange,
}: Props) => {
  const status = mediaExif?.status;
  const exif = mediaExif?.exif;

  const [loading, setLoading] = useState<boolean>(false);
  const lastFetchedKey = useRef<string | null>(null);

  useEffect(() => {
    const lat = exif?.latitude;
    const lon = exif?.longitude;
    if (typeof lat !== "number" || typeof lon !== "number") {
      return;
    }

    const key = `${lat},${lon}`;
    if (lastFetchedKey.current === key) {
      return; // 同じ座標では再取得しない
    }

    let aborted = false;
    setLoading(true);
    onPlaceLoadingChange(true);
    fetchLandmarkData(lat, lon)
      .then((res) => {
        if (aborted) {
          return;
        }

        // 既にユーザーが入力している場合は上書きしない
        if (!placeName && res) {
          onPlaceNameChange(res);
        }
        lastFetchedKey.current = key;
      })
      .finally(() => {
        if (aborted) {
          return;
        }
        setLoading(false);
        onPlaceLoadingChange(false);
      });

    return () => {
      aborted = true;
    };
    // exifオブジェクト全体ではなく座標のみを依存にして無限再実行を防ぐ
  }, [exif?.latitude, exif?.longitude, onPlaceLoadingChange, onPlaceNameChange, placeName]);

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
      <div css={dateStyle}>
        撮影日時
        <br />
        <div css={shootingMessageStyle}>{message}</div>
      </div>
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
          rightSection={loading ? <Loader size="xs" /> : undefined}
          description={loading ? "位置情報から場所名を取得中…" : undefined}
          css={placeInputStyle}
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
        rightSection={loading ? <Loader size="xs" /> : undefined}
        description={loading ? "位置情報から場所名を取得中…" : undefined}
        css={placeInputStyle}
      />
    </Stack>
  );
};

const dateStyle = css`
  font-size: clamp(10px, 0.45vw + 10px, 13px);
  line-height: 1.6;
`;

const shootingMessageStyle = css`
  margin-left: 6px;
`;

const placeInputStyle = css`
  .mantine-InputWrapper-label {
    font-size: clamp(10px, 0.35vw + 10px, 13px);
  }
  .mantine-Input-input {
    font-size: clamp(10px, 0.45vw + 10px, 14px);
  }
`;
