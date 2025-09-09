import { useState } from "react";
import { Title, Button, Group, Center, Loader, Stack, Paper, Text } from "@mantine/core";
import { ImageUploadGallery } from "./components/organisms/ImageUploadGallery";
import { TripForm } from "./components/organisms/TripForm";
import { GenerateResult } from "./components/organisms/GenerateResult";
import { AppHeader } from "./components/organisms/AppHeader";
import { useForm } from "@mantine/form";
import { TripFormValues } from "./types/tripFormValues";
import { AllowanceForm } from "./components/organisms/AllowanceForm";
import { StepCard } from "./components/molecules/StepCard";
import { ImageAsset } from "./types/imageAsset";
import { postImagesAndJson } from "./api/postImagesAndJson";

export const App = () => {
  const [active, setActive] = useState<number>(0);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [isLandmarkLoading, setIsLandmarkLoading] = useState<boolean>(false);

  const form = useForm<TripFormValues>({
    initialValues: {
      purpose: "",
      members: [{ name: "", episode: "" }],
      hotels: [""],
      startDate: null,
      endDate: null,
      dayTrip: false,
      allowance: [],
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      values.members.forEach((m, idx) => {
        if (!m?.name || m.name.trim().length === 0) {
          errors[`members.${idx}.name`] = "必須です";
        }
      });
      if (!values.startDate) {
        errors["date.start"] = "日程は必須です";
      }
      if (!values.dayTrip && !values.endDate) {
        errors["date.end"] = "日程は必須です";
      }
      return errors;
    },
  });

  const next = () => setActive((c) => Math.min(c + 1, 3));
  const back = () => setActive((c) => Math.max(c - 1, 0));

  const handleSubmit = async (values: TripFormValues) => {
    setActive(3);
    postImagesAndJson(images, values)
      .then((res) => {
        console.log("Success", res);
        setPdfBlob(res);
        setActive(4);
      })
      .catch((err) => {
        console.error("Error", err);
        alert("エラーが発生しました。初めからやり直してください。");
        setActive(0);
      });
  };

  return (
    <>
      <AppHeader />
      <Paper p="lg" radius="md">
        {active === 0 && (
          <>
            <StepCard label="旅の思い出をアップロード">
              <ImageUploadGallery
                value={images}
                onChange={setImages}
                onLandmarkLoadingChange={setIsLandmarkLoading}
              />
            </StepCard>
            <Group justify="flex-end" mt="xl">
              <NextButton onClick={next} disabled={images.length === 0 || isLandmarkLoading} />
            </Group>
          </>
        )}

        {active === 1 && (
          <>
            <StepCard label="旅のしおりに載せる情報を入力">
              <TripForm form={form} onSubmit={handleSubmit} />
            </StepCard>
            <Group justify="space-between" mt="xl">
              <PrevButton onClick={back} />
              <NextButton onClick={next} disabled={!form.isValid()} />
            </Group>
          </>
        )}
        {active === 2 && (
          <>
            <StepCard label="お小遣い帳を入力">
              <AllowanceForm
                value={form.values.allowance}
                onChange={(v) => form.setFieldValue("allowance", v)}
              />
            </StepCard>
            <Group justify="space-between" mt="xl">
              <PrevButton onClick={back} />
              <Button color="blue" onClick={() => handleSubmit(form.values)}>
                作成
              </Button>
            </Group>
          </>
        )}
        {active === 3 && (
          <Center h="100vh">
            <Stack align="center" gap="sm">
              <Loader size="lg" />
              <Title order={4}>しおりを生成しています…</Title>
              <Text size="sm" c="dimmed">
                3分ほど時間がかかります
              </Text>
            </Stack>
          </Center>
        )}
        {active === 4 && (
          <GenerateResult
            pdfBlob={pdfBlob!}
            onRestart={() => {
              setActive(0);
              setImages([]);
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
