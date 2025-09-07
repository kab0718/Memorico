import { ApiError, HeadersType, QueryType } from "./types";

const toQuery = (q: QueryType) => {
  const sp = new URLSearchParams();
  Object.entries(q).forEach(([k, v]) => {
    if (v === undefined || v === null) {
      return;
    }
    sp.append(k, String(v));
  });

  const s = sp.toString();
  return s ? `?${s}` : "";
};

export async function get<T>(path: string, query: QueryType, headers?: HeadersType): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const url = `${baseUrl}/${path}${toQuery(query)}`;
  const req: RequestInit = { method: "GET", headers };

  const res = await fetch(url, req);
  const text = await res.text();
  const data = JSON.parse(text);

  if (!res.ok) {
    const message = (data && (data.message || data.title)) || res.statusText || "API Error";
    throw new ApiError(message, res.status, url, data);
  }

  return data;
}

export async function jsonPost<TRes>(
  path: string,
  headers: HeadersType,
  body: FormData,
): Promise<TRes> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const url = `${baseUrl}/${path}`;
  const req: RequestInit = { method: "POST", headers };

  // multipart は呼び出し側で FormData を渡し、Content-Type はブラウザに任せる
  req.body = body;
  delete headers["Content-Type"];

  const res = await fetch(url, req);
  const text = await res.text();
  const data = JSON.parse(text);

  if (!res.ok) {
    const message = (data && (data.message || data.title)) || res.statusText || "API Error";
    throw new ApiError(message, res.status, url, data);
  }

  return data;
}

export async function binaryPost(
  path: string,
  headers: HeadersType,
  body: FormData,
): Promise<Blob> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const url = `${baseUrl}/${path}`;
  const req: RequestInit = { method: "POST", headers };

  // multipart は呼び出し側で FormData を渡し、Content-Type はブラウザに任せる
  req.body = body;
  delete headers["Content-Type"];

  const res = await fetch(url, req);
  if (!res.ok) {
    const message = res.statusText || "API Error";
    throw new ApiError(message, res.status, url);
  }

  // PDFなどのバイナリを返却
  return res.blob();
}
