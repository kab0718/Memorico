import { BasicExif } from "../utils/exif";

export interface MediaExif {
  status: "pending" | "ok" | "error";
  exif?: BasicExif;
}
