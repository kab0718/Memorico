import { css } from "@emotion/react";
import { Stack, TextInput, Text } from "@mantine/core";
import { MediaExif } from "../../types/mediaExif";
import { formatDateTime } from "../../utils/exif";

interface Props {
  mediaExif: MediaExif | undefined;
  placeName: string;
  onPlaceNameChange: (value: string) => void;
}

export const ExifDetail = ({ mediaExif, placeName, onPlaceNameChange }: Props) => {
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

const shootingMessageStyle = css`
  margin-left: 6px;
`;
