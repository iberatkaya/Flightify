// src/store/flightRecords/flightRecordsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { FlightRecord } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const flightStorageService = {
    async saveFlights(records: FlightRecord[]): Promise<void> {
        await AsyncStorage.setItem(FLIGHT_STORAGE_KEY, JSON.stringify(records));
    },
    async loadFlights(): Promise<FlightRecord[]> {
        const data = await AsyncStorage.getItem(FLIGHT_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }
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

export const flightRecordsSlice = createSlice({
    name: 'flightRecords',
    initialState,
    reducers: {
        setFlightRecords: (state, action: PayloadAction<FlightRecord[]>) => {
            state.records = action.payload;
        },
        addFlightRecord: (state, action: PayloadAction<FlightRecord>) => {
            state.records.push(action.payload);
        },
        removeFlightRecord: (state, action: PayloadAction<string>) => {
            state.records = state.records.filter(record => record.id !== action.payload);
        },
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
            });
    },
});

export const { setFlightRecords, addFlightRecord, removeFlightRecord } = flightRecordsSlice.actions;
export default flightRecordsSlice.reducer;