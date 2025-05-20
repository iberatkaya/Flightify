import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  InteractionManager,
  Switch,
  Alert,
} from 'react-native';
import BottomSheet, {
  BottomSheetFlatList,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { v4 as uuidv4 } from 'uuid';
import { AutocompleteDropdown } from 'react-native-autocomplete-dropdown';
import DatePicker from 'react-native-date-picker';
import { FlightRecord } from '../../types';
import { AirportsData, Props } from './types';
import { addFlight, deleteFlight } from '../../slices/flightRecordsSlice';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { generateRandomColor } from '../../utils';

// Import with type annotation
const airports: AirportsData = require('../../../../assets/large_airports.json');

// At the top of the file, add color constants
const MAP_COLORS = {
  origin: '#10B981', // Modern emerald green
  destination: '#F43F5E', // Modern rose/coral red
  inactive: '#94A3B8', // Slate gray for inactive state
};

const AddFlightSheet = ({ bottomSheetRef, onSaveFlight }: Props) => {
  const flightRecords = useAppSelector((state) => state.flightRecords.records);
  const [isAddingFlight, setIsAddingFlight] = useState(false);
  const [isEditingFlight, setIsEditingFlight] = useState(false);
  const [currentEditingFlightId, setCurrentEditingFlightId] = useState<
    string | null
  >(null);
  const [originAirportCode, setOriginAirportCode] = useState('');
  const [destinationAirportCode, setDestinationAirportCode] = useState('');
  const [departureFlightDate, setDepartureFlightDate] = useState(new Date());
  const [arrivalFlightDate, setArrivalFlightDate] = useState<Date | null>(null);
  const [openDepartureDateModal, setOpenDepartureDateModal] = useState(false);
  const [openArrivalDateModal, setOpenArrivalDateModal] = useState(false);
  const [returnFlightToggleEnabled, setReturnFlightToggleEnabled] =
    useState(false);
  const dispatch = useAppDispatch();

  // Reset form state function
  const resetFormState = () => {
    setOriginAirportCode('');
    setDestinationAirportCode('');
    setDepartureFlightDate(new Date());
    setArrivalFlightDate(null);
    setReturnFlightToggleEnabled(false);
    setCurrentEditingFlightId(null);
  };

  // Function to start editing a flight
  const startEditingFlight = (flightId: string) => {
    const flightToEdit = flightRecords.find((record) => record.id === flightId);

    if (flightToEdit) {
      // Find airport code from stored coordinates
      const findAirportCode = (lat: number, lon: number): string => {
        // Find the closest airport based on coordinates
        return (
          Object.entries(airports).find(
            ([_, airport]) => airport.lat === lat && airport.lon === lon,
          )?.[0] || ''
        );
      };

      setOriginAirportCode(
        findAirportCode(
          flightToEdit.origin.latitude,
          flightToEdit.origin.longitude,
        ),
      );
      setDestinationAirportCode(
        findAirportCode(
          flightToEdit.destination.latitude,
          flightToEdit.destination.longitude,
        ),
      );
      setDepartureFlightDate(new Date(flightToEdit.departureDate));

      if (flightToEdit.arrivalDate) {
        setArrivalFlightDate(new Date(flightToEdit.arrivalDate));
        setReturnFlightToggleEnabled(true);
      } else {
        setArrivalFlightDate(null);
        setReturnFlightToggleEnabled(false);
      }

      setCurrentEditingFlightId(flightId);
      setIsEditingFlight(true);
      setIsAddingFlight(false);
      bottomSheetRef.current?.snapToIndex(1);
    }
  };

  // Handle edit flight submission
  const handleEditFlight = () => {
    if (!currentEditingFlightId) return;

    // Return early if dates are invalid
    if (
      returnFlightToggleEnabled &&
      arrivalFlightDate &&
      departureFlightDate >= arrivalFlightDate
    ) {
      Alert.alert('Arrival date must be later than departure date');
      return;
    }

    const updatedRecord: FlightRecord = {
      id: uuidv4(),
      departureDate: departureFlightDate.toISOString(),
      arrivalDate: returnFlightToggleEnabled
        ? arrivalFlightDate?.toISOString() ?? null
        : null,
      origin: {
        latitude: airports[originAirportCode].lat,
        longitude: airports[originAirportCode].lon,
        name: airports[originAirportCode].city,
        code: airports[originAirportCode].iata,
      },
      destination: {
        latitude: airports[destinationAirportCode].lat,
        longitude: airports[destinationAirportCode].lon,
        name: airports[destinationAirportCode].city,
        code: airports[destinationAirportCode].iata,
      },
      // Keep the existing color
      color:
        flightRecords.find((r) => r.id === currentEditingFlightId)?.color ||
        generateRandomColor(),
    };

    // Delete old flight and add updated one
    dispatch(deleteFlight(currentEditingFlightId));
    dispatch(addFlight(updatedRecord));

    if (onSaveFlight) {
      onSaveFlight(updatedRecord);
    }

    // Reset state and go back to list view
    resetFormState();
    setIsEditingFlight(false);
    bottomSheetRef.current?.snapToIndex(0);
  };

  const removeFlightRecordFromState = async (id: string) => {
    try {
      dispatch(deleteFlight(id));
    } catch (error) {
      console.error('Error removing flight record:', error);
    }
  };

  const handleAddFlight = () => {
    // Return early if dates are invalid
    if (
      returnFlightToggleEnabled &&
      arrivalFlightDate &&
      departureFlightDate >= arrivalFlightDate
    ) {
      Alert.alert('Arrival date must be later than departure date');
      return;
    }
    const record: FlightRecord = {
      id: uuidv4(),
      departureDate: departureFlightDate.toISOString(),
      arrivalDate: returnFlightToggleEnabled
        ? arrivalFlightDate?.toISOString() ?? new Date().toISOString()
        : null,
      origin: {
        latitude: airports[originAirportCode].lat,
        longitude: airports[originAirportCode].lon,
        name: airports[originAirportCode].city,
        code: airports[originAirportCode].iata,
      },
      destination: {
        latitude: airports[destinationAirportCode].lat,
        longitude: airports[destinationAirportCode].lon,
        name: airports[destinationAirportCode].city,
        code: airports[destinationAirportCode].iata,
      },
      color: generateRandomColor(), // Add random color
    };

    dispatch(addFlight(record));
    onSaveFlight?.(record);

    // Reset form after adding
    resetFormState();
    setIsAddingFlight(false);
    bottomSheetRef.current?.snapToIndex(0);
  };

  const dataSet = React.useMemo(
    () =>
      Object.entries(airports).map((i) => ({
        title: `${i[1].name} ###${i[1].iata} ${i[1].city}`,
        id: i[0],
        iata: i[1].iata,
        city: i[1].city,
      })),
    [],
  );

  const content = () => {
    if (!isAddingFlight && !isEditingFlight) {
      return (
        <BottomSheetView style={styles.bottomSheetContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Flight Records</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => {
                bottomSheetRef.current?.snapToIndex(1);
                InteractionManager.runAfterInteractions(() => {
                  resetFormState();
                  setIsAddingFlight(true);
                });
              }}>
              <Text style={styles.addButtonText}>+ Add Flight</Text>
            </Pressable>
          </View>
          <BottomSheetFlatList
            data={flightRecords}
            keyExtractor={(record) => record.id}
            renderItem={({ item: record }) => (
              <Pressable
                onPress={() => startEditingFlight(record.id)}
                style={styles.listItem}>
                <View style={styles.listItemContent}>
                  <View style={styles.flightDirectionRow}>
                    <Text style={styles.textFlightRowContainer}>
                      <Text style={styles.listItemText}>
                        {record.origin.name + ' (' + record.origin.code + ')'}
                      </Text>
                      <Text style={[styles.arrowText, { color: record.color }]}>
                        {' '}
                        →{' '}
                      </Text>
                      <Text style={styles.listItemText}>
                        {record.destination.name +
                          ' (' +
                          record.destination.code +
                          ')'}
                      </Text>
                    </Text>
                  </View>
                  <Text style={styles.listItemSubtext}>
                    Departure:{' '}
                    {new Date(record.departureDate).toLocaleDateString()}
                  </Text>
                  {record.arrivalDate && (
                    <Text style={styles.listItemSubtext}>
                      Arrival:{' '}
                      {new Date(record.arrivalDate).toLocaleDateString()}
                    </Text>
                  )}
                  <Text style={styles.tapToEditText}>Tap to edit</Text>
                </View>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    removeFlightRecordFromState(record.id);
                  }}
                  style={styles.deleteButton}>
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </Pressable>
              </Pressable>
            )}
          />
        </BottomSheetView>
      );
    }

    // Common form for both add and edit modes
    return (
      <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {isAddingFlight ? 'Add New Flight' : 'Edit Flight'}
          </Text>
          <Pressable
            style={styles.closeButton}
            onPress={() => {
              setIsAddingFlight(false);
              setIsEditingFlight(false);
              resetFormState();
              bottomSheetRef.current?.snapToIndex(0);
            }}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Origin</Text>
          <AutocompleteDropdown
            dataSet={dataSet}
            onSelectItem={(item) => {
              setOriginAirportCode(item?.id || '');
              bottomSheetRef.current?.snapToIndex(1);
            }}
            textInputProps={{
              value: originAirportCode
                ? dataSet
                    .find((item) => item.id === originAirportCode)
                    ?.title?.split('###')[0] || ''
                : undefined,
            }}
            editable={
              !originAirportCode || (isEditingFlight && !isAddingFlight)
            }
            renderItem={(item) => {
              return (
                <View style={styles.dropdownItem}>
                  <Text style={styles.buttonText}>
                    {item.title?.split('###')[0]}
                  </Text>
                </View>
              );
            }}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Destination</Text>
          <AutocompleteDropdown
            dataSet={dataSet}
            onSelectItem={(item) => {
              setDestinationAirportCode(item?.id || '');
              bottomSheetRef.current?.snapToIndex(1);
            }}
            textInputProps={{
              value: destinationAirportCode
                ? dataSet
                    .find((item) => item.id === destinationAirportCode)
                    ?.title?.split('###')[0] || ''
                : undefined,
            }}
            editable={!destinationAirportCode}
            renderItem={(item) => {
              return (
                <View style={styles.dropdownItem}>
                  <Text style={styles.buttonText}>
                    {item.title?.split('###')[0]}
                  </Text>
                </View>
              );
            }}
          />
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Departure Flight Date</Text>
          <Pressable onPress={() => setOpenDepartureDateModal(true)}>
            <Text style={styles.textInput}>
              {departureFlightDate.toLocaleDateString()}
            </Text>
          </Pressable>

          {returnFlightToggleEnabled && (
            <View style={styles.returnDateContainer}>
              <Text style={styles.cardTitle}>Arrival Flight Date</Text>
              <Pressable onPress={() => setOpenArrivalDateModal(true)}>
                <Text style={styles.textInput}>
                  {arrivalFlightDate?.toLocaleDateString() ?? null}
                </Text>
              </Pressable>
            </View>
          )}

          <View style={styles.returnRow}>
            <Text style={styles.returnText}>Return Flight</Text>
            <Switch
              trackColor={{ false: '#CBD5E1', true: '#60A5FA' }}
              thumbColor={returnFlightToggleEnabled ? '#F8FAFC' : '#F2F2F2'}
              ios_backgroundColor="#CBD5E1"
              onValueChange={() =>
                setReturnFlightToggleEnabled(!returnFlightToggleEnabled)
              }
              value={returnFlightToggleEnabled}
              style={styles.returnSwitch}
            />
          </View>
        </View>
        <Pressable
          style={styles.saveButton}
          onPress={isEditingFlight ? handleEditFlight : handleAddFlight}>
          <Text style={styles.saveButtonText}>
            {isEditingFlight ? 'Update Flight' : 'Save Flight'}
          </Text>
        </Pressable>
      </BottomSheetScrollView>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={['30%', '75%']}
      enableDynamicSizing={false}>
      {content()}
      <DatePicker
        modal
        open={openDepartureDateModal}
        date={departureFlightDate}
        onConfirm={(date) => {
          setOpenDepartureDateModal(false);
          setDepartureFlightDate(date);
          // If arrival date exists and is earlier than new departure date, update it
          if (arrivalFlightDate && date >= arrivalFlightDate) {
            setArrivalFlightDate(
              new Date(date.getTime() + 24 * 60 * 60 * 1000),
            );
          }
        }}
        onCancel={() => {
          setOpenDepartureDateModal(false);
        }}
        mode="date"
      />
      <DatePicker
        modal
        open={openArrivalDateModal}
        date={arrivalFlightDate ?? new Date()}
        minimumDate={
          new Date(departureFlightDate.getTime() + 24 * 60 * 60 * 1000)
        }
        onConfirm={(date) => {
          setOpenArrivalDateModal(false);
          setArrivalFlightDate(date);
        }}
        onCancel={() => {
          setOpenArrivalDateModal(false);
        }}
        mode="date"
      />
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
    padding: 16,
    paddingBottom: 32,
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
  flightDirectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textFlightRowContainer: {
    marginRight: 4,
  },
  arrowText: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  listItemText: {
    fontSize: 17,
    fontWeight: '500',
  },
  listItemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButtonText: {
    fontSize: 13,
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
  returnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  returnText: {
    fontSize: 14,
    color: '#1F2937',
    marginTop: 12,
    marginRight: 8,
  },
  returnSwitch: {
    marginTop: 12,
    alignSelf: 'flex-end',
    marginRight: 4,
  },
  returnDateContainer: {
    marginTop: 16,
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
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  tapToEditText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
});

export default AddFlightSheet;
