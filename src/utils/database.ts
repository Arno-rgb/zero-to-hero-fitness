import Dexie from 'dexie';

// Define the database
export class FitnessGameDB extends Dexie {
  users: Dexie.Table<UserData, string>;
  exercises: Dexie.Table<ExerciseData, string>;
  battles: Dexie.Table<BattleData, string>;

  constructor() {
    super('fitnessGameDB');
    
    // Define tables and their primary keys and indexes
    this.version(1).stores({
      users: 'id, name, level, tier, lastLogin',
      exercises: 'id, userId, type, date, [userId+date]',
      battles: 'id, userId, bossId, date, result'
    });
    
    // Define typed tables
    this.users = this.table('users');
    this.exercises = this.table('exercises');
    this.battles = this.table('battles');
  }
}

// Define types for database tables
export interface UserData {
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

export interface ExerciseData {
  id: string;
  userId: string;
  type: 'pushup' | 'situp' | 'squat' | 'run';
  count: number;
  date: string;
  powerGenerated: number;
  formQuality: number;
}

export interface BattleData {
  id: string;
  userId: string;
  bossId: string;
  date: string;
  result: 'victory' | 'defeat';
  damageDealt: number;
  powerUsed: {
    strike: number;
    core: number;
    force: number;
    endurance: number;
  };
}

// Create and export a database instance
export const db = new FitnessGameDB();

// Helper functions for database operations
export async function initializeUserIfNeeded(): Promise<string> {
  // Check if we have a user
  const userCount = await db.users.count();
  
  if (userCount === 0) {
    // Create a new user
    const userId = generateId();
    const newUser: UserData = {
      id: userId,
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
    
    await db.users.add(newUser);
    return userId;
  } else {
    // Return the first user's ID
    const firstUser = await db.users.toCollection().first();
    return firstUser?.id || '';
  }
}

export async function updateUserLogin(userId: string): Promise<void> {
  await db.users.update(userId, {
    lastLogin: new Date().toISOString()
  });
}

export async function addExerciseRecord(exerciseData: Omit<ExerciseData, 'id'>): Promise<string> {
  const id = generateId();
  await db.exercises.add({
    id,
    ...exerciseData
  });
  return id;
}

export async function getExercisesByDate(userId: string, date: string): Promise<ExerciseData[]> {
  return db.exercises
    .where('[userId+date]')
    .equals([userId, date])
    .toArray();
}

export async function getExercisesByDateRange(userId: string, startDate: string, endDate: string): Promise<ExerciseData[]> {
  return db.exercises
    .where('userId')
    .equals(userId)
    .and(item => item.date >= startDate && item.date <= endDate)
    .toArray();
}

export async function addBattleRecord(battleData: Omit<BattleData, 'id'>): Promise<string> {
  const id = generateId();
  await db.battles.add({
    id,
    ...battleData
  });
  return id;
}

export async function getBattleHistory(userId: string): Promise<BattleData[]> {
  return db.battles
    .where('userId')
    .equals(userId)
    .toArray();
}

// Helper function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
