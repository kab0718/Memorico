import { Button, Group, TextInput } from "@mantine/core";
import { NumericTextInput } from "../Atomic/NumericTextInput";
import { css } from "@emotion/react";
import { AllowanceDetail } from "../../types/allowance";

interface Props {
  index: number;
  row: AllowanceDetail;
  onChangeItem: (index: number, value: string) => void;
  onChangeAmount: (index: number, value: number) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export const AllowanceDetailRow = ({
  index,
  row,
  onChangeItem,
  onChangeAmount,
  onRemove,
  canRemove,
}: Props) => {
  return (
    <Group align="flex-end" wrap="wrap">
      <TextInput
        label="商品名"
        placeholder="例: ジュース"
        css={itemInputStyle}
        value={row.name}
        onChange={(e) => onChangeItem(index, e.currentTarget.value)}
      />
      <NumericTextInput
        label="金額（円）"
        css={amountInputStyle}
        value={row.amount}
        placeholder="例: 120"
        withAsterisk
        onChange={(v) => onChangeAmount(index, v)}
      />
      <Button variant="light" color="red" onClick={() => onRemove(index)} disabled={!canRemove}>
        削除
      </Button>
    </Group>
  );
};

const itemInputStyle = css`
  min-width: 160px;
  flex: 2;
`;

const amountInputStyle = css`
  width: 200px;
`;
