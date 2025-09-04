import { Group, Text } from "@mantine/core";
import { css } from "@emotion/react";

export const AppHeader = () => {
  const title = "TravelGuide";
  return (
    <header css={headerStyle}>
      <Group h={70} px="md" justify="space-between">
        <Text size="xl" fw={700}>
          {title}
        </Text>
      </Group>
    </header>
  );
};

const headerStyle = css`
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--mantine-color-blue-0);
  border-bottom: 1px solid var(--mantine-color-gray-3);
`;
