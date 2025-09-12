import type { ImageAsset } from "../types/imageAsset";
import type { TripFormValues } from "../types/tripFormValues";
import { binaryPost } from "./http";
import { DetailJsonBody, ImageFormData } from "./types";

const genUuid = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export async function postImagesAndJson(
  imagesAssets: ImageAsset[],
  formValue: TripFormValues,
): Promise<Blob> {
  const form = new FormData();

  const images: ImageFormData[] = imagesAssets.map((asset) => {
    const clientId = genUuid();
    const fileNameWithId = `${clientId}__${asset.file.name}`;
    form.append("images", asset.file, fileNameWithId);
    return {
      clientId,
      fileName: asset.file.name,
      placeName: asset.placeName,
      dateTime: asset.dateTime ? asset.dateTime.toISOString() : null,
    };
  });

  const detailJson: DetailJsonBody = {
    trip: {
      purpose: formValue.purpose,
      members: formValue.members,
      hotels: formValue.hotels,
      startDate: formValue.startDate ? formValue.startDate.toISOString() : null,
      endDate: formValue.endDate ? formValue.endDate.toISOString() : null,
      dayTrip: formValue.dayTrip,
      // allowanceの詳細な型はそのまま保持（数値・文字列のみでJSON化可能）
      allowance: formValue.allowance,
    },
    images,
  };

  const jsonBlob = new Blob([JSON.stringify(detailJson)], {
    type: "application/json",
  });
  form.append("detailJson", jsonBlob, "detail.json");

  console.log("Posting form image:", form.getAll("images"));
  console.log("Posting detailJson:", detailJson);
  console.log("Posting detailJson blob:", form.getAll("detailJson"));

  // 既存のHTTPユーティリティを利用して送信（Content-Typeはmultipartを指定し、内部で削除してboundaryをブラウザに任せる）
  return binaryPost("", { "Content-Type": "multipart/form-data" }, form);
}
