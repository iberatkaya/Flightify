import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { RootState } from './';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './';

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAppDispatch: () => AppDispatch = useDispatch;
