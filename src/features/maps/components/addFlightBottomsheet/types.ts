import BottomSheet from "@gorhom/bottom-sheet";
import { LatLng } from "react-native-maps";
import { FlightRecord } from "../../types";

export interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
  originCoords?: LatLng | null;
  destinationCoords?: LatLng | null;
  onSelectionModeChange?: (mode: 'origin' | 'destination' | null) => void;
  onSaveFlight?: (flight: FlightRecord) => void;
}
