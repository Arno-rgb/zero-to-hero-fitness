/* Create placeholder directories for assets */
mkdir -p public/images/bosses public/images/avatars

/* Create placeholder images for bosses */
touch public/images/bosses/training_dummy.png
touch public/images/bosses/fitness_goblin.png
touch public/images/bosses/cardio_crusher.png
touch public/images/bosses/tier1_champion.png

/* Create placeholder images for avatars */
touch public/images/avatars/basic.png
touch public/images/avatars/novice.png
touch public/images/avatars/rising.png
touch public/images/avatars/elite.png
touch public/images/avatars/onepunch.png

/* Create placeholder for logo */
touch public/images/logo.png

/* Create HTML template */
cat > public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/images/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Zero to Hero Fitness Game</title>
    <meta name="description" content="A fitness game inspired by the One Punch Man workout regimen" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOL

/* Create CSS for animations */
cat > src/animations.css << 'EOL'
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.pulse-animation {
  animation: pulse 2s infinite ease-in-out;
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.slide-in {
  animation: slideIn 0.5s ease-in-out;
}

.battle-button:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease-in-out;
}

.hero-avatar {
  transition: all 0.3s ease-in-out;
}

.hero-avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(0, 128, 128, 0.5);
}
EOL
