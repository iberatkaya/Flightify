import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Text, Alert } from 'react-native';
import BottomSheet, {
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { FlightRecord } from '../../types';
import { Props } from './types';
import { addFlight, deleteFlight } from '../../slices/flightRecordsSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { generateRandomColor } from '../../utils';

// At the top of the file, add color constants
const MAP_COLORS = {
  origin: '#10B981', // Modern emerald green
  destination: '#F43F5E', // Modern rose/coral red
  inactive: '#94A3B8', // Slate gray for inactive state
};

const AddFlightSheet = ({
  bottomSheetRef,
  originCoords,
  destinationCoords,
  onSelectionModeChange,
  onSaveFlight,
}: Props) => {
  const flightRecords = useAppSelector((state) => state.flightRecords.records);
  const [isAddingFlight, setIsAddingFlight] = useState(false);
  const [selectionMode, setSelectionMode] = useState<
    'origin' | 'destination' | null
  >(null);
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const dispatch = useAppDispatch();

  const removeFlightRecordFromState = async (id: string) => {
    try {
      dispatch(deleteFlight(id));
    } catch (error) {
      console.error('Error removing flight record:', error);
    }
  };

  const handleAddFlight = () => {
    if (!originCoords || !destinationCoords) {
      Alert.alert('Please select both origin and destination locations');
      return;
    }

    if (!originCity || !destinationCity) {
      Alert.alert('Please enter both origin and destination city names');
      return;
    }
    const record: FlightRecord = {
      id: Date.now().toString(),
      date: new Date(),
      origin: {
        latitude: originCoords.latitude,
        longitude: originCoords.longitude,
        name: originCity,
      },
      destination: {
        latitude: destinationCoords.latitude,
        longitude: destinationCoords.longitude,
        name: destinationCity,
      },
      color: generateRandomColor(), // Add random color
    };

    dispatch(addFlight(record));
    onSaveFlight?.(record);

    setIsAddingFlight(false);
  };

  useEffect(() => {
    if (selectionMode) {
      onSelectionModeChange?.(selectionMode);
    }
  });

  return (
    <BottomSheet ref={bottomSheetRef} index={0} snapPoints={['30%', '75%']}>
      <BottomSheetView style={styles.bottomSheetContent}>
        {!isAddingFlight ? (
          <>
            <View style={styles.header}>
              <Text style={styles.title}>Flight Records</Text>
              <Pressable
                style={styles.addButton}
                onPress={() => {
                  bottomSheetRef.current?.snapToIndex(2);
                  setIsAddingFlight(true);
                }}>
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
                  onPress={() => removeFlightRecordFromState(record.id)}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>
            ))}
          </>
        ) : (
          <View>
            <View style={styles.header}>
              <Text style={styles.title}>Add New Flight</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => {
                  setIsAddingFlight(false);
                  setSelectionMode(null);
                  bottomSheetRef.current?.snapToIndex(0);
                }}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Origin</Text>
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[
                    styles.selectButton,
                    selectionMode === 'origin' && styles.activeOriginButton,
                  ]}
                  onPress={() => {
                    setSelectionMode('origin');
                    bottomSheetRef.current?.snapToIndex(1);
                  }}>
                  <Text style={styles.buttonText}>
                    {originCoords ? '✓ Origin Selected' : 'Select Origin'}
                  </Text>
                </Pressable>
              </View>
              <BottomSheetTextInput
                placeholder="Origin City"
                value={originCity}
                onChangeText={setOriginCity}
                style={styles.textInput}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Destination</Text>
              <View style={styles.buttonContainer}>
                <Pressable
                  style={[
                    styles.selectButton,
                    selectionMode === 'destination' &&
                      styles.activeDestinationButton,
                  ]}
                  onPress={() => {
                    setSelectionMode('destination');
                    bottomSheetRef.current?.snapToIndex(1);
                  }}>
                  <Text style={styles.buttonText}>
                    {destinationCoords
                      ? '✓ Destination Selected'
                      : 'Select Destination'}
                  </Text>
                </Pressable>
              </View>
              <BottomSheetTextInput
                placeholder="Destination City"
                value={destinationCity}
                onChangeText={setDestinationCity}
                style={styles.textInput}
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
    marginHorizontal: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  selectButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: MAP_COLORS.inactive,
  },
  activeOriginButton: {
    backgroundColor: MAP_COLORS.origin,
  },
  activeDestinationButton: {
    backgroundColor: MAP_COLORS.destination,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
  },
  helpText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
  },
  inputContainer: {
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  textInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1F2937',
  },
  buttonContainer: {
    marginBottom: 12,
  },
  closeButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AddFlightSheet;
