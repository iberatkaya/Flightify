export interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

export interface FlightRecord {
  id: string;
  date: Date;
  origin: Location;
  destination: Location;
  color: string; // New color property
}
