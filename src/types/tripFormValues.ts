import type { Allowance } from "./allowance";

export interface TripFormValues {
  purpose?: string;
  members: Member[];
  hotels: string[];
  date: { start: string; end: string };
  dayTrip?: boolean;
  allowance?: Allowance[];
}

interface Member {
  name: string;
  episode?: string;
}
