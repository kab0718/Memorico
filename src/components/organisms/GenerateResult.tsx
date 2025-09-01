import React from "react";
import { Button, Center, Paper, Stack, Text, Title } from "@mantine/core";

export interface GenerateResultProps {
  onRestart: () => void;
}

export function GenerateResult({ onRestart }: GenerateResultProps) {
  return (
    <Center h="100vh">
      <Paper withBorder p="lg" radius="md" style={{ width: 560 }}>
        <Stack align="center" gap="sm">
          <Title order={3}>しおりの生成が完了しました</Title>
          <Text c="dimmed">ダウンロードや共有は次フェーズで実装予定です。</Text>
          <Stack gap="xs" w="100%">
            <Button disabled>PDFをダウンロード（準備中）</Button>
            <Button variant="light" onClick={onRestart}>
              最初からやり直す
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Center>
  );
}
