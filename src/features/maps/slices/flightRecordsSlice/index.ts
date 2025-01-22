// src/store/flightRecords/flightRecordsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { FlightRecord } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const flightStorageService = {
    async saveFlights(records: FlightRecord[]): Promise<void> {
        await AsyncStorage.setItem(FLIGHT_STORAGE_KEY, JSON.stringify(records));
    },
    async loadFlights(): Promise<FlightRecord[]> {
        const data = await AsyncStorage.getItem(FLIGHT_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    },
    async saveNewFlight(flight: FlightRecord): Promise<void> {
        const existingFlights = await this.loadFlights();
        existingFlights.push(flight);
        await this.saveFlights(existingFlights);
    },
    async deleteFlight(flightId: string): Promise<void> {
        const existingFlights = await this.loadFlights();
        const updatedFlights = existingFlights.filter(flight => flight.id !== flightId);
        await this.saveFlights(updatedFlights);
    },
};

const FLIGHT_STORAGE_KEY = 'flightRecords';

interface FlightRecordsState {
    records: FlightRecord[];
    loading: boolean;
    error: string | null;
}

const initialState: FlightRecordsState = {
    records: [],
    loading: false,
    error: null,
};

export const syncStorage = createAsyncThunk(
    'flightRecords/sync',
    async (records: FlightRecord[]) => {
        await flightStorageService.saveFlights(records);
        return records;
    }
);

export const loadFromStorage = createAsyncThunk(
    'flightRecords/load',
    async () => await flightStorageService.loadFlights()
);

export const deleteFlight = createAsyncThunk(
    'flightRecords/delete',
    async (flightId: string) => {
        await flightStorageService.deleteFlight(flightId);
        return flightId;
    }
);

export const addFlight = createAsyncThunk(
    'flightRecords/add',
    async (flight: FlightRecord) => {
        await flightStorageService.saveNewFlight(flight);
        return flight;
    }
);

export const flightRecordsSlice = createSlice({
    name: 'flightRecords',
    initialState,
    reducers: {
    },
    extraReducers: (builder) => {
        builder
            .addCase(syncStorage.pending, (state) => {
                state.loading = true;
            })
            .addCase(syncStorage.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(syncStorage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Storage sync failed';
            })
            .addCase(loadFromStorage.fulfilled, (state, action) => {
                state.records = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteFlight.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteFlight.fulfilled, (state, action) => {
                state.records = state.records.filter(record => record.id !== action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(deleteFlight.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Delete operation failed';
            })
            .addCase(addFlight.pending, (state) => {
                state.loading = true;
            })
            .addCase(addFlight.fulfilled, (state, action) => {
                state.records.push(action.payload);
                state.loading = false;
                state.error = null;
            })
            .addCase(addFlight.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Add operation failed';
            });
    },
});

export const {  } = flightRecordsSlice.actions;
export default flightRecordsSlice.reducer;
