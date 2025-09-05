import { useCallback, useRef, useState } from "react";

type OcrStatus = "idle" | "running" | "done" | "error";

interface UseReceiptOcrReturn {
  status: OcrStatus;
  progress: number; // 0..1
  text: string;
  error: string | null;
  run: (file: File | Blob) => Promise<void>;
  reset: () => void;
  cancel: () => void; // skeleton: no-op for now
}

export const useReceiptOcr = (): UseReceiptOcrReturn => {
  const [status, setStatus] = useState<OcrStatus>("idle");
  const [progress, setProgress] = useState<number>(0);
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const runningRef = useRef<boolean>(false);

  const reset = useCallback((): void => {
    setStatus("idle");
    setProgress(0);
    setText("");
    setError(null);
    runningRef.current = false;
  }, []);

  const cancel = useCallback((): void => {
    // NOTE: For tesseract.js, proper cancel requires worker API.
    // This skeleton marks state as error if called during running.
    if (runningRef.current) {
      setStatus("error");
      setError("Canceled");
      runningRef.current = false;
    }
  }, []);

  const run = useCallback(async (file: File | Blob): Promise<void> => {
    try {
      setStatus("running");
      setProgress(0);
      setText("");
      setError(null);
      runningRef.current = true;

      const Tesseract = await import("tesseract.js");
      const { data } = await Tesseract.recognize(file, "jpn", {
        logger: (m: { status: string; progress?: number }) => {
          if (typeof m.progress === "number") {
            setProgress(Math.max(0, Math.min(1, m.progress)));
          }
        },
      });
      runningRef.current = false;
      setText(data?.text ?? "");
      setStatus("done");
      setProgress(1);
    } catch (e: unknown) {
      runningRef.current = false;
      setStatus("error");
      setError(e instanceof Error ? e.message : "Unknown OCR error");
    }
  }, []);

  return { status, progress, text, error, run, reset, cancel };
};
