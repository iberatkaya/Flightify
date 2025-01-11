import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Circle, Polyline } from 'react-native-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { MapViewNavigationProp } from './types';
import { FlightRecord } from '../../types';
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { FLIGHT_STORAGE_KEY } from '../../constants';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { addFlightRecord, removeFlightRecord, setFlightRecords } from '../../slices/flightRecordsSlice';
import AddFlightSheet from '../addFlightBottomsheet';

export default function MapScreen() {
  const navigation = useNavigation<MapViewNavigationProp>();
  const dispatch = useDispatch();
  const flightRecords = useSelector((state: RootState) => state.flightRecords.records);
  const [latitudeDelta, setLatitudeDelta] = useState(60);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    const loadFlightRecords = async () => {
      try {
        const storedRecords = await AsyncStorage.getItem(FLIGHT_STORAGE_KEY);
        if (storedRecords) {
          dispatch(setFlightRecords(JSON.parse(storedRecords)));
        }
      } catch (error) {
        console.error('Error loading flight records:', error);
      }
    };
    loadFlightRecords();
  }, [dispatch]);


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
        mapType='satelliteFlyover'
        onRegionChange={(region) => {
          setLatitudeDelta(region.latitudeDelta);
        }}
      >
        {flightRecords.map((record) => (
          <React.Fragment key={record.id}>
            <Circle
              center={{
                latitude: record.origin.latitude,
                longitude: record.origin.longitude,
              }}
              radius={50000 * (latitudeDelta / 60)} // Scales with zoom level
              fillColor="rgba(220, 220, 255, 0.8)" // Modern blue with lower opacity
              strokeColor="#2563eb" // Solid modern blue
              strokeWidth={1}
            />
            <Circle
              center={{
                latitude: record.destination.latitude,
                longitude: record.destination.longitude,
              }}
              radius={50000 * (latitudeDelta / 60)}
              fillColor="rgba(220, 220, 255, 0.8)" // Modern blue with lower opacity
              strokeColor="#2563eb" // Solid modern blue
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
                }
              ]}
              strokeColor="#3b82f6" // Slightly lighter blue for the connection line
              strokeWidth={2}
            />
          </React.Fragment>
        ))}
      </MapView>

      <AddFlightSheet
        bottomSheetRef={bottomSheetRef}
      />
    </View>
  );
}

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