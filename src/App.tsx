import { useState } from "react";
import { Title, Button, Group, Center, Loader, Stack, Paper } from "@mantine/core";
import { ImageUploadGallery } from "./components/organisms/ImageUploadGallery";
import { TripForm, TripFormValues, TripFormApi } from "./components/organisms/TripForm";
import { GenerateResult } from "./components/organisms/GenerateResult";
import { AppHeader } from "./components/organisms/AppHeader";

export function App() {
  const [active, setActive] = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);
  const [formApi, setFormApi] = useState<TripFormApi | null>(null);

  const next = () => setActive((c) => Math.min(c + 1, 3));
  const back = () => setActive((c) => Math.max(c - 1, 0));

  return (
    <>
      <AppHeader />
      <Paper p="lg" radius="md" mt={12}>
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
            <TripForm
              onFormApi={setFormApi}
              onSubmit={(values: TripFormValues) => {
                console.log("TripForm submit", values);
                setActive(2);
                setTimeout(() => setActive(3), 1500);
              }}
            />
            <Group justify="space-between" mt="md">
              <Button variant="light" onClick={back}>
                戻る
              </Button>
              <Group>
                <Button variant="light" color="gray" onClick={() => formApi?.reset()}>
                  クリア
                </Button>
                <Button onClick={() => formApi?.submit()}>作成</Button>
              </Group>
            </Group>
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
