import { ImageAsset } from "../types/imageAsset";
import { TripFormValues } from "../types/tripFormValues";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly url: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type HeadersType = Record<string, string>;

export type QueryType = Record<string, string | number | boolean | undefined | null>;

export interface LandmarkDataItem {
  ResultSet: {
    Result: Result[];
  };
}

interface Result {
  Name: string;
  Category: string;
  Combined: string;
  Label: string;
}

export interface DetailJsonBody {
  trip: TripFormData;
  images: ImageFormData[];
}

export interface TripFormData extends Omit<TripFormValues, "startDate" | "endDate"> {
  startDate: string | null;
  endDate: string | null;
}

export interface ImageFormData extends Omit<ImageAsset, "file" | "dateTime"> {
  clientId: string;
  fileName: string;
  dateTime: string | null;
}
