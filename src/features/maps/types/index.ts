export interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

export interface FlightRecord {
  id: string;
  date: string;
  origin: Location;
  destination: Location;
  color: string; // New color property
}
