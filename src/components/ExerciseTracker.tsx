import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  NumberInput, 
  NumberInputField, 
  NumberInputStepper, 
  NumberIncrementStepper, 
  NumberDecrementStepper,
  FormControl,
  FormLabel,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  useToast
} from '@chakra-ui/react';
import { VStack, HStack } from '@chakra-ui/layout';
import { Progress } from '@chakra-ui/progress';
import { addExercise } from '../features/exercise/exerciseSlice';
import { addExperience } from '../features/user/userSlice';
import { db, addExerciseRecord, getExercisesByDate } from '../utils/database';

// Helper function to calculate power generated based on exercise type and count
const calculatePower = (type: string, count: number, formQuality: number): number => {
  const baseMultiplier = formQuality * 1.5;
  
  switch (type) {
    case 'pushup':
      return Math.round(count * baseMultiplier);
    case 'situp':
      return Math.round(count * baseMultiplier);
    case 'squat':
      return Math.round(count * baseMultiplier);
    case 'run':
      // For running, count is in kilometers
      return Math.round(count * 10 * baseMultiplier);
    default:
      return 0;
  }
};

const ExerciseTracker: React.FC = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  
  const [exerciseType, setExerciseType] = useState<'pushup' | 'situp' | 'squat' | 'run'>('pushup');
  const [count, setCount] = useState<number>(0);
  const [formQuality, setFormQuality] = useState<number>(0.7);
  const [userId, setUserId] = useState<string>('');
  const [todayExercises, setTodayExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Load user ID and today's exercises on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get the first user (we only have one user in this version)
        const user = await db.users.toCollection().first();
        if (user) {
          setUserId(user.id);
          
          // Load today's exercises
          const today = new Date().toISOString().split('T')[0];
          const exercises = await getExercisesByDate(user.id, today);
          setTodayExercises(exercises);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    loadUserData();
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
  
  const progress = calculateDailyProgress();
  
  // Handle exercise submission
  const handleSubmit = async () => {
    if (count <= 0) {
      toast({
        title: 'Invalid input',
        description: 'Please enter a value greater than zero',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Calculate power generated
      const powerGenerated = calculatePower(exerciseType, count, formQuality);
      
      // Create exercise record
      const today = new Date().toISOString().split('T')[0];
      const exerciseData = {
        userId,
        type: exerciseType,
        count,
        date: today,
        powerGenerated,
        formQuality,
      };
      
      // Save to database
      await addExerciseRecord(exerciseData);
      
      // Update Redux state
      dispatch(addExercise({
        id: Date.now().toString(),
        type: exerciseType,
        count,
        date: new Date().toISOString(),
        powerGenerated,
        formQuality,
      }));
      
      // Add experience points (1 point per exercise)
      dispatch(addExperience(count));
      
      // Refresh today's exercises
      const exercises = await getExercisesByDate(userId, today);
      setTodayExercises(exercises);
      
      // Show success message
      toast({
        title: 'Exercise recorded!',
        description: `You gained ${powerGenerated} power points!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form
      setCount(0);
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast({
        title: 'Error',
        description: 'Failed to save exercise. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Box p={5}>
      <Heading mb={6}>Daily Workout</Heading>
      
      <VStack spacing={6} align="stretch">
        {/* Daily Progress */}
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Today's Progress</Heading>
          
          <VStack spacing={3} align="stretch">
            <Box>
              <Text mb={1}>Pushups: {progress.pushups}/100</Text>
              <Progress value={(progress.pushups / 100) * 100} colorScheme="red" />
            </Box>
            
            <Box>
              <Text mb={1}>Situps: {progress.situps}/100</Text>
              <Progress value={(progress.situps / 100) * 100} colorScheme="blue" />
            </Box>
            
            <Box>
              <Text mb={1}>Squats: {progress.squats}/100</Text>
              <Progress value={(progress.squats / 100) * 100} colorScheme="green" />
            </Box>
            
            <Box>
              <Text mb={1}>Running: {progress.running}/10 km</Text>
              <Progress value={(progress.running / 10) * 100} colorScheme="yellow" />
            </Box>
          </VStack>
        </Box>
        
        {/* Exercise Input Form */}
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Record Exercise</Heading>
          
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Exercise Type</FormLabel>
              <Select 
                value={exerciseType} 
                onChange={(e) => setExerciseType(e.target.value as any)}
              >
                <option value="pushup">Pushups</option>
                <option value="situp">Situps</option>
                <option value="squat">Squats</option>
                <option value="run">Running (km)</option>
              </Select>
            </FormControl>
            
            <FormControl>
              <FormLabel>
                {exerciseType === 'run' ? 'Distance (km)' : 'Repetitions'}
              </FormLabel>
              <NumberInput 
                min={0} 
                value={count} 
                onChange={(_, value) => setCount(value)}
                max={exerciseType === 'run' ? 50 : 1000}
                step={exerciseType === 'run' ? 0.1 : 1}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel>Form Quality: {Math.round(formQuality * 100)}%</FormLabel>
              <Slider 
                value={formQuality} 
                min={0.1} 
                max={1} 
                step={0.1} 
                onChange={(value) => setFormQuality(value)}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </FormControl>
            
            <Button 
              colorScheme="teal" 
              width="full" 
              onClick={handleSubmit}
              isLoading={isLoading}
              loadingText="Saving"
            >
              Record Exercise
            </Button>
          </VStack>
        </Box>
        
        {/* Exercise History */}
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Today's Exercises</Heading>
          
          {todayExercises.length === 0 ? (
            <Text>No exercises recorded today.</Text>
          ) : (
            <VStack spacing={2} align="stretch">
              {todayExercises.map((exercise) => (
                <HStack key={exercise.id} p={2} bg="gray.50" borderRadius="md" justify="space-between">
                  <Text>
                    {exercise.type === 'pushup' && 'Pushups'}
                    {exercise.type === 'situp' && 'Situps'}
                    {exercise.type === 'squat' && 'Squats'}
                    {exercise.type === 'run' && 'Running'}
                  </Text>
                  <Text>
                    {exercise.count} {exercise.type === 'run' ? 'km' : 'reps'}
                  </Text>
                  <Text color="green.500">+{exercise.powerGenerated} power</Text>
                </HStack>
              ))}
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default ExerciseTracker;
