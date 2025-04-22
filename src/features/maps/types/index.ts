export interface Location {
  latitude: number;
  longitude: number;
  name: string;
  code: string;
}

export interface FlightRecord {
  id: string;
  departureDate: string;
  arrivalDate: string | null;
  origin: Location;
  destination: Location;
  color: string; 
}
