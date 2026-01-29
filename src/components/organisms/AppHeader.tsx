import { Group } from "@mantine/core";
import { css } from "@emotion/react";
import { fluidScale } from "../../styles/fluidTypography";

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
`;

const logoStyle = css`
  height: ${fluidScale.logoHeight};
  width: auto;
  display: block;
`;
