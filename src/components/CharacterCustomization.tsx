import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Button,
  Image,
  Flex,
  Badge,
  useColorModeValue,
  useToast
} from '@chakra-ui/react';
import { VStack } from '@chakra-ui/layout';
import { Progress } from '@chakra-ui/progress';
import { incrementLevel, updateAvatar } from '../features/user/userSlice';
import { db } from '../utils/database';

// Placeholder avatar images - these would be replaced with actual assets
const avatarImages = {
  basic: 'https://via.placeholder.com/100?text=Basic',
  novice: 'https://via.placeholder.com/100?text=Novice',
  rising: 'https://via.placeholder.com/100?text=Rising',
  elite: 'https://via.placeholder.com/100?text=Elite',
  onepunch: 'https://via.placeholder.com/100?text=OnePunch',
};

const colorOptions = [
  { name: 'Blue', value: 'blue.500' },
  { name: 'Red', value: 'red.500' },
  { name: 'Green', value: 'green.500' },
  { name: 'Purple', value: 'purple.500' },
  { name: 'Yellow', value: 'yellow.500' },
  { name: 'Teal', value: 'teal.500' },
];

interface Costume {
  id: string;
  name: string;
  image: string;
  tier: number;
  description: string;
}

const CharacterCustomization: React.FC = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  
  const [userId, setUserId] = useState<string>('');
  const [userTier, setUserTier] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [currentCostume, setCurrentCostume] = useState<string>('basic');
  const [currentColor, setCurrentColor] = useState<string>('blue.500');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Available costumes based on tier
  const costumes: Costume[] = [
    {
      id: 'basic',
      name: 'Basic Training Outfit',
      image: 'basic',
      tier: 0,
      description: 'Standard training clothes for beginners.',
    },
    {
      id: 'novice',
      name: 'Novice Hero Suit',
      image: 'novice',
      tier: 1,
      description: 'A simple hero costume for those who have completed Tier 1 training.',
    },
    {
      id: 'rising',
      name: 'Rising Hero Armor',
      image: 'rising',
      tier: 2,
      description: 'Enhanced armor for heroes who have mastered Tier 2 challenges.',
    },
    {
      id: 'elite',
      name: 'Elite Hero Battlesuit',
      image: 'elite',
      tier: 3,
      description: 'Advanced battle gear for elite heroes who have conquered Tier 3.',
    },
    {
      id: 'onepunch',
      name: 'One Punch Hero Costume',
      image: 'onepunch',
      tier: 4,
      description: 'The legendary costume for those who have completed the full training regimen.',
    },
  ];
  
  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get the first user
        const user = await db.users.toCollection().first();
        if (user) {
          setUserId(user.id);
          setUserTier(user.tier);
          setUserLevel(user.level);
          setCurrentCostume(user.avatarCustomization.costume);
          setCurrentColor(user.avatarCustomization.color);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load character data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [toast]);
  
  // Handle costume selection
  const handleSelectCostume = async (costumeId: string) => {
    if (!userId) return;
    
    try {
      // Update in database
      await db.users.update(userId, {
        avatarCustomization: {
          costume: costumeId,
          color: currentColor,
        },
      });
      
      // Update local state
      setCurrentCostume(costumeId);
      
      // Update Redux state
      dispatch(updateAvatar({ costume: costumeId }));
      
      toast({
        title: 'Costume Updated',
        description: 'Your hero costume has been changed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating costume:', error);
      toast({
        title: 'Error',
        description: 'Failed to update costume',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  // Handle color selection
  const handleSelectColor = async (colorValue: string) => {
    if (!userId) return;
    
    try {
      // Update in database
      await db.users.update(userId, {
        avatarCustomization: {
          costume: currentCostume,
          color: colorValue,
        },
      });
      
      // Update local state
      setCurrentColor(colorValue);
      
      // Update Redux state
      dispatch(updateAvatar({ color: colorValue }));
      
      toast({
        title: 'Color Updated',
        description: 'Your hero color has been changed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating color:', error);
      toast({
        title: 'Error',
        description: 'Failed to update color',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  if (isLoading) {
    return (
      <Box p={5} textAlign="center">
        <Text>Loading character customization...</Text>
      </Box>
    );
  }
  
  return (
    <Box p={5}>
      <Heading mb={6}>Hero Customization</Heading>
      
      <VStack spacing={6} align="stretch">
        {/* Current Character Preview */}
        <Box 
          borderWidth={1} 
          borderRadius="lg" 
          p={6}
          bg={bgColor}
          textAlign="center"
        >
          <Heading size="md" mb={4}>Your Hero</Heading>
          
          <Flex direction="column" align="center">
            <Box 
              borderWidth={3} 
              borderRadius="full" 
              borderColor={currentColor} 
              p={2}
              mb={4}
            >
              <Image 
                src={avatarImages[currentCostume as keyof typeof avatarImages]} 
                alt="Hero Avatar" 
                borderRadius="full"
                boxSize="150px"
              />
            </Box>
            
            <Badge colorScheme={
              userTier === 0 ? 'gray' : 
              userTier === 1 ? 'green' : 
              userTier === 2 ? 'blue' : 
              userTier === 3 ? 'purple' : 'yellow'
            } mb={2}>
              Tier {userTier} Hero
            </Badge>
            
            <Text fontWeight="bold">Level {userLevel}</Text>
          </Flex>
        </Box>
        
        {/* Costume Selection */}
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Hero Costumes</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {costumes.map((costume) => (
              <Box 
                key={costume.id} 
                borderWidth={1} 
                borderRadius="md" 
                p={3}
                bg={currentCostume === costume.id ? 'teal.50' : bgColor}
                borderColor={currentCostume === costume.id ? 'teal.500' : 'gray.200'}
                opacity={costume.tier > userTier ? 0.5 : 1}
              >
                <VStack>
                  <Image 
                    src={avatarImages[costume.image as keyof typeof avatarImages]} 
                    alt={costume.name} 
                    borderRadius="md"
                    boxSize="100px"
                  />
                  
                  <Text fontWeight="bold">{costume.name}</Text>
                  
                  <Badge colorScheme={
                    costume.tier === 0 ? 'gray' : 
                    costume.tier === 1 ? 'green' : 
                    costume.tier === 2 ? 'blue' : 
                    costume.tier === 3 ? 'purple' : 'yellow'
                  }>
                    Tier {costume.tier}
                  </Badge>
                  
                  <Text fontSize="sm" noOfLines={2}>{costume.description}</Text>
                  
                  {costume.tier > userTier ? (
                    <Badge colorScheme="red">Locked</Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      colorScheme="teal" 
                      isDisabled={currentCostume === costume.id}
                      onClick={() => handleSelectCostume(costume.id)}
                    >
                      {currentCostume === costume.id ? 'Selected' : 'Select'}
                    </Button>
                  )}
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
        
        {/* Color Selection */}
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Hero Colors</Heading>
          
          <SimpleGrid columns={{ base: 3, md: 6 }} spacing={4}>
            {colorOptions.map((color) => (
              <Box 
                key={color.value} 
                onClick={() => handleSelectColor(color.value)}
                cursor="pointer"
                textAlign="center"
              >
                <Box 
                  bg={color.value} 
                  w="50px" 
                  h="50px" 
                  borderRadius="md" 
                  mx="auto"
                  borderWidth={2}
                  borderColor={currentColor === color.value ? 'black' : 'transparent'}
                />
                <Text fontSize="sm" mt={1}>{color.name}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
        
        {/* Tier Progress */}
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Training Progress</Heading>
          
          <VStack spacing={3} align="stretch">
            <Box>
              <Text mb={1}>Tier 1: Novice Hero</Text>
              <Progress 
                value={userTier >= 1 ? 100 : 0} 
                colorScheme="green" 
              />
            </Box>
            
            <Box>
              <Text mb={1}>Tier 2: Rising Hero</Text>
              <Progress 
                value={userTier >= 2 ? 100 : 0} 
                colorScheme="blue" 
              />
            </Box>
            
            <Box>
              <Text mb={1}>Tier 3: Elite Hero</Text>
              <Progress 
                value={userTier >= 3 ? 100 : 0} 
                colorScheme="purple" 
              />
            </Box>
            
            <Box>
              <Text mb={1}>Tier 4: One Punch Hero</Text>
              <Progress 
                value={userTier >= 4 ? 100 : 0} 
                colorScheme="yellow" 
              />
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default CharacterCustomization;
