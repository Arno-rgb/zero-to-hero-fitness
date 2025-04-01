import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Exercise {
  id: string;
  type: 'pushup' | 'situp' | 'squat' | 'run';
  count: number;
  date: string;
  powerGenerated: number;
  formQuality: number; // 0-1 scale, will be used for power multiplier
}

interface ExerciseState {
  history: Exercise[];
  dailyGoals: {
    pushups: number;
    situps: number;
    squats: number;
    runDistance: number; // in kilometers
  };
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string | null;
  totalPowerGenerated: {
    strike: number; // from pushups
    core: number;   // from situps
    force: number;  // from squats
    endurance: number; // from running
  };
}

const initialState: ExerciseState = {
  history: [],
  dailyGoals: {
    pushups: 10,
    situps: 10,
    squats: 10,
    runDistance: 1,
  },
  currentStreak: 0,
  longestStreak: 0,
  lastWorkoutDate: null,
  totalPowerGenerated: {
    strike: 0,
    core: 0,
    force: 0,
    endurance: 0,
  },
};

export const exerciseSlice = createSlice({
  name: 'exercise',
  initialState,
  reducers: {
    addExercise: (state, action: PayloadAction<Exercise>) => {
      state.history.push(action.payload);
      
      // Update power based on exercise type
      const { type, count, powerGenerated } = action.payload;
      if (type === 'pushup') {
        state.totalPowerGenerated.strike += powerGenerated;
      } else if (type === 'situp') {
        state.totalPowerGenerated.core += powerGenerated;
      } else if (type === 'squat') {
        state.totalPowerGenerated.force += powerGenerated;
      } else if (type === 'run') {
        state.totalPowerGenerated.endurance += powerGenerated;
      }
      
      // Update streak
      const today = new Date().toISOString().split('T')[0];
      if (state.lastWorkoutDate !== today) {
        state.currentStreak += 1;
        state.lastWorkoutDate = today;
        
        if (state.currentStreak > state.longestStreak) {
          state.longestStreak = state.currentStreak;
        }
      }
    },
    updateDailyGoals: (state, action: PayloadAction<Partial<ExerciseState['dailyGoals']>>) => {
      state.dailyGoals = { ...state.dailyGoals, ...action.payload };
    },
    resetStreak: (state) => {
      state.currentStreak = 0;
    },
    usePower: (state, action: PayloadAction<{
      strike?: number;
      core?: number;
      force?: number;
      endurance?: number;
    }>) => {
      const { strike = 0, core = 0, force = 0, endurance = 0 } = action.payload;
      state.totalPowerGenerated.strike = Math.max(0, state.totalPowerGenerated.strike - strike);
      state.totalPowerGenerated.core = Math.max(0, state.totalPowerGenerated.core - core);
      state.totalPowerGenerated.force = Math.max(0, state.totalPowerGenerated.force - force);
      state.totalPowerGenerated.endurance = Math.max(0, state.totalPowerGenerated.endurance - endurance);
    },
  },
});

export const { 
  addExercise, 
  updateDailyGoals, 
  resetStreak,
  usePower
} = exerciseSlice.actions;

export default exerciseSlice.reducer;
