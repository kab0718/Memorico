import { useEffect, useMemo, useState } from "react";
import { Button, Stack, ThemeIcon } from "@mantine/core";
import { Allowance, AllowanceDetail } from "../../types/allowance";
import { AllowanceSummary } from "../molecules/AllowanceSummary";
import { AllowanceDetailsModal } from "../molecules/AllowanceDetailsModal";
import { css } from "@emotion/react";
import { IconVocabulary } from "@tabler/icons-react";
import { ReceiptResult } from "../../api/types";

interface Props {
  value?: Allowance[];
  onChange: (v: Allowance[]) => void;
}

const defaultRow: AllowanceDetail = { name: "", amount: 0 };

export const AllowanceForm = ({ value = [], onChange }: Props) => {
  const [opened, setOpened] = useState(false);
  const [summaries, setSummaries] = useState<Allowance[]>(value);
  const [details, setDetails] = useState<AllowanceDetail[]>([defaultRow]);
  const [title, setTitle] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setSummaries(value);
  }, [value]);

  const setItem = (idx: number, item: string) => {
    setDetails((prev) => prev.map((r, i) => (i === idx ? { ...r, name: item } : r)));
  };

  const setAmount = (idx: number, amount: number) => {
    setDetails((prev) => prev.map((r, i) => (i === idx ? { ...r, amount } : r)));
  };

  const total = useMemo(() => {
    return details.reduce((acc, r) => acc + (typeof r.amount === "number" ? r.amount : 0), 0);
  }, [details]);

  const openForAdd = () => {
    setDetails([defaultRow]);
    setTitle("");
    setOpened(true);
  };

  const openForEdit = (idx: number) => {
    const target = summaries[idx];
    const rows: AllowanceDetail[] = (target.details || []).map((d) => ({
      item: d.name ?? "",
      amount: d.amount,
    }));
    setDetails(rows.length ? rows : [defaultRow]);
    setTitle(target.title);
    setEditingIndex(idx);
    setOpened(true);
  };

  const addRow = () => {
    setDetails((prev) => [...prev, defaultRow]);
  };

  const removeRow = (idx: number) => {
    if (details.length <= 1) {
      return;
    }
    setDetails((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    const sum = details.reduce((acc, r) => acc + (typeof r.amount === "number" ? r.amount : 0), 0);
    if (!Number.isFinite(sum) || sum < 1) {
      return;
    }

    const normalized: AllowanceDetail[] = details.map((r) => ({
      item: r.name?.trim(),
      amount: Number(r.amount),
    }));
    const next: Allowance = { total: sum, title: title.trim(), details: normalized };
    const updated =
      editingIndex !== null
        ? summaries.map((s, i) => (i === editingIndex ? next : s))
        : [...summaries, next];

    setSummaries(updated);
    onChange(updated);
    setEditingIndex(null);
    setOpened(false);
  };

  const handleSaveAndContinue = () => {
    const sum = details.reduce((acc, r) => acc + (typeof r.amount === "number" ? r.amount : 0), 0);
    if (!Number.isFinite(sum) || sum < 1) {
      return;
    }

    const normalized: AllowanceDetail[] = details.map((r) => ({
      item: r.name?.trim(),
      amount: Number(r.amount),
    }));
    const next: Allowance = { total: sum, title: title.trim(), details: normalized };
    const updated = [...summaries, next];

    setSummaries(updated);
    onChange(updated);
    // 次の入力に備えて初期化（モーダルは開いたまま）
    setDetails([defaultRow]);
    setTitle("");
    setEditingIndex(null);
  };

  const handleDelete = (idx: number) => {
    const updated = summaries.filter((_, i) => i !== idx);
    setSummaries(updated);
    onChange(updated);
  };

  const handleOcrPrefill = (payload: ReceiptResult) => {
    if (payload.items && payload.items.length > 0) {
      setDetails(payload.items.map((it) => ({ name: it.name ?? "", amount: it.amount ?? 0 })));
    }
    if (payload.storeName && title.trim().length === 0) {
      setTitle(payload.storeName);
    }
  };

  return (
    <Stack gap="sm">
      <div css={summaryGroupStyle}>
        {summaries.length === 0 && (
          <Stack align="center" gap={4}>
            <ThemeIcon size={40} variant="white">
              <IconVocabulary size={80} />
            </ThemeIcon>
            <div css={noDataTextStyle}>
              出費が登録されていません
            </div>
          </Stack>
        )}

        {summaries.map((s, idx) => (
          <AllowanceSummary
            key={`${s.title}-${idx}`}
            summary={s}
            onEdit={() => openForEdit(idx)}
            onDelete={() => handleDelete(idx)}
          />
        ))}

        <Button onClick={openForAdd} css={addButtonStyle}>
          追加
        </Button>
      </div>

      <AllowanceDetailsModal
        opened={opened}
        details={details}
        title={title}
        total={total}
        onClose={() => setOpened(false)}
        onAddRow={addRow}
        onRemoveRow={removeRow}
        onChangeItem={setItem}
        onChangeAmount={setAmount}
        onChangeTitle={setTitle}
        onSave={handleSave}
        onSaveAndContinue={handleSaveAndContinue}
        onOcrPrefill={handleOcrPrefill}
      />
    </Stack>
  );
};

const summaryGroupStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
`;

const addButtonStyle = css`
  max-width: 300px;
`;

const noDataTextStyle = css`
  font-weight: 600;
`