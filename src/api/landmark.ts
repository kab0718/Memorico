import { get } from "./http";
import { LandmarkDataItem } from "./types";

export async function fetchLandmarkData(lat: number, lon: number): Promise<string> {
  const res = await get<LandmarkDataItem>("landmarkData", { lat, lon });

  return res.ResultSet.Result[0].Name;
}
