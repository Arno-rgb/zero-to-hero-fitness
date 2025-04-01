import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Badge,
  useToast
} from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/avatar';
import { VStack } from '@chakra-ui/layout';
import { Progress } from '@chakra-ui/progress';
import { Stat, StatLabel, StatNumber, StatHelpText, StatGroup } from '@chakra-ui/stat';
import { setUser, updateLastLogin } from '../features/user/userSlice';
import { db, initializeUserIfNeeded, updateUserLogin, UserData } from '../utils/database';

const UserProfile: React.FC = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load user data on component mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Initialize user if needed
        const userId = await initializeUserIfNeeded();
        
        // Get user data
        const user = await db.users.get(userId);
        
        if (user) {
          setUserData(user);
          setEditName(user.name);
          
          // Update last login
          await updateUserLogin(userId);
          
          // Update Redux state
          dispatch(setUser(user));
          dispatch(updateLastLogin());
        }
      } catch (error) {
        console.error('Error loading user:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user profile',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, [dispatch, toast]);
  
  // Calculate experience to next level (simplified)
  const calculateNextLevelExp = (level: number) => {
    return level * 100;
  };
  
  // Handle name update
  const handleUpdateName = async () => {
    if (!userData || !editName.trim()) return;
    
    try {
      // Update in database
      await db.users.update(userData.id, { name: editName });
      
      // Update local state
      setUserData({ ...userData, name: editName });
      
      // Update Redux state
      dispatch(setUser({ name: editName }));
      
      // Show success message
      toast({
        title: 'Profile updated',
        description: 'Your hero name has been updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Exit edit mode
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating name:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  
  if (isLoading) {
    return (
      <Box p={5} textAlign="center">
        <Text>Loading hero profile...</Text>
      </Box>
    );
  }
  
  if (!userData) {
    return (
      <Box p={5} textAlign="center">
        <Text>Error: Could not load hero profile</Text>
      </Box>
    );
  }
  
  const nextLevelExp = calculateNextLevelExp(userData.level);
  const expProgress = (userData.experience / nextLevelExp) * 100;
  
  return (
    <Box p={5}>
      <Heading mb={6}>Hero Profile</Heading>
      
      <VStack spacing={6} align="stretch">
        {/* Hero Basic Info */}
        <Flex 
          borderWidth={1} 
          borderRadius="lg" 
          p={4} 
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'center', md: 'flex-start' }}
          gap={4}
        >
          <Avatar 
            size="2xl" 
            name={userData.name} 
            bg={userData.avatarCustomization.color}
            src={`/src/assets/avatars/${userData.avatarCustomization.costume}.png`}
          />
          
          <VStack align="stretch" flex={1}>
            {isEditing ? (
              <FormControl>
                <FormLabel>Hero Name</FormLabel>
                <Input 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  placeholder="Enter hero name"
                />
                <Flex mt={2} gap={2}>
                  <Button size="sm" onClick={handleUpdateName} colorScheme="green">
                    Save
                  </Button>
                  <Button size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </Flex>
              </FormControl>
            ) : (
              <Flex justify="space-between" align="center">
                <Heading size="md">{userData.name}</Heading>
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  Edit Name
                </Button>
              </Flex>
            )}
            
            <Badge colorScheme={userData.tier === 0 ? 'gray' : 
                            userData.tier === 1 ? 'green' : 
                            userData.tier === 2 ? 'blue' : 
                            userData.tier === 3 ? 'purple' : 'gold'}>
              {userData.heroTitle}
            </Badge>
            
            <Box mt={2}>
              <Text fontSize="sm" mb={1}>Level {userData.level}</Text>
              <Progress value={expProgress} size="sm" colorScheme="green" />
              <Text fontSize="xs" mt={1}>
                Experience: {userData.experience} / {nextLevelExp}
              </Text>
            </Box>
          </VStack>
        </Flex>
        
        {/* Hero Stats */}
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Hero Stats</Heading>
          
          <StatGroup>
            <Stat>
              <StatLabel>Level</StatLabel>
              <StatNumber>{userData.level}</StatNumber>
              <StatHelpText>Hero Strength</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Tier</StatLabel>
              <StatNumber>{userData.tier} / 4</StatNumber>
              <StatHelpText>Training Progress</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Created</StatLabel>
              <StatNumber>
                {new Date(userData.createdAt).toLocaleDateString()}
              </StatNumber>
              <StatHelpText>Hero Birthday</StatHelpText>
            </Stat>
          </StatGroup>
        </Box>
        
        {/* Training Goals */}
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Training Goals</Heading>
          
          <VStack spacing={3} align="stretch">
            <Box>
              <Text mb={1}>Tier 1: 25 pushups, 25 situps, 25 squats, 2.5km run</Text>
              <Progress 
                value={userData.tier >= 1 ? 100 : 0} 
                colorScheme="green" 
              />
            </Box>
            
            <Box>
              <Text mb={1}>Tier 2: 50 pushups, 50 situps, 50 squats, 5km run</Text>
              <Progress 
                value={userData.tier >= 2 ? 100 : 0} 
                colorScheme="blue" 
              />
            </Box>
            
            <Box>
              <Text mb={1}>Tier 3: 75 pushups, 75 situps, 75 squats, 7.5km run</Text>
              <Progress 
                value={userData.tier >= 3 ? 100 : 0} 
                colorScheme="purple" 
              />
            </Box>
            
            <Box>
              <Text mb={1}>Final Tier: 100 pushups, 100 situps, 100 squats, 10km run</Text>
              <Progress 
                value={userData.tier >= 4 ? 100 : 0} 
                colorScheme="yellow" 
              />
            </Box>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default UserProfile;
