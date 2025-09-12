import type { Allowance } from "./allowance";

export interface TripFormValues {
  purpose?: string;
  members: Member[];
  hotels: string[];
  startDate: Date | null;
  endDate: Date | null;
  dayTrip?: boolean;
  allowance?: Allowance[];
}

interface Member {
  name: string;
  role?: MemberRole;
  episode?: string;
}

export type MemberRole =
  | "leader"
  | "camera"
  | "accountant"
  | "navigator"
  | "driver"
  | "reservation";
