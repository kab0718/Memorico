import { Button, Group, Paper, Stack, Text } from "@mantine/core";
import { css } from "@emotion/react";
import type { Allowance } from "../../types/allowance";
import { AmountText } from "../Atomic/AmountText";

interface Props {
  summary: Allowance;
  onEdit: () => void;
  onDelete: () => void;
}

export const AllowanceSummary = ({ summary, onEdit, onDelete }: Props) => {
  return (
    <Paper withBorder p="md" radius="md" w="100%">
      <Group justify="space-between" align="center">
        <Stack gap={2} css={leftStackStyle}>
          <Text fw={700} css={titleTextStyle}>
            {summary.title}
          </Text>
          <AmountText amount={summary.total} />
        </Stack>
        <Group>
          <Button variant="light" onClick={onEdit}>
            詳細
          </Button>
          <Button variant="subtle" color="red" onClick={onDelete}>
            削除
          </Button>
        </Group>
      </Group>
    </Paper>
  );
};

const leftStackStyle = css`
  flex: 1;
  min-width: 0;
`;

const titleTextStyle = css`
  word-break: break-word;
`;
