import { Group } from "@mantine/core";
import { css } from "@emotion/react";

export const AppHeader = (): JSX.Element => {
  const title = "Memorico";
  return (
    <header css={headerStyle}>
      <Group h={70} px="md" justify="space-between">
        <img src="/logo.png" alt={title} css={logoStyle} />
      </Group>
    </header>
  );
};

const headerStyle = css`
  background: #fff7e8;
  border-bottom: 1px solid var(--mantine-color-gray-3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`;

const logoStyle = css`
  height: clamp(40px, 4vw, 68px);
  width: auto;
  display: block;
`;
