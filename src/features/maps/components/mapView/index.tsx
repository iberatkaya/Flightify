import React from 'react';
import { View, StyleSheet } from 'react-native';
import Color from 'color';
import MapView, { Circle, Polyline, Polygon } from 'react-native-maps';
import { useEffect, useRef, useState } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { loadFromStorage } from '../../slices/flightRecordsSlice';
import AddFlightSheet from '../addFlightBottomsheet';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { GeoJSONFeature } from './types';

// Import with type assertion
const features: GeoJSONFeature[] =
  require('../../../../assets/country_map.json').features;

const MapScreen = () => {
  const dispatch = useAppDispatch();
  const flightRecords = useAppSelector((state) => state.flightRecords.records);
  const [latitudeDelta, setLatitudeDelta] = useState(60);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    dispatch(loadFromStorage());
  }, [dispatch]);

  const [countryColors, setCountryColors] = useState<{ [key: string]: string }>(
    {},
  );

  useEffect(() => {
    // Generate random colors for countries if not already set
    if (Object.keys(countryColors).length === 0) {
      const newColors: { [key: string]: string } = {};

      features.forEach((feature) => {
        if (feature.properties && feature.properties.name) {
          const countryName = feature.properties.name;
          if (!newColors[countryName]) {
            // Generate a random color in hex format
            // Generate a darker random color by using a lower range in the RGB values
            const generateNonGreenColor = () => {
              // Use HSL to avoid green colors (green is around 120 degrees in hue)
              const hue = Math.floor(Math.random() * 360);

              // Skip hues between 90-150 (green range)
              const adjustedHue = hue < 90 ? hue : hue + 60;
              const finalHue = adjustedHue % 360;

              // Lower saturation and lightness for darker colors
              const saturation = 70 + Math.floor(Math.random() * 30); // 70-99%
              const lightness = 15 + Math.floor(Math.random() * 25); // 15-39%

              return `hsl(${finalHue}, ${saturation}%, ${lightness}%)`;
            };

            const randomColor = generateNonGreenColor();
            newColors[countryName] = randomColor;
          }
        }
      });

      setCountryColors(newColors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // State to track visited countries
  const [visitedCountries, setVisitedCountries] = useState<{
    [key: string]: { visitedFrom: boolean; visitedTo: boolean };
  }>({});

  // Update visited countries based on flight records
  useEffect(() => {
    if (flightRecords.length > 0 && features.length > 0) {
      const updatedVisitedCountries = { ...visitedCountries };

      flightRecords.forEach((record) => {
        // Check each country's polygon to see if it contains origin or destination
        features.forEach((feature) => {
          if (!feature.properties || !feature.properties.name) return;

          const countryName = feature.properties.name;
          if (!updatedVisitedCountries[countryName]) {
            updatedVisitedCountries[countryName] = {
              visitedFrom: false,
              visitedTo: false,
            };
          }

          // Check if the origin point is in this country
          if (isPointInCountry(record.origin, feature)) {
            updatedVisitedCountries[countryName].visitedFrom = true;
          }

          // Check if the destination point is in this country
          if (isPointInCountry(record.destination, feature)) {
            updatedVisitedCountries[countryName].visitedTo = true;
          }
        });
      });

      setVisitedCountries(updatedVisitedCountries);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightRecords, features]);

  // Helper function to check if a point is inside a country's polygon
  const isPointInCountry = (
    point: { latitude: number; longitude: number },
    feature: GeoJSONFeature,
  ): boolean => {
    if (!feature.geometry) return false;

    const { latitude, longitude } = point;

    // Basic point-in-polygon check for simplicity
    // For a more accurate implementation, consider using a geo library
    if (feature.geometry.type === 'Polygon') {
      return pointInPolygon(
        [longitude, latitude],
        feature.geometry.coordinates[0] as number[][],
      );
    } else if (feature.geometry.type === 'MultiPolygon') {
      // Check each polygon in the MultiPolygon
      return (feature.geometry.coordinates as number[][][][]).some((polygon) =>
        pointInPolygon([longitude, latitude], polygon[0]),
      );
    }

    return false;
  };

  // Simple point-in-polygon algorithm (ray casting)
  const pointInPolygon = (point: [number, number], polygon: number[][]) => {
    const x = point[0];
    const y = point[1];
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect =
        yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  };

  // Function to get color for a country
  const getCountryColor = (countryName: string) => {
    return countryColors[countryName] || '#CCCCCC'; // Default gray if not found
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 39.8283,
          longitude: -98.5795,
          latitudeDelta: 60,
          longitudeDelta: 60,
        }}
        mapType="satelliteFlyover"
        onRegionChange={(region) => {
          setLatitudeDelta(region.latitudeDelta);
        }}>
        <>
          {/* Country borders from GeoJSON */}
          {features.map((feature, index) => {
            // Skip features without valid geometry or name
            if (
              !feature.geometry ||
              !feature.geometry.coordinates ||
              !feature.properties?.name
            ) {
              return null;
            }

            const countryName = feature.properties.name;
            const countryVisited = visitedCountries[countryName];

            // Skip countries that haven't been visited
            if (
              !countryVisited ||
              (!countryVisited.visitedFrom && !countryVisited.visitedTo)
            ) {
              return null;
            }

            if (feature.geometry.type === 'Polygon') {
              // Handle single Polygon
              const coordinates = feature.geometry.coordinates[0].map(
                (coord) => ({
                  latitude: coord[1],
                  longitude: coord[0],
                }),
              );

              return (
                <Polygon
                  key={`country-${index}`}
                  coordinates={coordinates}
                  strokeColor={countryColors[countryName] || '#CCCCCC'}
                  fillColor={Color(getCountryColor(countryName))
                    .alpha(0.35)
                    .string()}
                  strokeWidth={0.5}
                />
              );
            } else if (feature.geometry.type === 'MultiPolygon') {
              // Handle MultiPolygon by creating multiple Polygon components
              return (
                <React.Fragment key={`country-${index}`}>
                  {feature.geometry.coordinates.map((poly, polyIndex) => (
                    <Polygon
                      key={`country-${index}-part-${polyIndex}`}
                      coordinates={poly[0].map((coord) => ({
                        latitude: coord[1],
                        longitude: coord[0],
                      }))}
                      strokeColor={countryColors[countryName] || '#CCCCCC'}
                      fillColor={Color(getCountryColor(countryName))
                        .alpha(0.35)
                        .string()}
                      strokeWidth={0.5}
                    />
                  ))}
                </React.Fragment>
              );
            }

            return null;
          })}
        </>
        {flightRecords.map((record) => (
          <React.Fragment key={record.id}>
            <Circle
              center={{
                latitude: record.origin.latitude,
                longitude: record.origin.longitude,
              }}
              radius={50000 * (latitudeDelta / 60)}
              fillColor={Color(record.color).alpha(0.5).string()}
              strokeColor={record.color}
              strokeWidth={1}
            />
            <Circle
              center={{
                latitude: record.destination.latitude,
                longitude: record.destination.longitude,
              }}
              radius={50000 * (latitudeDelta / 60)}
              fillColor={Color(record.color).alpha(0.5).string()}
              strokeColor={record.color}
              strokeWidth={1}
            />
            <Polyline
              coordinates={[
                {
                  latitude: record.origin.latitude,
                  longitude: record.origin.longitude,
                },
                {
                  latitude: record.destination.latitude,
                  longitude: record.destination.longitude,
                },
              ]}
              strokeColor={record.color}
              strokeWidth={2}
            />
          </React.Fragment>
        ))}
      </MapView>

      <AddFlightSheet bottomSheetRef={bottomSheetRef} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomSheetContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  listItemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  addFlightContainer: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  half: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default MapScreen;
