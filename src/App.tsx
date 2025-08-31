import { Title, List } from "@mantine/core";
import { css } from "@emotion/react";
import { ImageUploadGallery } from "./components/organisms/ImageUploadGallery";
import { TripForm, type TripFormValues } from "./components/organisms/TripForm";

export function App() {
  return (
    <div css={style}>
      <Title order={1}>TravelGuide</Title>

      <div css={formContainerStyle}>
        <ImageUploadGallery />
        <TripForm onSubmit={(values: TripFormValues) => {
          console.log("TripForm submit", values)
        }} />
      </div>

    </div>
  );
}

const style = css`
  padding: 24px;
`;

const formContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`