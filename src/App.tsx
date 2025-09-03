import { useState, useCallback } from "react";
import { Title, Button, Group, Center, Loader, Stack, Paper, Text, Modal } from "@mantine/core";
import { ImageUploadGallery } from "./components/organisms/ImageUploadGallery";
import { TripForm } from "./components/organisms/TripForm";
import { GenerateResult } from "./components/organisms/GenerateResult";
import { AppHeader } from "./components/organisms/AppHeader";
import { useForm } from "@mantine/form";
import { TripFormValues } from "./types/tripFormValues";
import { AllowanceForm } from "./components/organisms/AllowanceForm";

export const App = () => {
  const [active, setActive] = useState<number>(0);
  const [files, setFiles] = useState<File[]>([]);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const form = useForm<TripFormValues>({
    initialValues: {
      purpose: "",
      members: [{ name: "", episode: "" }],
      hotels: [""],
      date: { start: "", end: "" },
      dayTrip: false,
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      values.members.forEach((m, idx) => {
        if (!m?.name || m.name.trim().length === 0) {
          errors[`members.${idx}.name`] = "必須です";
        }
      });
      if (!values.date?.start) {
        errors["date.start"] = "日程は必須です";
      }
      if (!values.dayTrip && !values.date?.end) {
        errors["date.end"] = "日程は必須です";
      }
      return errors;
    },
  });

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
              <NextButton onClick={next} disabled={files.length === 0} />
            </Group>
          </>
        )}
        {active === 1 && (
          <>
            <TripForm form={form} onSubmit={handleSubmit} />
            <Group justify="space-between" mt="32px">
              <Group>
                <PrevButton onClick={back} />
                <Button variant="subtle" color="red" onClick={() => setConfirmResetOpen(true)}>
                  リセット
                </Button>
              </Group>
              <NextButton onClick={next} disabled={!form.isValid} />
            </Group>

            <Modal
              opened={confirmResetOpen}
              onClose={() => setConfirmResetOpen(false)}
              title="リセット"
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
                    form.reset();
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
          <>
            <AllowanceForm />
            <Group justify="space-between" mt="32px">
              <PrevButton onClick={back} />
              <Button onClick={() => handleSubmit}>作成</Button>
            </Group>
          </>
        )}
        {active === 3 && (
          <Center h="100vh">
            <Stack align="center" gap="sm">
              <Loader size="lg" />
              <Title order={4}>しおりを生成しています…</Title>
            </Stack>
          </Center>
        )}
        {active === 4 && (
          <GenerateResult
            onRestart={() => {
              setActive(0);
              setFiles([]);
              form.reset();
            }}
          />
        )}
      </Paper>
    </>
  );
};

const NextButton = (props: { onClick: () => void; disabled: boolean }) => {
  return (
    <Button onClick={props.onClick} disabled={props.disabled}>
      次へ
    </Button>
  );
};

const PrevButton = (props: { onClick: () => void }) => {
  return (
    <Button variant="light" onClick={props.onClick}>
      戻る
    </Button>
  );
};
