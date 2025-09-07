import { Text } from "@mantine/core";

const formatYen = (n: number) => `¥${(n || 0).toLocaleString("ja-JP")}`;

interface AmountTextProps {
  amount: number;
}

export const AmountText = ({ amount }: AmountTextProps) => {
  return <Text fw={700}>{formatYen(amount)}</Text>;
};
