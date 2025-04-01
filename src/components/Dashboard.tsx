import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { VStack } from '@chakra-ui/layout';
import { Progress, CircularProgress, CircularProgressLabel } from '@chakra-ui/progress';
import { Card, CardHeader, CardBody } from '@chakra-ui/card';
import { Stat, StatLabel, StatNumber, StatHelpText } from '@chakra-ui/stat';
import { FaRunning, FaDumbbell, FaChild } from 'react-icons/fa';
import { GiSittingDog } from 'react-icons/gi';
import { db, getExercisesByDate, getExercisesByDateRange } from '../utils/database';

const Dashboard: React.FC = () => {
  const [userId, setUserId] = useState<string>('');
  const [todayExercises, setTodayExercises] = useState<any[]>([]);
  const [weekExercises, setWeekExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userTier, setUserTier] = useState<number>(0);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  
  // Load user data and exercises on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get the first user
        const user = await db.users.toCollection().first();
        if (user) {
          setUserId(user.id);
          setUserTier(user.tier);
          
          // Load today's exercises
          const today = new Date().toISOString().split('T')[0];
          const todayEx = await getExercisesByDate(user.id, today);
          setTodayExercises(todayEx);
          
          // Load this week's exercises
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - 7);
          const weekStartStr = weekStart.toISOString().split('T')[0];
          const weekEx = await getExercisesByDateRange(user.id, weekStartStr, today);
          setWeekExercises(weekEx);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Calculate daily progress
  const calculateDailyProgress = () => {
    const pushups = todayExercises
      .filter(ex => ex.type === 'pushup')
      .reduce((sum, ex) => sum + ex.count, 0);
      
    const situps = todayExercises
      .filter(ex => ex.type === 'situp')
      .reduce((sum, ex) => sum + ex.count, 0);
      
    const squats = todayExercises
      .filter(ex => ex.type === 'squat')
      .reduce((sum, ex) => sum + ex.count, 0);
      
    const running = todayExercises
      .filter(ex => ex.type === 'run')
      .reduce((sum, ex) => sum + ex.count, 0);
      
    return { pushups, situps, squats, running };
  };
  
  // Calculate weekly totals
  const calculateWeeklyTotals = () => {
    const pushups = weekExercises
      .filter(ex => ex.type === 'pushup')
      .reduce((sum, ex) => sum + ex.count, 0);
      
    const situps = weekExercises
      .filter(ex => ex.type === 'situp')
      .reduce((sum, ex) => sum + ex.count, 0);
      
    const squats = weekExercises
      .filter(ex => ex.type === 'squat')
      .reduce((sum, ex) => sum + ex.count, 0);
      
    const running = weekExercises
      .filter(ex => ex.type === 'run')
      .reduce((sum, ex) => sum + ex.count, 0);
      
    const totalPower = weekExercises.reduce((sum, ex) => sum + ex.powerGenerated, 0);
    
    return { pushups, situps, squats, running, totalPower };
  };
  
  // Calculate tier goals based on user's current tier
  const getTierGoals = () => {
    const tierMultiplier = userTier + 1;
    return {
      pushups: 25 * tierMultiplier,
      situps: 25 * tierMultiplier,
      squats: 25 * tierMultiplier,
      running: 2.5 * tierMultiplier
    };
  };
  
  const dailyProgress = calculateDailyProgress();
  const weeklyTotals = calculateWeeklyTotals();
  const tierGoals = getTierGoals();
  
  if (isLoading) {
    return (
      <Box p={5} textAlign="center">
        <Text>Loading dashboard...</Text>
      </Box>
    );
  }
  
  return (
    <Box p={5}>
      <Heading mb={6}>Hero Dashboard</Heading>
      
      <VStack spacing={6} align="stretch">
        {/* Daily Progress */}
        <Box>
          <Heading size="md" mb={4}>Today's Training</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Card bg={bgColor}>
              <CardHeader pb={0}>
                <Flex align="center">
                  <Icon as={GiSittingDog} mr={2} />
                  <Text fontWeight="bold">Pushups</Text>
                </Flex>
              </CardHeader>
              <CardBody>
                <CircularProgress 
                  value={(dailyProgress.pushups / tierGoals.pushups) * 100} 
                  color="red.400"
                  size="100px"
                >
                  <CircularProgressLabel>{dailyProgress.pushups}/{tierGoals.pushups}</CircularProgressLabel>
                </CircularProgress>
              </CardBody>
            </Card>
            
            <Card bg={bgColor}>
              <CardHeader pb={0}>
                <Flex align="center">
                  <Icon as={FaChild} mr={2} />
                  <Text fontWeight="bold">Situps</Text>
                </Flex>
              </CardHeader>
              <CardBody>
                <CircularProgress 
                  value={(dailyProgress.situps / tierGoals.situps) * 100} 
                  color="blue.400"
                  size="100px"
                >
                  <CircularProgressLabel>{dailyProgress.situps}/{tierGoals.situps}</CircularProgressLabel>
                </CircularProgress>
              </CardBody>
            </Card>
            
            <Card bg={bgColor}>
              <CardHeader pb={0}>
                <Flex align="center">
                  <Icon as={FaDumbbell} mr={2} />
                  <Text fontWeight="bold">Squats</Text>
                </Flex>
              </CardHeader>
              <CardBody>
                <CircularProgress 
                  value={(dailyProgress.squats / tierGoals.squats) * 100} 
                  color="green.400"
                  size="100px"
                >
                  <CircularProgressLabel>{dailyProgress.squats}/{tierGoals.squats}</CircularProgressLabel>
                </CircularProgress>
              </CardBody>
            </Card>
            
            <Card bg={bgColor}>
              <CardHeader pb={0}>
                <Flex align="center">
                  <Icon as={FaRunning} mr={2} />
                  <Text fontWeight="bold">Running</Text>
                </Flex>
              </CardHeader>
              <CardBody>
                <CircularProgress 
                  value={(dailyProgress.running / tierGoals.running) * 100} 
                  color="yellow.400"
                  size="100px"
                >
                  <CircularProgressLabel>{dailyProgress.running}/{tierGoals.running}km</CircularProgressLabel>
                </CircularProgress>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>
        
        {/* Weekly Stats */}
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Weekly Training Summary</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4}>
            <Stat>
              <StatLabel>Pushups</StatLabel>
              <StatNumber>{weeklyTotals.pushups}</StatNumber>
              <StatHelpText>This Week</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Situps</StatLabel>
              <StatNumber>{weeklyTotals.situps}</StatNumber>
              <StatHelpText>This Week</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Squats</StatLabel>
              <StatNumber>{weeklyTotals.squats}</StatNumber>
              <StatHelpText>This Week</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Running</StatLabel>
              <StatNumber>{weeklyTotals.running.toFixed(1)}km</StatNumber>
              <StatHelpText>This Week</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Power Generated</StatLabel>
              <StatNumber>{weeklyTotals.totalPower}</StatNumber>
              <StatHelpText>Total Points</StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>
        
        {/* Training Progress */}
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Training Progress</Heading>
          
          <VStack spacing={3} align="stretch">
            <Box>
              <Text mb={1}>Current Goal: Tier {userTier + 1}</Text>
              <Text fontSize="sm" mb={2}>
                {tierGoals.pushups} pushups, {tierGoals.situps} situps, {tierGoals.squats} squats, {tierGoals.running}km run
              </Text>
              
              <Text mb={1}>Pushups Progress</Text>
              <Progress 
                value={(dailyProgress.pushups / tierGoals.pushups) * 100} 
                colorScheme="red" 
                mb={2}
              />
              
              <Text mb={1}>Situps Progress</Text>
              <Progress 
                value={(dailyProgress.situps / tierGoals.situps) * 100} 
                colorScheme="blue" 
                mb={2}
              />
              
              <Text mb={1}>Squats Progress</Text>
              <Progress 
                value={(dailyProgress.squats / tierGoals.squats) * 100} 
                colorScheme="green" 
                mb={2}
              />
              
              <Text mb={1}>Running Progress</Text>
              <Progress 
                value={(dailyProgress.running / tierGoals.running) * 100} 
                colorScheme="yellow" 
              />
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default Dashboard;
