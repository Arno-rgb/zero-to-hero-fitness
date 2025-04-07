import React from 'react';
import { Box, Flex, Heading, Text, Button, Image, useColorMode, VStack } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import Dashboard from './components/Dashboard';
import ExerciseTracker from './components/ExerciseTracker'; // Or the correct path
import BattleSystem from './components/BattleSystem';
import UserProfile from './components/UserProfile';
import CharacterCustomization from './components/CharacterCustomization';
import TestPage from './components/TestPage';

// Logo component with smooth animation
const Logo = () => (
  <Flex align="center">
    <Image 
      src="https://via.placeholder.com/40?text=ZH" 
      alt="Zero to Hero Logo" 
      borderRadius="md"
      mr={2}
    />
    <Heading as="h1" size="lg">Zero to Hero</Heading>
  </Flex>
);

// Navigation with active route highlighting
const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Flex 
      as="nav" 
      align="center" 
      justify="space-between" 
      wrap="wrap" 
      padding={4} 
      bg="teal.500" 
      color="white"
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Logo />
      
      <Box display="flex" width="auto">
        <Box mr={4}>
          <Link to="/">
            <Button 
              variant={isActive('/') ? "solid" : "ghost"} 
              colorScheme="whiteAlpha"
            >
              Dashboard
            </Button>
          </Link>
        </Box>
        <Box mr={4}>
          <Link to="/exercises">
            <Button 
              variant={isActive('/exercises') ? "solid" : "ghost"} 
              colorScheme="whiteAlpha"
            >
              Exercises
            </Button>
          </Link>
        </Box>
        <Box mr={4}>
          <Link to="/battles">
            <Button 
              variant={isActive('/battles') ? "solid" : "ghost"} 
              colorScheme="whiteAlpha"
            >
              Battles
            </Button>
          </Link>
        </Box>
        <Box mr={4}>
          <Link to="/profile">
            <Button 
              variant={isActive('/profile') ? "solid" : "ghost"} 
              colorScheme="whiteAlpha"
            >
              Profile
            </Button>
          </Link>
        </Box>
        <Box>
          <Link to="/customize">
            <Button 
              variant={isActive('/customize') ? "solid" : "ghost"} 
              colorScheme="whiteAlpha"
            >
              Customize
            </Button>
          </Link>
        </Box>
      </Box>
    </Flex>
  );
};

// Footer with theme toggle
const Footer = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  
  return (
    <Box 
      textAlign="center" 
      p={4} 
      bg="gray.100" 
      color="gray.700"
      borderTop="1px"
      borderColor="gray.200"
    >
      <Button size="sm" onClick={toggleColorMode} mb={2}>
        Toggle {colorMode === 'light' ? 'Dark' : 'Light'} Mode
      </Button>
      <Text fontSize="sm">Zero to Hero Fitness Game © 2025</Text>
      <Text fontSize="xs" mt={1}>Inspired by the "One Punch Man" workout</Text>
    </Box>
  );
};

// Welcome screen for first-time users with animation
const Welcome = () => (
  <Box 
    p={8} 
    textAlign="center" 
    maxW="800px" 
    mx="auto"
    borderWidth={1}
    borderRadius="lg"
    mt={8}
    boxShadow="lg"
  >
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <Heading mb={4}>Welcome to Zero to Hero!</Heading>
    </motion.div>
    <Text fontSize="lg" mb={6}>
      Your journey to becoming a hero starts here. This game will help you build up to the 
      legendary workout: 100 pushups, 100 situps, 100 squats, and a 10km run!
    </Text>
    
    <VStack spacing={4} mb={6}>
      <Box p={4} borderWidth={1} borderRadius="md" width="100%">
        <Heading size="md" mb={2}>How to Play</Heading>
        <Text>
          1. Complete daily exercises to generate power points<br />
          2. Use your power to defeat bosses in battle<br />
          3. Progress through tiers to unlock new costumes and abilities<br />
          4. Reach the final tier to become a "One Punch Hero"
        </Text>
      </Box>
      
      <Box p={4} borderWidth={1} borderRadius="md" width="100%">
        <Heading size="md" mb={2}>Getting Started</Heading>
        <Text>
          Start by recording your first exercise in the Exercises tab. As you complete workouts,
          you'll generate power that can be used in boss battles. Defeat bosses to progress through
          tiers and unlock new hero costumes!
        </Text>
      </Box>
    </VStack>
    
    <Link to="/exercises">
      <Button colorScheme="teal" size="lg">
        Start Your Training
      </Button>
    </Link>
  </Box>
);

function App() {
  return (
    <Router>
      <VStack spacing={0} align="stretch" minH="100vh">
        <Navigation />
        <Box flex="1" p={0}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exercises" element={<ExerciseTracker />} />
            <Route path="/battles" element={<BattleSystem />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/customize" element={<CharacterCustomization />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/test" element={<TestPage />} />
          </Routes>
        </Box>
        <Footer />
      </VStack>
    </Router>
  );
}

export default App;
