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
