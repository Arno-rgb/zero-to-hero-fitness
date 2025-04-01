# Zero to Hero Fitness Game

A browser-based fitness game inspired by the "One Punch Man" workout regimen that helps users progressively build up to completing 100 pushups, 100 situps, 100 squats, and a 10km run through gamified exercise tracking and boss battles.

## Features

- **Exercise Tracking**: Log your workouts and generate power points based on exercise type and form quality
- **Boss Battle System**: Use your accumulated power to defeat bosses with different attack types
- **Tier Progression**: Advance through tiers as you improve your fitness level
- **Character Customization**: Unlock new hero costumes as you progress
- **Dashboard**: Visualize your daily and weekly progress

## Technology Stack

- React with TypeScript for the frontend
- Redux for state management
- Chakra UI for the user interface
- IndexedDB (via Dexie.js) for local data storage
- Framer Motion for animations

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Arno-rgb/zero-to-hero-fitness.git

# Navigate to the project directory
cd zero-to-hero-fitness

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building for Production

```bash
npm run build
```

## Documentation

- [Game Design Document](docs/game_design.md)
- [Technology Selection](docs/technology_selection.md)
- [User Guide](docs/user_guide.md)
- [Mobile Adaptation Strategy](docs/mobile_adaptation_strategy.md)

## Testing

Navigate to `/test` in your browser to access the testing page. This page includes both automated tests and manual testing instructions.

## Future Development

This browser game is designed to evolve into a mobile application. The mobile version will include:
- Motion sensor integration for automatic rep counting
- GPS tracking for running
- Camera-based form validation
- Push notifications and reminders
- Social features including raids and guilds

## License

MIT

## Acknowledgements

- Inspired by the "One Punch Man" workout regimen
- Built with React, Redux, and Chakra UI
