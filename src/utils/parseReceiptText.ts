import { AllowanceDetail } from "../types/allowance";

export interface ReceiptParseResult {
  rows: AllowanceDetail[];
  total?: number;
  titleHint?: string;
}

const amountRegex = /[¥￥]?[\s]*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?|[0-9]+)/g;

const toNumber = (s: string): number => {
  const cleaned = s.replace(/[¥￥\s,]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

export const parseReceiptText = (text: string): ReceiptParseResult => {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const candidateAmounts: number[] = [];

  for (const line of lines) {
    const matches = [...line.matchAll(amountRegex)];
    for (const m of matches) {
      const v = toNumber(m[0]);
      if (v > 0) {
        candidateAmounts.push(v);
      }
    }
  }

  const total = candidateAmounts.length > 0 ? Math.max(...candidateAmounts) : undefined;
  const rows: AllowanceDetail[] = [];

  for (const line of lines) {
    const matches = [...line.matchAll(amountRegex)];

    if (matches.length === 0) {
      continue;
    }

    const last = matches[matches.length - 1][0];
    const amount = toNumber(last);
    const name = line.replace(last, "").replace(/[¥￥]/g, "").trim();

    if (amount <= 0 || name.length === 0) {
      continue;
    }

    rows.push({ name, amount });
  }

  const header = lines.slice(0, 3).join(" ");
  const titleHint = header.replace(amountRegex, "").trim() || "レシート";

  return { rows, total, titleHint };
};
