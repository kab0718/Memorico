import {
  Button,
  Group,
  Stack,
  TextInput,
  Textarea,
  Divider,
  Checkbox,
  Select,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import "dayjs/locale/ja";
import type { UseFormReturnType } from "@mantine/form";
import { css } from "@emotion/react";
import { TripFormValues, MemberRole } from "../../types/tripFormValues";

export interface TripFormProps {
  form: UseFormReturnType<TripFormValues>;
  onSubmit: (values: TripFormValues) => void;
}

export const TripForm = ({ form, onSubmit }: TripFormProps) => {
  const addMember = () => form.insertListItem("members", { name: "", episode: "" });
  const removeMember = (index: number) => form.removeListItem("members", index);
  const addHotel = () => form.insertListItem("hotels", "");
  const removeHotel = (index: number) => form.removeListItem("hotels", index);

  const roleOptions: { value: MemberRole; label: string }[] = [
    { value: "leader", label: "リーダー" },
    { value: "camera", label: "運転" },
    { value: "accountant", label: "カメラ" },
    { value: "navigator", label: "会計" },
    { value: "driver", label: "ナビ" },
    { value: "reservation", label: "予約" },
  ];

  return (
    <form onSubmit={form.onSubmit(onSubmit)} noValidate>
      <Stack gap="md">
        <Group align="end" wrap="nowrap">
          {form.values.dayTrip ? (
            <DatePickerInput
              css={datePickerStyle}
              type="default"
              label="日程"
              placeholder="日付"
              locale="ja"
              valueFormat="YYYY/MM/DD"
              value={form.values.startDate}
              error={form.errors["startDate"]}
              onChange={(d) => {
                form.setFieldValue("startDate", d);
                form.setFieldValue("endDate", d);
              }}
              firstDayOfWeek={0}
              withAsterisk
            />
          ) : (
            <DatePickerInput
              css={datePickerStyle}
              type="range"
              label="日程"
              placeholder="開始日 〜 終了日"
              locale="ja"
              valueFormat="YYYY/MM/DD"
              value={[form.values.startDate, form.values.endDate]}
              error={form.errors["startDate"] || form.errors["endDate"]}
              onChange={([start, end]) => {
                form.setFieldValue("startDate", start);
                form.setFieldValue("endDate", end);
              }}
              firstDayOfWeek={0}
              withAsterisk
            />
          )}
          <Checkbox
            label="日帰り"
            checked={!!form.values.dayTrip}
            css={checkboxStyle(!!form.errors["startDate"] || !!form.errors["endDate"])}
            onChange={(e) => {
              const checked = e.currentTarget.checked;
              form.setFieldValue("dayTrip", checked);
              if (checked) {
                form.setFieldValue("endDate", form.values.startDate);
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
                css={hotelInputStyle}
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
                css={memberNameInputStyle}
                {...form.getInputProps(`members.${idx}.name`)}
              />
              <Select
                label="役割"
                css={roleSelectStyle(!!form.errors[`members.${idx}.name`])}
                data={roleOptions}
                clearable
                {...form.getInputProps(`members.${idx}.role`)}
              />
              <TextInput
                label="エピソード"
                placeholder="運転してくれた"
                css={episodeInputStyle(!!form.errors[`members.${idx}.name`])}
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

const datePickerStyle = css`
  flex: 1;
  max-width: 260px;
`;

const hotelInputStyle = css`
  flex: 2;
  max-width: 260px;
`;

const memberNameInputStyle = css`
  max-width: 160px;
`;

const episodeInputStyle = (isError: boolean) => css`
  min-width: 200px;
  flex: 2;
  margin-bottom: ${isError ? "19px" : "0"};
`;

const roleSelectStyle = (isError: boolean) => css`
  max-width: 130px;
  margin-bottom: ${isError ? "19px" : "0"};
`;
