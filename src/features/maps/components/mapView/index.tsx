import React from 'react';
import { View, StyleSheet } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
import Color from 'color';
import MapView, { Circle, Polyline, Marker, LatLng } from 'react-native-maps';
import { useEffect, useRef, useState } from 'react';
// import { MapViewNavigationProp } from './types';
import BottomSheet from '@gorhom/bottom-sheet';
import { loadFromStorage } from '../../slices/flightRecordsSlice';
import AddFlightSheet from '../addFlightBottomsheet';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';

const MapScreen = () => {
  // const navigation = useNavigation<MapViewNavigationProp>();
  const dispatch = useAppDispatch();
  const flightRecords = useAppSelector((state) => state.flightRecords.records);
  console.log('flightRecords', flightRecords);
  const [latitudeDelta, setLatitudeDelta] = useState(60);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [originCoords, setOriginCoords] = useState<LatLng | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<LatLng | null>(
    null,
  );
  const [selectionMode, setSelectionMode] = useState<
    'origin' | 'destination' | null
  >(null);

  useEffect(() => {
    dispatch(loadFromStorage());
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
        mapType="satelliteFlyover"
        onRegionChange={(region) => {
          setLatitudeDelta(region.latitudeDelta);
        }}
        onRegionChangeStart={(e) => {
          console.log('onRegionChangeStart', e);
        }}
        onLongPress={(e) => {
          if (selectionMode === 'origin') {
            setOriginCoords(e.nativeEvent.coordinate);
            bottomSheetRef.current?.snapToIndex(2);
          } else if (selectionMode === 'destination') {
            setDestinationCoords(e.nativeEvent.coordinate);
            bottomSheetRef.current?.snapToIndex(2);
          }
        }}>
        {originCoords && (
          <Marker coordinate={originCoords} title="Origin" pinColor="green" />
        )}
        {destinationCoords && (
          <Marker
            coordinate={destinationCoords}
            title="Destination"
            pinColor="red"
          />
        )}
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

      <AddFlightSheet
        bottomSheetRef={bottomSheetRef}
        destinationCoords={destinationCoords}
        originCoords={originCoords}
        onSelectionModeChange={setSelectionMode}
        onSaveFlight={(flight) => {
          console.log('onSaveFlight', flight);
          setDestinationCoords(null);
          setOriginCoords(null);
        }}
      />
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
