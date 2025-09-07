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
  /* WCAG AA: 4.5:1 以上を満たす配色に調整 */
  background-color: var(--mantine-color-yellow-2);
  color: var(--mantine-color-dark-9);
`;

const contentsStyle = css`
  /* ヘッダー直下にゆとりを持たせる */
  margin: 32px 24px 24px 24px;
`;
