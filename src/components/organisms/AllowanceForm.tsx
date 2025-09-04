import { useEffect, useMemo, useState } from "react";
import { Button, Group, Stack } from "@mantine/core";
import { Allowance, AllowanceDetail } from "../../types/allowance";
import { AllowanceSummary } from "../molecules/AllowanceSummary";
import { AllowanceDetailsModal } from "../molecules/AllowanceDetailsModal";

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
  const [hasReceipt, setHasReceipt] = useState<boolean>(false);

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
    setHasReceipt(false);
    setOpened(true);
  };

  const openForEdit = (idx: number) => {
    const target = summaries[idx];
    const rows: AllowanceDetail[] = (target.details || []).map((d) => ({
      item: d.name ?? "",
      amount: d.amount,
    }));
    setDetails(rows.length ? rows : [defaultRow]);
    setHasReceipt(false);
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
    setHasReceipt(false);
    setEditingIndex(null);
  };

  const handleReset = () => {
    setSummaries([]);
    onChange([]);
  };

  const handleDelete = (idx: number) => {
    const updated = summaries.filter((_, i) => i !== idx);
    setSummaries(updated);
    onChange(updated);
  };

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Button onClick={openForAdd}>追加</Button>
        {summaries.length > 0 && (
          <Button variant="subtle" color="red" onClick={handleReset}>
            すべて削除
          </Button>
        )}
      </Group>

      {summaries.map((s, idx) => (
        <AllowanceSummary
          key={`${s.title}-${idx}`}
          summary={s}
          onEdit={() => openForEdit(idx)}
          onDelete={() => handleDelete(idx)}
        />
      ))}

      <AllowanceDetailsModal
        opened={opened}
        details={details}
        title={title}
        total={total}
        hasReceipt={hasReceipt}
        onClose={() => setOpened(false)}
        onAddRow={addRow}
        onRemoveRow={removeRow}
        onChangeItem={setItem}
        onChangeAmount={setAmount}
        onChangeTitle={setTitle}
        onSave={handleSave}
        onSaveAndContinue={handleSaveAndContinue}
        onChangeReceipt={(v) => {
          setHasReceipt(v);
          if (v) {
            // レシート入力は未実装のため、手入力行は初期化
            setDetails([defaultRow]);
          }
        }}
      />
    </Stack>
  );
};
