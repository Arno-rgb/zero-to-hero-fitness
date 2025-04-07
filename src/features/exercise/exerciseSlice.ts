import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store'; // Adjust path if needed
import { addExerciseRecord, getExercisesByDate, ExerciseData } from '../../utils/database'; // Adjust path if needed
// Import the action from userSlice
import { addEnergy } from '../user/userSlice'; // Adjust path if needed

// --- State and Types ---
export type ExerciseType = 'pushup' | 'situp' | 'squat' | 'run';
export interface Exercise extends ExerciseData {}

interface ExerciseState {
    todayExercises: Exercise[];
    history: Exercise[];
    dailyGoals: { pushups: number; situps: number; squats: number; runDistance: number; };
    currentStreak: number;
    longestStreak: number;
    lastWorkoutDate: string | null;
    // --- Changed totalPowerGenerated to single totalPower ---
    totalPower: number;
    // -------------------------------------------------------
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ExerciseState = {
    todayExercises: [],
    history: [],
    dailyGoals: { pushups: 10, situps: 10, squats: 10, runDistance: 1 }, // Example goals
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    // --- Initialize single totalPower ---
    totalPower: 0,
    // ------------------------------------
    status: 'idle',
    error: null,
};

// --- Async Thunks (remain the same, but addExercise.fulfilled logic changes) ---
export const fetchTodayExercises = createAsyncThunk<Exercise[], string, { state: RootState }>(
    'exercise/fetchToday',
    async (userId, { rejectWithValue }) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await getExercisesByDate(userId, today);
            return response as Exercise[];
        } catch (error: any) { return rejectWithValue(error.message); }
    }
);

interface AddExercisePayload { userId: string; exercise: Omit<Exercise, 'id'>; }
export const addExercise = createAsyncThunk<Exercise, AddExercisePayload, { state: RootState }>(
    'exercise/addExercise',
    async (payload, { dispatch, rejectWithValue }) => {
        try {
            const { userId, exercise } = payload;
            const dataToSave = { userId, ...exercise };
            const generatedId = await addExerciseRecord(dataToSave);
            const savedExercise: Exercise = { ...exercise, id: generatedId, userId };

            // Dispatch addEnergy action if the exercise was a run
            if (savedExercise.type === 'run') {
                const energyGained = Math.round(savedExercise.powerGenerated / 2); // Example calculation
                if (energyGained > 0) { dispatch(addEnergy(energyGained)); }
            }
            // Note: powerGenerated for runs is calculated but NOT added to totalPower later

            return savedExercise;
        } catch (error: any) { return rejectWithValue(error.message); }
    }
);


// --- Slice Definition ---
export const exerciseSlice = createSlice({
    name: 'exercise',
    initialState,
    reducers: {
        updateDailyGoals: (state, action: PayloadAction<Partial<ExerciseState['dailyGoals']>>) => { state.dailyGoals = { ...state.dailyGoals, ...action.payload }; },
        resetStreak: (state) => { state.currentStreak = 0; },
        // --- Updated usePower reducer ---
        // Now takes a single number payload representing total power cost
        usePower: (state, action: PayloadAction<number>) => {
            const powerCost = action.payload;
            state.totalPower = Math.max(0, state.totalPower - powerCost);
            console.log(`Reducer: usePower. Cost: ${powerCost}, New totalPower: ${state.totalPower}`);
        },
        // ------------------------------
        // applyPowerDecay: (state) => { ... } // Add later if needed
    },
    extraReducers: (builder) => {
        builder
            // Fetch Today Exercises
            .addCase(fetchTodayExercises.pending, (state) => { state.status = 'loading'; state.error = null; })
            .addCase(fetchTodayExercises.fulfilled, (state, action: PayloadAction<Exercise[]>) => { state.status = 'succeeded'; state.todayExercises = action.payload; })
            .addCase(fetchTodayExercises.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload as string || 'Failed to fetch exercises'; })
            // Add Exercise
            .addCase(addExercise.pending, (state) => { state.status = 'loading'; state.error = null; })
            .addCase(addExercise.fulfilled, (state, action: PayloadAction<Exercise>) => {
                state.status = 'succeeded';
                const newExercise = action.payload;
                if (!state.todayExercises.find(ex => ex.id === newExercise.id)) { state.todayExercises.push(newExercise); }
                state.history.push(newExercise);

                // --- Update single totalPower (only if not a run) ---
                const { type, powerGenerated } = newExercise;
                if (type === 'pushup' || type === 'situp' || type === 'squat') {
                    state.totalPower += powerGenerated;
                    console.log(`Reducer: addExercise.fulfilled. Added ${powerGenerated} power for ${type}. New totalPower: ${state.totalPower}`);
                }
                // ----------------------------------------------------

                // Update streak
                const today = new Date(newExercise.date).toISOString().split('T')[0];
                const lastWorkoutDatePart = state.lastWorkoutDate ? state.lastWorkoutDate.split('T')[0] : null;
                if (lastWorkoutDatePart !== today) { state.currentStreak += 1; state.lastWorkoutDate = today; if (state.currentStreak > state.longestStreak) { state.longestStreak = state.currentStreak; } }
            })
            .addCase(addExercise.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload as string || 'Failed to add exercise'; });
    },
});

// Export synchronous actions (including updated usePower)
export const { updateDailyGoals, resetStreak, usePower } = exerciseSlice.actions;

// Export the reducer
export default exerciseSlice.reducer;
