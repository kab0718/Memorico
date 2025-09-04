import {
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  SegmentedControl,
} from "@mantine/core";
import { css } from "@emotion/react";
import { AmountText } from "../Atomic/AmountText";
import { AllowanceDetailRow } from "./AllowanceDetailRow";
import { AllowanceDetail } from "../../types/allowance";

interface Props {
  opened: boolean;
  details: AllowanceDetail[];
  title: string;
  total: number;
  hasReceipt: boolean;
  onClose: () => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onChangeItem: (index: number, value: string) => void;
  onChangeAmount: (index: number, value: number) => void;
  onChangeTitle: (value: string) => void;
  onSave: () => void;
  onSaveAndContinue: () => void;
  onChangeReceipt: (has: boolean) => void;
}

export const AllowanceDetailsModal = ({
  opened,
  details,
  title,
  total,
  onClose,
  onAddRow,
  onRemoveRow,
  onChangeItem,
  onChangeAmount,
  onChangeTitle,
  onSave,
  onSaveAndContinue,
  onChangeReceipt,
  hasReceipt,
}: Props) => {
  const saveDisabled = total < 1 || title.trim().length === 0;
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="明細入力"
      centered
      size="lg"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack gap="sm">
        <Group>
          <SegmentedControl
            data={[
              { label: "レシートなし", value: "none" },
              { label: "レシートあり", value: "has" },
            ]}
            value={hasReceipt ? "has" : "none"}
            onChange={(v) => onChangeReceipt(v === "has")}
          />
        </Group>

        {hasReceipt ? (
          <Paper withBorder p="md" radius="md">
            <Text c="dimmed">レシート入力（後日実装予定の枠）</Text>
          </Paper>
        ) : (
          <>
            {details.map((row, idx) => (
              <AllowanceDetailRow
                key={idx}
                index={idx}
                row={row}
                onChangeItem={onChangeItem}
                onChangeAmount={onChangeAmount}
                onRemove={onRemoveRow}
                canRemove={(details.length || 1) > 1}
              />
            ))}

            <Group>
              <Button variant="light" onClick={onAddRow}>
                行を追加
              </Button>
            </Group>
          </>
        )}

        <Paper withBorder p="sm" radius="md">
          <Group justify="space-between" align="flex-end">
            <TextInput
              label="タイトル"
              placeholder="例: おやつ代"
              withAsterisk
              css={titleInputStyle}
              value={title}
              onChange={(e) => onChangeTitle(e.currentTarget.value)}
            />
            <Stack gap={2} align="flex-end">
              <Text c="dimmed" size="sm">
                合計
              </Text>
              <AmountText amount={total} />
            </Stack>
          </Group>
        </Paper>

        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="light" onClick={onSaveAndContinue} disabled={saveDisabled}>
            繰り返し作成
          </Button>
          <Button onClick={onSave} disabled={saveDisabled}>
            確認して保存
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

const titleInputStyle = css`
  flex: 1;
  min-width: 200px;
`;
