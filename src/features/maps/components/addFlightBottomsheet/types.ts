import BottomSheet from '@gorhom/bottom-sheet';
import { FlightRecord } from '../../types';

export interface Props {
  bottomSheetRef: React.RefObject<BottomSheet>;
  onSelectionModeChange?: (mode: 'origin' | 'destination' | null) => void;
  onSaveFlight?: (flight: FlightRecord) => void;
}
