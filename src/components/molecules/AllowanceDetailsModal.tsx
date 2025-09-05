import {
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Loader,
  Progress,
} from "@mantine/core";
import { css } from "@emotion/react";
import { AmountText } from "../Atomic/AmountText";
import { AllowanceDetailRow } from "./AllowanceDetailRow";
import { AllowanceDetail } from "../../types/allowance";
import { ReceiptImportButton } from "./ReceiptImportButton";
import { useReceiptOcr } from "../../hooks/useReceiptOcr";
import { parseReceiptText } from "../../utils/parseReceiptText";
import { notifications } from "@mantine/notifications";
import { useEffect } from "react";

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
  onOcrPrefill: (payload: {
    details: AllowanceDetail[];
    total?: number;
    titleHint?: string;
  }) => void;
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
  const { status, progress, text, error, run, reset } = useReceiptOcr();

  useEffect(() => {
    if (status === "error") {
      notifications.show({
        color: "red",
        title: "OCRに失敗しました",
        message: error ?? "解析中にエラーが発生しました",
      });
    }
  }, [status, error]);

  const detailsFromTotal = (t?: number): AllowanceDetail[] => {
    if (!t || !Number.isFinite(t)) {
      return [];
    }
    return [{ name: "レシート", amount: t }];
  };

  const onSelectReceipt = async (file: File) => {
    await run(file);
    if (!text || text.trim().length === 0) {
      return;
    }
    const parsed = parseReceiptText(text);
    const nextDetails = parsed.rows.length > 0 ? parsed.rows : detailsFromTotal(parsed.total);
    onOcrPrefill({ details: nextDetails, total: parsed.total, titleHint: parsed.titleHint });
    reset();
  };

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
        <>
          {status === "running" && (
            <Group align="center">
              <Loader size="sm" />
              <Progress value={Math.round(progress * 100)} style={{ flex: 1 }} />
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
