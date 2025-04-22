import BottomSheet from '@gorhom/bottom-sheet';
import { FlightRecord } from '../../types';

export interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onSelectionModeChange?: (mode: 'origin' | 'destination' | null) => void;
  onSaveFlight?: (flight: FlightRecord) => void;
}

// Define the type for each airport in the JSON
type Airport = {
  name: string;
  city: string;
  country: string;
  iata: string;
  icao: string;
  lat: number;
  lon: number;
  alt: number;
  tz: string;
};

// Define the type for the entire airports object
export type AirportsData = {
  [key: string]: Airport;
}
