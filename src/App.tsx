import { Title, List } from "@mantine/core";
import { css } from "@emotion/react";
import { ImageUploadGallery } from "./components/organisms/ImageUploadGallery";

export function App() {
  return (
    <div css={style}>
      <Title order={1}>TravelGuide</Title>
      <p>しおり生成アプリ（MVPスキャフォールド）</p>

      <ImageUploadGallery />

      <List spacing="xs" withPadding mt="lg">
        <List.Item>画像/動画アップロード</List.Item>
        <List.Item>EXIF抽出・確認</List.Item>
        <List.Item>入力フォーム（メンバー/宿泊/エピソード）</List.Item>
        <List.Item>生成ジョブ実行と進捗</List.Item>
        <List.Item>PDFダウンロード</List.Item>
      </List>
    </div>
  );
}

const style = css`
  padding: 24px;
`;
