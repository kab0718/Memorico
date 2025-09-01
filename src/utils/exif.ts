import * as exifr from "exifr";

export interface BasicExif {
  date?: Date;
  latitude?: number;
  longitude?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function coerceDate(value: unknown): Date | undefined {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }
  return undefined;
}

// (reserved) If GPS timestamp is needed later, implement here.

export async function extractBasicExif(file: File): Promise<BasicExif> {
  if (!file.type.startsWith("image/")) {
    return {};
  }

  let gps: unknown;
  let tags: unknown;
  try {
    gps = await exifr.gps(file as Blob);
  } catch {
    gps = undefined;
  }
  try {
    // Parse only needed fields (date)
    tags = await exifr.parse(file as Blob, ["DateTimeOriginal", "CreateDate", "ModifyDate"]);
  } catch {
    tags = undefined;
  }

  const result: BasicExif = {};

  if (isRecord(tags)) {
    const dateRaw = tags["DateTimeOriginal"] ?? tags["CreateDate"] ?? tags["ModifyDate"];
    const date = coerceDate(dateRaw);
    if (date) {
      result.date = date;
    }
  }

  if (isRecord(gps)) {
    const lat = gps["latitude"];
    const lng = gps["longitude"];
    if (typeof lat === "number") {
      result.latitude = lat;
    }
    if (typeof lng === "number") {
      result.longitude = lng;
    }
  }

  return result;
}

export function formatDateTime(d?: Date) {
  if (!d) {
    return undefined;
  }
  try {
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}
