import { jsonPost } from "./http";
import { ReceiptResult } from "./types";

export async function postReceipt(file: File): Promise<ReceiptResult> {
  const form = new FormData();
  // ブラウザにboundary付きのContent-Typeを任せるため、ヘッダーは付けない
  form.append("receipt", file, file.name);

  return jsonPost<ReceiptResult>("receipt", {}, form);
}
