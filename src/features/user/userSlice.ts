import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store'; // Adjust path if needed
// Import your DB function to get/initialize user
// Assuming db is imported for the thunk below
import { db, UserData } from '../../utils/database'; // Adjust path if needed

// Define the shape of the user state
interface UserState {
  id: string;
  name: string;
  level: number;
  tier: number;
  experience: number;
  energy: number;
  maxEnergy: number;
  heroTitle: string;
  avatarCustomization: {
    costume: string;
    color: string;
  };
  createdAt: string;
  lastLogin: string;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: UserState = {
  id: '',
  name: 'Hero',
  level: 1,
  tier: 0,
  experience: 0,
  energy: 100,
  maxEnergy: 100,
  heroTitle: 'Beginner',
  avatarCustomization: { costume: 'basic', color: 'blue' },
  createdAt: '',
  lastLogin: '',
  status: 'idle',
  error: null,
};

// --- Async Thunk for fetching/initializing user ---
export const fetchUser = createAsyncThunk<UserData, void, { state: RootState }>(
    'user/fetchUser',
    async (_, { rejectWithValue }) => {
        try {
            console.log("Thunk: fetchUser executing...");
            let user = await db.users.toCollection().first();
            if (!user) {
                 console.log("Thunk: No user found, creating default user...");
                 const userId = Date.now().toString(36) + Math.random().toString(36).substring(2);
                 const newUser: UserData = {
                    id: userId, name: 'Hero', level: 1, tier: 0, experience: 0, energy: 100, maxEnergy: 100, // Initialize energy here too
                    heroTitle: 'Beginner', avatarCustomization: { costume: 'basic', color: 'blue' },
                    createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(),
                 };
                 await db.users.add(newUser);
                 user = newUser;
            } else {
                 await db.users.update(user.id, { lastLogin: new Date().toISOString() });
                 user.lastLogin = new Date().toISOString();
            }
            console.log("Thunk: fetchUser success:", user);
            if (!user) throw new Error("Failed to get or create user.");
             // Ensure energy/maxEnergy from DB are numbers, provide defaults if missing
            const userDataWithEnergy: UserData = {
                ...user,
                energy: typeof user.energy === 'number' ? user.energy : initialState.energy,
                maxEnergy: typeof user.maxEnergy === 'number' ? user.maxEnergy : initialState.maxEnergy,
            };
            return userDataWithEnergy;
        } catch (error: any) {
            console.error("Thunk: fetchUser error:", error);
            return rejectWithValue(error.message || 'Failed to fetch user data');
        }
    }
);


export const userSlice = createSlice({
  name: 'user',
  initialState,
  // Synchronous reducers
  reducers: {
    // --- Re-added setUser reducer ---
    // Use this to apply partial updates to the user state if needed
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
        // Merge the payload into the current state
        Object.assign(state, action.payload);
        // Ensure energy doesn't exceed max after potential update
        state.energy = Math.min(state.energy, state.maxEnergy);
    },
    // --- Other reducers ---
    incrementLevel: (state) => { state.level += 1; state.maxEnergy += 10; state.energy = state.maxEnergy; },
    incrementTier: (state) => { state.tier += 1; if (state.tier === 1) state.heroTitle = 'Novice Hero'; else if (state.tier === 2) state.heroTitle = 'Rising Hero'; else if (state.tier === 3) state.heroTitle = 'Elite Hero'; else if (state.tier === 4) state.heroTitle = 'One Punch Hero'; state.maxEnergy += 50; state.energy = state.maxEnergy; },
    addExperience: (state, action: PayloadAction<number>) => { state.experience += action.payload; /* Add level up check */ },
    updateAvatar: (state, action: PayloadAction<Partial<UserState['avatarCustomization']>>) => { state.avatarCustomization = { ...state.avatarCustomization, ...action.payload }; },
    updateLastLogin: (state) => { state.lastLogin = new Date().toISOString(); },
    addEnergy: (state, action: PayloadAction<number>) => { state.energy = Math.min(state.maxEnergy, state.energy + action.payload); console.log(`Reducer: addEnergy. New energy: ${state.energy}/${state.maxEnergy}`); },
    useEnergy: (state, action: PayloadAction<number>) => { state.energy = Math.max(0, state.energy - action.payload); console.log(`Reducer: useEnergy. New energy: ${state.energy}/${state.maxEnergy}`); },
  },
  // Handle async thunk actions for fetching user
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        console.log("Reducer: fetchUser.pending");
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action: PayloadAction<UserData>) => {
        console.log("Reducer: fetchUser.fulfilled", action.payload);
        state.status = 'succeeded';
        // Replace state with fetched data, ensuring all fields are handled
        state.id = action.payload.id;
        state.name = action.payload.name;
        state.level = action.payload.level;
        state.tier = action.payload.tier;
        state.experience = action.payload.experience;
        state.heroTitle = action.payload.heroTitle;
        state.avatarCustomization = action.payload.avatarCustomization;
        state.createdAt = action.payload.createdAt;
        state.lastLogin = action.payload.lastLogin;
        // Ensure energy/maxEnergy exist in payload or use defaults
        state.energy = typeof action.payload.energy === 'number' ? action.payload.energy : initialState.energy;
        state.maxEnergy = typeof action.payload.maxEnergy === 'number' ? action.payload.maxEnergy : initialState.maxEnergy;
        // Ensure energy doesn't exceed max after loading
        state.energy = Math.min(state.energy, state.maxEnergy);
      })
      .addCase(fetchUser.rejected, (state, action) => {
        console.error("Reducer: fetchUser.rejected", action.error);
        state.status = 'failed';
        state.error = action.payload as string || 'Failed to fetch user';
        state.id = ''; // Reset ID if fetch failed
      });
  },
});

// Export all actions (including setUser)
export const {
  setUser, // <-- Re-added setUser to exports
  incrementLevel,
  incrementTier,
  addExperience,
  updateAvatar,
  updateLastLogin,
  addEnergy,
  useEnergy
} = userSlice.actions;

// Export the reducer
export default userSlice.reducer;
