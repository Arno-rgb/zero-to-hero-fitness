import React, { useEffect } from 'react';
import { Box, Heading, Text, Button, OrderedList, ListItem } from '@chakra-ui/react';
import { VStack } from '@chakra-ui/layout';
import { Alert, AlertIcon } from '@chakra-ui/alert';
import { db, initializeUserIfNeeded } from '../utils/database';

const TestPage: React.FC = () => {
  const [testResults, setTestResults] = React.useState<{
    name: string;
    status: 'success' | 'error' | 'info';
    message: string;
  }[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    // Test database initialization
    await testDatabaseInit();
    
    // Test user creation
    await testUserCreation();
    
    // Test exercise tracking
    await testExerciseTracking();
    
    // Test battle system
    await testBattleSystem();
    
    // Test tier progression
    await testTierProgression();

    setIsRunning(false);
  };

  // Test database initialization
  const testDatabaseInit = async () => {
    try {
      // Check if database exists
      if (db) {
        addTestResult('Database Initialization', 'success', 'Database initialized successfully');
      } else {
        addTestResult('Database Initialization', 'error', 'Failed to initialize database');
      }
    } catch (error) {
      addTestResult('Database Initialization', 'error', `Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Test user creation
  const testUserCreation = async () => {
    try {
      // Initialize user if needed
      const userId = await initializeUserIfNeeded();
      
      if (userId) {
        // Get user from database
        const user = await db.users.get(userId);
        
        if (user) {
          addTestResult('User Creation', 'success', `User created with ID: ${userId}`);
        } else {
          addTestResult('User Creation', 'error', 'User not found after initialization');
        }
      } else {
        addTestResult('User Creation', 'error', 'Failed to initialize user');
      }
    } catch (error) {
      addTestResult('User Creation', 'error', `Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Test exercise tracking
  const testExerciseTracking = async () => {
    try {
      // Get user
      const user = await db.users.toCollection().first();
      
      if (!user) {
        addTestResult('Exercise Tracking', 'error', 'No user found for exercise test');
        return;
      }
      
      // Add test exercise
      const today = new Date().toISOString().split('T')[0];
      const exerciseData = {
        id: `test-${Date.now()}`,
        userId: user.id,
        type: 'pushup' as const,
        count: 10,
        date: today,
        powerGenerated: 10,
        formQuality: 0.8,
      };
      
      await db.exercises.add(exerciseData);
      
      // Verify exercise was added
      const exercises = await db.exercises
        .where('[userId+date]')
        .equals([user.id, today])
        .toArray();
      
      const testExercise = exercises.find(ex => ex.id === exerciseData.id);
      
      if (testExercise) {
        addTestResult('Exercise Tracking', 'success', 'Exercise record created and retrieved successfully');
        
        // Clean up test exercise
        await db.exercises.delete(exerciseData.id);
      } else {
        addTestResult('Exercise Tracking', 'error', 'Failed to retrieve test exercise');
      }
    } catch (error) {
      addTestResult('Exercise Tracking', 'error', `Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Test battle system
  const testBattleSystem = async () => {
    try {
      // Get user
      const user = await db.users.toCollection().first();
      
      if (!user) {
        addTestResult('Battle System', 'error', 'No user found for battle test');
        return;
      }
      
      // Create test battle record
      const battleData = {
        id: `test-battle-${Date.now()}`,
        userId: user.id,
        bossId: 'boss1',
        date: new Date().toISOString(),
        result: 'victory' as const,
        damageDealt: 100,
        powerUsed: {
          strike: 10,
          core: 10,
          force: 10,
          endurance: 10,
        },
      };
      
      await db.battles.add(battleData);
      
      // Verify battle was added
      const battle = await db.battles.get(battleData.id);
      
      if (battle) {
        addTestResult('Battle System', 'success', 'Battle record created and retrieved successfully');
        
        // Clean up test battle
        await db.battles.delete(battleData.id);
      } else {
        addTestResult('Battle System', 'error', 'Failed to retrieve test battle');
      }
    } catch (error) {
      addTestResult('Battle System', 'error', `Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Test tier progression
  const testTierProgression = async () => {
    try {
      // Get user
      const user = await db.users.toCollection().first();
      
      if (!user) {
        addTestResult('Tier Progression', 'error', 'No user found for tier progression test');
        return;
      }
      
      // Save original tier
      const originalTier = user.tier;
      
      // Update tier
      const newTier = (originalTier + 1) % 5; // Cycle between 0-4
      await db.users.update(user.id, { tier: newTier });
      
      // Verify tier was updated
      const updatedUser = await db.users.get(user.id);
      
      if (updatedUser && updatedUser.tier === newTier) {
        addTestResult('Tier Progression', 'success', `Tier updated from ${originalTier} to ${newTier} successfully`);
        
        // Restore original tier
        await db.users.update(user.id, { tier: originalTier });
      } else {
        addTestResult('Tier Progression', 'error', 'Failed to update user tier');
      }
    } catch (error) {
      addTestResult('Tier Progression', 'error', `Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Helper to add test result
  const addTestResult = (name: string, status: 'success' | 'error' | 'info', message: string) => {
    setTestResults(prev => [...prev, { name, status, message }]);
  };

  return (
    <Box p={5}>
      <Heading mb={6}>Browser Game Testing</Heading>
      
      <VStack spacing={6} align="stretch">
        <Box>
          <Button 
            colorScheme="teal" 
            onClick={runAllTests} 
            isLoading={isRunning}
            loadingText="Running Tests"
            mb={4}
          >
            Run All Tests
          </Button>
          
          <Text mb={2}>This page tests the core functionality of the fitness game:</Text>
          <OrderedList pl={4} mb={4}>
            <ListItem>Database initialization</ListItem>
            <ListItem>User creation and management</ListItem>
            <ListItem>Exercise tracking system</ListItem>
            <ListItem>Battle system mechanics</ListItem>
            <ListItem>Tier progression</ListItem>
          </OrderedList>
        </Box>
        
        {testResults.length > 0 && (
          <Box borderWidth={1} borderRadius="lg" p={4}>
            <Heading size="md" mb={4}>Test Results</Heading>
            
            <VStack spacing={3} align="stretch">
              {testResults.map((result, index) => (
                <Alert key={index} status={result.status} borderRadius="md">
                  <AlertIcon />
                  <Box flex="1">
                    <Text fontWeight="bold">{result.name}</Text>
                    <Text fontSize="sm">{result.message}</Text>
                  </Box>
                </Alert>
              ))}
            </VStack>
          </Box>
        )}
        
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Manual Testing Instructions</Heading>
          
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="bold">1. Test User Interface Navigation</Text>
              <Text>Navigate between all pages using the navigation bar to ensure routing works correctly.</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold">2. Test Exercise Input</Text>
              <Text>Go to the Exercises page and record different types of exercises. Verify they appear in the history.</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold">3. Test Dashboard Visualization</Text>
              <Text>Check that the Dashboard displays exercise progress and statistics correctly.</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold">4. Test Battle System</Text>
              <Text>Go to the Battles page and attempt to battle a boss. Test different attack types.</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold">5. Test Character Customization</Text>
              <Text>Go to the Customize page and try changing hero costume and colors.</Text>
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default TestPage;
