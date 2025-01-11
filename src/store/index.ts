import { configureStore } from '@reduxjs/toolkit';
import flightRecordsReducer from '../features/maps/slices/flightRecordsSlice';

export const store = configureStore({
    reducer: {
        flightRecords: flightRecordsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;