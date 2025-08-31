import { Button, Group, Title, List } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { css } from "@emotion/react";

export function App() {
  return (
    <div css={style}>
      <Title order={1}>TravelGuide</Title>
      <p>しおり生成アプリ（MVPスキャフォールド）</p>
      <List spacing="xs" withPadding>
        <List.Item>画像/動画アップロード</List.Item>
        <List.Item>EXIF抽出・確認</List.Item>
        <List.Item>入力フォーム（メンバー/宿泊/エピソード）</List.Item>
        <List.Item>生成ジョブ実行と進捗</List.Item>
        <List.Item>PDFダウンロード</List.Item>
      </List>
      <Group mt="md">
        <Button
          onClick={() => notifications.show({ title: "準備OK", message: "Mantineが有効です" })}
        >
          動作確認
        </Button>
      </Group>
    </div>
  );
}

const style = css`
  padding: 24px;
`;
