import { css } from "@emotion/react";
import { Card, Divider, Title } from "@mantine/core";

interface Props {
  label: string;
  children: React.ReactNode;
}

export const StepCard = ({ label, children }: Props) => {
  return (
    <Card withBorder radius="md" padding="0">
      <div>
        <Title order={3} css={titleStyle}>
          {label}
        </Title>
      </div>
      <Divider />
      <div css={contentsStyle}>{children}</div>
    </Card>
  );
};

const titleStyle = css`
  padding: 16px 24px;
  background-color: #ffd66d;
`;

const contentsStyle = css`
  margin: 24px;
`;
