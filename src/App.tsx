import { useState, useCallback } from "react";
import { Title, Button, Group, Center, Loader, Stack, Paper, Text, Modal } from "@mantine/core";
import { ImageUploadGallery } from "./components/organisms/ImageUploadGallery";
import { TripForm, TripFormValues, TripFormApi } from "./components/organisms/TripForm";
import { GenerateResult } from "./components/organisms/GenerateResult";
import { AppHeader } from "./components/organisms/AppHeader";

export function App() {
  const [active, setActive] = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);
  const [formApi, setFormApi] = useState<TripFormApi | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const next = () => setActive((c) => Math.min(c + 1, 3));
  const back = () => setActive((c) => Math.max(c - 1, 0));

  const handleSubmit = useCallback(
    (values: TripFormValues) => {
      console.log("TripForm submit", values);
      setActive(2);
      setTimeout(() => setActive(3), 1500);
    },
    [setActive],
  );

  return (
    <>
      <AppHeader />
      <Paper p="lg" radius="md">
        {active === 0 && (
          <>
            <ImageUploadGallery value={files} onChange={setFiles} />
            <Group justify="flex-end" mt="md">
              <Button onClick={next} disabled={files.length === 0}>
                次へ
              </Button>
            </Group>
          </>
        )}
        {active === 1 && (
          <>
            <TripForm onFormApi={setFormApi} onSubmit={handleSubmit} />
            <Group justify="space-between" mt="32px">
              <Group>
                <Button variant="light" onClick={back}>
                  戻る
                </Button>
                <Button variant="subtle" color="red" onClick={() => setConfirmResetOpen(true)}>
                  リセット
                </Button>
              </Group>
              <Button onClick={() => formApi?.submit()}>作成</Button>
            </Group>

            <Modal
              opened={confirmResetOpen}
              onClose={() => setConfirmResetOpen(false)}
              title="入力をリセット"
              centered
            >
              <Text>すべての入力をリセットします。よろしいですか？</Text>
              <Group justify="flex-end" mt="md">
                <Button variant="light" onClick={() => setConfirmResetOpen(false)}>
                  キャンセル
                </Button>
                <Button
                  color="red"
                  onClick={() => {
                    formApi?.reset();
                    setConfirmResetOpen(false);
                  }}
                >
                  リセット
                </Button>
              </Group>
            </Modal>
          </>
        )}
        {active === 2 && (
          <Center h="100vh">
            <Stack align="center" gap="sm">
              <Loader size="lg" />
              <Title order={4}>しおりを生成しています…</Title>
            </Stack>
          </Center>
        )}
        {active === 3 && (
          <GenerateResult
            onRestart={() => {
              setActive(0);
              setFiles([]);
              formApi?.reset();
            }}
          />
        )}
      </Paper>
    </>
  );
}
