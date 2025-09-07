import { Button, Group, Modal, Paper, Stack, Text, TextInput, Loader } from "@mantine/core";
import { css } from "@emotion/react";
import { AmountText } from "../atoms/AmountText";
import { AllowanceDetailRow } from "./AllowanceDetailRow";
import { AllowanceDetail } from "../../types/allowance";
import { ReceiptImportButton } from "./ReceiptImportButton";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import { postReceipt } from "../../api/receipt";
import { ReceiptResult } from "../../api/types";

interface Props {
  opened: boolean;
  details: AllowanceDetail[];
  title: string;
  total: number;
  onClose: () => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onChangeItem: (index: number, value: string) => void;
  onChangeAmount: (index: number, value: number) => void;
  onChangeTitle: (value: string) => void;
  onSave: () => void;
  onSaveAndContinue: () => void;
  onOcrPrefill: (payload: ReceiptResult) => void;
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
  onOcrPrefill,
}: Props) => {
  const saveDisabled = total < 1 || title.trim().length === 0;
  const [status, setStatus] = useState<"idle" | "running">("idle");

  const onSelectReceipt = async (file: File) => {
    setStatus("running");

    postReceipt(file)
      .then((res) => {
        if (!res.items || res.items.length == 0) {
          notifications.show({
            color: "yellow",
            title: "レシート読み込み結果",
            message: "明細が見つかりません",
          });
          return;
        }

        onOcrPrefill(res);
      })
      .catch((err) => {
        notifications.show({ color: "red", title: "レシート読み込みエラー", message: `${err}` });
      })
      .finally(() => {
        setStatus("idle");
      });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack gap="md" pb="md">
        <>
          {status === "running" && (
            <Group align="center">
              <Loader size="sm" />
            </Group>
          )}

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
            <ReceiptImportButton onSelect={onSelectReceipt} />
            <Button variant="light" onClick={onAddRow}>
              行を追加
            </Button>
          </Group>
        </>

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
          <Button variant="subtle" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="light" onClick={onSaveAndContinue} disabled={saveDisabled}>
            繰り返し作成
          </Button>
          <Button color="blue" onClick={onSave} disabled={saveDisabled}>
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
