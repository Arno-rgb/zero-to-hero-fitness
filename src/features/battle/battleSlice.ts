import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Boss {
  id: string;
  name: string;
  tier: number;
  health: number;
  maxHealth: number;
  weakness: 'strike' | 'core' | 'force' | 'endurance' | 'balanced';
  image: string;
  defeated: boolean;
}

export interface BattleState {
  currentBoss: Boss | null;
  availableBosses: Boss[];
  defeatedBosses: string[];
  battleActive: boolean;
  battleLog: string[];
  playerDamage: number;
  bossDamage: number;
  battleResult: 'ongoing' | 'victory' | 'defeat' | null;
}

const initialBosses: Boss[] = [
  {
    id: 'boss1',
    name: 'Training Dummy',
    tier: 1,
    health: 100,
    maxHealth: 100,
    weakness: 'strike',
    image: 'training_dummy.png',
    defeated: false,
  },
  {
    id: 'boss2',
    name: 'Fitness Goblin',
    tier: 1,
    health: 200,
    maxHealth: 200,
    weakness: 'core',
    image: 'fitness_goblin.png',
    defeated: false,
  },
  {
    id: 'boss3',
    name: 'Cardio Crusher',
    tier: 1,
    health: 300,
    maxHealth: 300,
    weakness: 'endurance',
    image: 'cardio_crusher.png',
    defeated: false,
  },
  {
    id: 'boss4',
    name: 'Tier 1 Champion',
    tier: 1,
    health: 500,
    maxHealth: 500,
    weakness: 'balanced',
    image: 'tier1_champion.png',
    defeated: false,
  },
  // Tier 2 bosses would be added here
  // Tier 3 bosses would be added here
  // Final boss would be added here
];

const initialState: BattleState = {
  currentBoss: null,
  availableBosses: initialBosses,
  defeatedBosses: [],
  battleActive: false,
  battleLog: [],
  playerDamage: 0,
  bossDamage: 0,
  battleResult: null,
};

export const battleSlice = createSlice({
  name: 'battle',
  initialState,
  reducers: {
    selectBoss: (state, action: PayloadAction<string>) => {
      const boss = state.availableBosses.find(b => b.id === action.payload);
      if (boss) {
        state.currentBoss = { ...boss };
        state.battleActive = true;
        state.battleLog = [`Battle with ${boss.name} has begun!`];
        state.battleResult = 'ongoing';
      }
    },
    attackBoss: (state, action: PayloadAction<{
      attackType: 'quick' | 'power' | 'special';
      powerUsed: {
        strike: number;
        core: number;
        force: number;
        endurance: number;
      };
      damage: number;
    }>) => {
      if (state.currentBoss && state.battleActive) {
        const { attackType, damage } = action.payload;
        
        // Apply damage to boss
        state.currentBoss.health = Math.max(0, state.currentBoss.health - damage);
        state.playerDamage += damage;
        
        // Add to battle log
        state.battleLog.push(`You used ${attackType} attack for ${damage} damage!`);
        
        // Check if boss is defeated
        if (state.currentBoss.health <= 0) {
          state.battleActive = false;
          state.battleResult = 'victory';
          state.battleLog.push(`You defeated ${state.currentBoss.name}!`);
          state.defeatedBosses.push(state.currentBoss.id);
          
          // Mark boss as defeated in available bosses
          const bossIndex = state.availableBosses.findIndex(b => b.id === state.currentBoss?.id);
          if (bossIndex !== -1) {
            state.availableBosses[bossIndex].defeated = true;
          }
        } else {
          // Boss counter-attack (simplified)
          const bossDamage = Math.floor(Math.random() * 10) + 5;
          state.bossDamage += bossDamage;
          state.battleLog.push(`${state.currentBoss.name} counter-attacks for ${bossDamage} damage!`);
        }
      }
    },
    endBattle: (state) => {
      state.battleActive = false;
      state.currentBoss = null;
      state.battleLog = [];
      state.playerDamage = 0;
      state.bossDamage = 0;
      state.battleResult = null;
    },
    resetBoss: (state, action: PayloadAction<string>) => {
      const bossIndex = state.availableBosses.findIndex(b => b.id === action.payload);
      if (bossIndex !== -1) {
        state.availableBosses[bossIndex].health = state.availableBosses[bossIndex].maxHealth;
      }
    },
    unlockNewBosses: (state, action: PayloadAction<Boss[]>) => {
      state.availableBosses = [...state.availableBosses, ...action.payload];
    },
  },
});

export const { 
  selectBoss, 
  attackBoss, 
  endBattle, 
  resetBoss,
  unlockNewBosses
} = battleSlice.actions;

export default battleSlice.reducer;
