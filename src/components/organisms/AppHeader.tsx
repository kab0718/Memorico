import React from "react";
import { Group, Text } from "@mantine/core";

export const AppHeader = () => {
  const title = "TravelGuide";
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--mantine-color-blue-0)",
        borderBottom: "1px solid var(--mantine-color-gray-3)",
      }}
    >
      <Group h={70} px="md" justify="space-between">
        <Text size="xl" fw={700}>
          {title}
        </Text>
      </Group>
    </header>
  );
};
