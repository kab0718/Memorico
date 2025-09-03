export interface TripFormValues {
  purpose?: string;
  members: Member[];
  hotels: string[];
  date: { start: string; end: string };
  dayTrip?: boolean;
}

interface Member {
  name: string;
  episode?: string;
}
