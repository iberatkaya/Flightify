import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../../navigation/types";

export type MapViewNavigationProp = StackNavigationProp<RootStackParamList, 'MapView'>;

export interface GeoJSONFeature {
    type: string;
    properties: {
      name: string;
      [key: string]: any;
    } | null;
    geometry: PolygonGeometry | MultiPolygonGeometry | null;
  }

interface PolygonGeometry {
type: 'Polygon';
coordinates: number[][][];
}

interface MultiPolygonGeometry {
type: 'MultiPolygon';
coordinates: number[][][][];
}
