# Zero to Hero Fitness Game - User Guide

## Introduction

Welcome to Zero to Hero Fitness Game! This browser-based fitness game is inspired by the "One Punch Man" workout regimen and helps you progressively build up to completing 100 pushups, 100 situps, 100 squats, and a 10km run through gamified exercise tracking and boss battles.

## Getting Started

### Installation and Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/fitness_game.git
cd fitness_game
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## Game Features

### Exercise Tracking

The core of the game is tracking your real-world exercises:

1. Go to the **Exercises** tab to log your workouts
2. Select the exercise type (pushups, situps, squats, or running)
3. Enter the number of repetitions or distance (for running)
4. Set your form quality (this affects power generation)
5. Click "Record Exercise" to save your workout

Each exercise generates power points that you can use in boss battles:
- Pushups generate Strike Power
- Situps generate Core Power
- Squats generate Force Power
- Running generates Endurance Power

### Dashboard

The Dashboard provides an overview of your fitness journey:

- Today's training progress toward your current tier goals
- Weekly exercise summary
- Visual progress charts
- Current tier status

### Boss Battles

Use the power generated from your exercises to defeat bosses:

1. Go to the **Battles** tab to see available bosses
2. Select a boss to battle (requires sufficient power)
3. Use different attack types:
   - Quick Attack: Uses small amount of power
   - Power Attack: Uses moderate power with higher damage
   - Special Attack: Uses large power with highest damage
4. Bosses have weaknesses to specific power types
5. Defeat all bosses in a tier to advance to the next tier

### Character Customization

Personalize your hero as you progress:

1. Go to the **Customize** tab to view available options
2. Select from different hero costumes (unlocked based on tier)
3. Choose your hero's color scheme
4. View your training progress across tiers

### Profile

Track your hero's progress:

1. Go to the **Profile** tab to view your hero details
2. See your current level, tier, and experience
3. Edit your hero name
4. View your training goals for each tier

## Progression System

The game features a tier-based progression system:

- **Tier 1**: 25 pushups, 25 situps, 25 squats, 2.5km run
- **Tier 2**: 50 pushups, 50 situps, 50 squats, 5km run
- **Tier 3**: 75 pushups, 75 situps, 75 squats, 7.5km run
- **Final Tier**: 100 pushups, 100 situps, 100 squats, 10km run

To advance tiers:
1. Complete daily exercises to generate power
2. Defeat all bosses in your current tier
3. Unlock new costumes and abilities with each tier

## Testing

The game includes a testing page to verify functionality:

1. Navigate to `/test` in your browser
2. Click "Run All Tests" to perform automated tests
3. Follow the manual testing instructions to verify all features

## Future Mobile Version

This browser game is designed to evolve into a mobile application. The mobile version will include:

- Motion sensor integration for automatic rep counting
- GPS tracking for running
- Camera-based form validation
- Push notifications and reminders
- Social features including raids and guilds

See the `mobile_adaptation_strategy.md` document for more details on the planned mobile version.

## Troubleshooting

If you encounter issues:

- Ensure all dependencies are installed with `npm install`
- Clear your browser cache and local storage
- Check the browser console for error messages
- Visit the `/test` page to run diagnostic tests

## Support

For questions or support, please open an issue on the GitHub repository or contact the development team.

Enjoy your journey to becoming a hero!
