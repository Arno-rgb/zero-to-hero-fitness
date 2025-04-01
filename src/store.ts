import { configureStore } from '@reduxjs/toolkit';
import userReducer from './features/user/userSlice';
import exerciseReducer from './features/exercise/exerciseSlice';
import battleReducer from './features/battle/battleSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    exercise: exerciseReducer,
    battle: battleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
