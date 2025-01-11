import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import BottomSheet, { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { FlightRecord } from '../../types';
import { Props } from './types';
import { addFlightRecord, removeFlightRecord } from '../../slices/flightRecordsSlice';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../../store/hooks';



const AddFlightSheet = ({ bottomSheetRef }: Props) => {
  const flightRecords = useAppSelector((state) => state.flightRecords.records);
  const [isAddingFlight, setIsAddingFlight] = useState(false);
  const [origin, setOrigin] = useState({ latitude: '', longitude: '', name: '' });
  const [destination, setDestination] = useState({ latitude: '', longitude: '', name: '' });
  const [errors, setErrors] = useState({ originLat: '', originLong: '', destLat: '', destLong: '' });
  const dispatch = useDispatch();


  const addFlightRecordToState = async (record: FlightRecord) => {
    try {
      dispatch(addFlightRecord(record));
    } catch (error) {
      console.error('Error saving flight record:', error);
    }
  };

  const removeFlightRecordFromState = async (id: string) => {
    try {
      dispatch(removeFlightRecord(id));
    } catch (error) {
      console.error('Error removing flight record:', error);
    }
  };

  const isValidCoordinate = (value: string): boolean => {
    const num = parseFloat(value);
    return !isNaN(num) && value.trim() !== '';
  };

  const handleAddFlight = () => {
    setErrors({ originLat: '', originLong: '', destLat: '', destLong: '' });

    const validationErrors = {
      originLat: !isValidCoordinate(origin.latitude) ? 'Invalid latitude' : '',
      originLong: !isValidCoordinate(origin.longitude) ? 'Invalid longitude' : '',
      destLat: !isValidCoordinate(destination.latitude) ? 'Invalid latitude' : '',
      destLong: !isValidCoordinate(destination.longitude) ? 'Invalid longitude' : ''
    };

    if (Object.values(validationErrors).every(error => error === '')) {
      const record: FlightRecord = {
        id: Date.now().toString(),
        date: new Date(),
        origin: {
          latitude: parseFloat(origin.latitude),
          longitude: parseFloat(origin.longitude),
          name: origin.name
        },
        destination: {
          latitude: parseFloat(destination.latitude),
          longitude: parseFloat(destination.longitude),
          name: destination.name
        }
      };
      addFlightRecordToState(record);
      setIsAddingFlight(false);
      setOrigin({ latitude: '', longitude: '', name: '' });
      setDestination({ latitude: '', longitude: '', name: '' });
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['50%', '75%']}
    >
      <BottomSheetView style={styles.bottomSheetContent}>
        {!isAddingFlight ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Flight Records</Text>
              <Pressable
                style={styles.addButton}
                onPress={() => {
                  bottomSheetRef.current?.snapToIndex(2);
                  setIsAddingFlight(true)
                }}
              >
                <Text style={styles.addButtonText}>+ Add Flight</Text>
              </Pressable>
            </View>
            {flightRecords.map((record) => (
              <View key={record.id} style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemText}>
                    {`${record.origin.name} → ${record.destination.name}`}
                  </Text>
                  <Text style={styles.listItemSubtext}>
                    {new Date(record.date).toLocaleDateString()}
                  </Text>
                </View>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => removeFlightRecordFromState(record.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.addFlightContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Add New Flight</Text>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsAddingFlight(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>

            <Text>Origin</Text>
            <BottomSheetTextInput
              style={styles.input}
              placeholder="Name"
              value={origin.name}
              onChangeText={(text) => setOrigin({ ...origin, name: text })}
            />
            <View style={styles.row}>
              <BottomSheetTextInput
                style={[styles.input, styles.half]}
                placeholder="Latitude"
                value={origin.latitude}
                onChangeText={(text) => setOrigin({ ...origin, latitude: text })}
                keyboardType="numeric"
              />
              <BottomSheetTextInput
                style={[styles.input, styles.half]}
                placeholder="Longitude"
                value={origin.longitude}
                onChangeText={(text) => setOrigin({ ...origin, longitude: text })}
                keyboardType="numeric"
              />
            </View>

            <Text>Destination</Text>
            <BottomSheetTextInput
              style={styles.input}
              placeholder="Name"
              value={destination.name}
              onChangeText={(text) => setDestination({ ...destination, name: text })}
            />
            <View style={styles.row}>
              <BottomSheetTextInput
                style={[styles.input, styles.half]}
                placeholder="Latitude"
                value={destination.latitude}
                onChangeText={(text) => setDestination({ ...destination, latitude: text })}
                keyboardType="numeric"
              />
              <BottomSheetTextInput
                style={[styles.input, styles.half]}
                placeholder="Longitude"
                value={destination.longitude}
                onChangeText={(text) => setDestination({ ...destination, longitude: text })}
                keyboardType="numeric"
              />
            </View>

            <Pressable style={styles.saveButton} onPress={handleAddFlight}>
              <Text style={styles.saveButtonText}>Save Flight</Text>
            </Pressable>
          </View>
        )}
      </BottomSheetView>
    </BottomSheet>
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

export default AddFlightSheet;