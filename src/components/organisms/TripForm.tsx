import { Button, Group, Stack, TextInput, Textarea, Divider, Checkbox } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import dayjs from "dayjs";
import "dayjs/locale/ja";
import type { UseFormReturnType } from "@mantine/form";
import { css } from "@emotion/react";
import { TripFormValues } from "../../types/tripFormValues";

export interface TripFormProps {
  form: UseFormReturnType<TripFormValues>;
  onSubmit: (values: TripFormValues) => void;
}

export const TripForm = ({ form, onSubmit }: TripFormProps) => {
  const addMember = () => form.insertListItem("members", { name: "", episode: "" });
  const removeMember = (index: number) => form.removeListItem("members", index);
  const addHotel = () => form.insertListItem("hotels", "");
  const removeHotel = (index: number) => form.removeListItem("hotels", index);

  const toDate = (s?: string) => (s ? new Date(s) : null);
  const fmt = (d: Date | null) => (d ? dayjs(d).format("YYYY-MM-DD") : "");

  return (
    <form onSubmit={form.onSubmit(onSubmit)} noValidate>
      <Stack gap="md">
        <Group align="end" wrap="nowrap">
          {form.values.dayTrip ? (
            <DatePickerInput
              style={{ flex: 1, maxWidth: "260px" }}
              type="default"
              label="日程"
              placeholder="日付"
              locale="ja"
              valueFormat="YYYY/MM/DD"
              value={toDate(form.values.date.start)}
              error={form.errors["date.start"]}
              onChange={(d) => {
                form.setFieldValue("date.start", fmt(d));
                form.setFieldValue("date.end", fmt(d));
              }}
              firstDayOfWeek={0}
              withAsterisk
            />
          ) : (
            <DatePickerInput
              style={{ flex: 1, maxWidth: "260px" }}
              type="range"
              label="日程"
              placeholder="開始日 〜 終了日"
              locale="ja"
              valueFormat="YYYY/MM/DD"
              value={[toDate(form.values.date.start), toDate(form.values.date.end)]}
              error={form.errors["date.start"] || form.errors["date.end"]}
              onChange={([start, end]) => {
                form.setFieldValue("date.start", fmt(start));
                form.setFieldValue("date.end", fmt(end));
              }}
              firstDayOfWeek={0}
              withAsterisk
            />
          )}
          <Checkbox
            label="日帰り"
            checked={!!form.values.dayTrip}
            css={checkboxStyle(!!form.errors["date.start"] || !!form.errors["date.end"])}
            onChange={(e) => {
              const checked = e.currentTarget.checked;
              form.setFieldValue("dayTrip", checked);
              if (checked) {
                const start = toDate(form.values.date.start);
                form.setFieldValue("date.end", fmt(start));
              }
            }}
          />
        </Group>

        <Stack gap="sm">
          {form.values.hotels.map((_, idx) => (
            <Group key={idx} align="flex-end" wrap="nowrap">
              <TextInput
                label="宿泊先名"
                placeholder="◯◯旅館"
                style={{ flex: 2, maxWidth: "260px" }}
                {...form.getInputProps(`hotels.${idx}`)}
              />
              <Button
                variant="light"
                color="red"
                onClick={() => removeHotel(idx)}
                disabled={form.values.hotels.length <= 1}
              >
                削除
              </Button>
            </Group>
          ))}
          <Group>
            <Button variant="light" onClick={addHotel}>
              宿泊先を追加
            </Button>
          </Group>
        </Stack>

        <Textarea
          label="目的"
          placeholder="旅の目的やテーマ"
          autosize
          minRows={2}
          {...form.getInputProps("purpose")}
        />

        <Stack gap="sm">
          <Divider label="参加メンバー" />
          {form.values.members.map((_, idx) => (
            <Group key={idx} align="flex-end" wrap="wrap">
              <TextInput
                label="名前"
                placeholder="山田 太郎"
                withAsterisk
                style={{ maxWidth: "160px" }}
                {...form.getInputProps(`members.${idx}.name`)}
              />
              <TextInput
                label="エピソード"
                placeholder="運転してくれた"
                style={{
                  minWidth: "200px",
                  flex: 2,
                  marginBottom: form.errors[`members.${idx}.name`] !== undefined ? "19px" : "0",
                }}
                {...form.getInputProps(`members.${idx}.episode`)}
              />
              <Button
                variant="light"
                color="red"
                onClick={() => removeMember(idx)}
                disabled={form.values.members.length <= 1}
                css={memberDeleteButtonStyle(!!form.errors[`members.${idx}.name`])}
              >
                削除
              </Button>
            </Group>
          ))}
          <Group>
            <Button variant="light" onClick={addMember}>
              メンバーを追加
            </Button>
          </Group>
        </Stack>
      </Stack>
    </form>
  );
};

const checkboxStyle = (isError: boolean) => css`
  margin-bottom: ${isError ? "27px" : "8px"};
`;

const memberDeleteButtonStyle = (isError: boolean) => css`
  margin-bottom: ${isError ? "19px" : "0"};
`;
