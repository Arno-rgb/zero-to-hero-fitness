import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: string;
  name: string;
  level: number;
  tier: number;
  experience: number;
  heroTitle: string;
  avatarCustomization: {
    costume: string;
    color: string;
  };
  createdAt: string;
  lastLogin: string;
}

const initialState: UserState = {
  id: '',
  name: 'Hero',
  level: 1,
  tier: 0,
  experience: 0,
  heroTitle: 'Beginner',
  avatarCustomization: {
    costume: 'basic',
    color: 'blue',
  },
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    incrementLevel: (state) => {
      state.level += 1;
    },
    incrementTier: (state) => {
      state.tier += 1;
      // Update hero title based on tier
      if (state.tier === 1) {
        state.heroTitle = 'Novice Hero';
      } else if (state.tier === 2) {
        state.heroTitle = 'Rising Hero';
      } else if (state.tier === 3) {
        state.heroTitle = 'Elite Hero';
      } else if (state.tier === 4) {
        state.heroTitle = 'One Punch Hero';
      }
    },
    addExperience: (state, action: PayloadAction<number>) => {
      state.experience += action.payload;
    },
    updateAvatar: (state, action: PayloadAction<Partial<UserState['avatarCustomization']>>) => {
      state.avatarCustomization = { ...state.avatarCustomization, ...action.payload };
    },
    updateLastLogin: (state) => {
      state.lastLogin = new Date().toISOString();
    },
  },
});

export const { 
  setUser, 
  incrementLevel, 
  incrementTier, 
  addExperience, 
  updateAvatar,
  updateLastLogin
} = userSlice.actions;

export default userSlice.reducer;
