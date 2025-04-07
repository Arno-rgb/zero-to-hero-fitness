import React, { useState, useEffect, useMemo } from 'react';
// Import Redux hooks and actions/thunks
import { useDispatch, useSelector } from 'react-redux';
// Assuming fetchTodayExercises might be needed if dashboard loads first
import { fetchTodayExercises, Exercise } from '../features/exercise/exerciseSlice'; // Adjust path
// Assuming fetchUser might be needed if dashboard loads first
import { fetchUser } from '../features/user/userSlice'; // Adjust path
import { RootState, AppDispatch } from '../store'; // Adjust path

// Import Chakra UI components & hooks
import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Icon,
    useColorModeValue,
    Progress, // Use Progress for rank bar
    VStack,
    HStack,
    List, ListItem, ListIcon, // For quests list
    Spinner,
    Center,
    Button, // For Battle button
    Image, // For Character display
    Grid, // Use Grid for layout
    GridItem,
    useTheme, // To potentially access theme colors/styles
    Tag // For error/loading messages
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons'; // Checkmark and Warning icons
// Import icons
import { FaRunning, FaDumbbell, FaChild, FaBolt, FaFistRaised, FaUserNinja } from 'react-icons/fa'; // Added FaBolt, FaFistRaised, FaUserNinja
import { GiSittingDog, GiPotionBall } from 'react-icons/gi'; // Added GiPotionBall
// Import routing hook if Battle button should navigate
import { useNavigate } from 'react-router-dom';


// Helper function to get Rank Letter from Tier
const getRankLetter = (tier: number): string => {
    if (tier >= 4) return 'S'; // Example: Tier 4+ is S
    if (tier === 3) return 'A';
    if (tier === 2) return 'B';
    if (tier === 1) return 'C';
    return 'D'; // Default for tier 0
};

// Placeholder function for XP needed for next level (implement based on your game logic)
const calculateExpForNextLevel = (level: number): number => {
    // Example: Simple exponential growth: 100, 120, 144, 173, ...
    return Math.floor(100 * Math.pow(1.2, level - 1));
};

// Placeholder for character image based on customization
const getCharacterImage = (avatar: { costume: string; color: string } | undefined): string => {
    // TODO: Implement logic to return correct image path based on costume/color
    console.log("Dashboard Avatar Customization:", avatar);
    // Return a placeholder for now
    return 'https://via.placeholder.com/200x250?text=Hero+Avatar';
};

const Dashboard: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const theme = useTheme();
    const navigate = useNavigate(); // Hook for navigation

    // --- Select Data from Redux Store ---
    const userId = useSelector((state: RootState) => state.user.id);
    const userTier = useSelector((state: RootState) => state.user.tier ?? 0);
    const userLevel = useSelector((state: RootState) => state.user.level ?? 1);
    const userExperience = useSelector((state: RootState) => state.user.experience ?? 0);
    const userAvatar = useSelector((state: RootState) => state.user.avatarCustomization);
    const currentEnergy = useSelector((state: RootState) => state.user.energy ?? 0);
    const maxEnergy = useSelector((state: RootState) => state.user.maxEnergy ?? 100);
    const userStatus = useSelector((state: RootState) => state.user.status); // Status from user slice

    const todayExercises = useSelector((state: RootState) => state.exercise.todayExercises || []);
    const dailyGoals = useSelector((state: RootState) => state.exercise.dailyGoals);
    const totalPower = useSelector((state: RootState) => state.exercise.totalPower ?? 0);
    const exerciseStatus = useSelector((state: RootState) => state.exercise.status);
    const exerciseError = useSelector((state: RootState) => state.exercise.error);


    // --- Fetch Initial Data ---
    // Dispatch fetch actions if data is not already loaded/loading and userId is available
    useEffect(() => {
        // Fetch user data if idle and no ID exists yet
        if (userStatus === 'idle' && !userId) {
             console.log("Dashboard: Dispatching fetchUser");
             dispatch(fetchUser());
        }
        // Fetch today's exercises if idle and user ID is loaded
        if (exerciseStatus === 'idle' && userId) {
            console.log("Dashboard: Dispatching fetchTodayExercises");
            dispatch(fetchTodayExercises(userId));
        }
    }, [userStatus, exerciseStatus, userId, dispatch]);


    // --- Calculate Derived State (Memoized) ---
    const dailyProgress = useMemo(() => {
        const pushups = todayExercises.filter(ex => ex.type === 'pushup').reduce((sum, ex) => sum + (ex.count || 0), 0);
        const situps = todayExercises.filter(ex => ex.type === 'situp').reduce((sum, ex) => sum + (ex.count || 0), 0);
        const squats = todayExercises.filter(ex => ex.type === 'squat').reduce((sum, ex) => sum + (ex.count || 0), 0);
        const running = todayExercises.filter(ex => ex.type === 'run').reduce((sum, ex) => sum + (ex.count || 0), 0);
        return { pushups, situps, squats, running };
    }, [todayExercises]);

    const quests = useMemo(() => [
        { name: 'Pushups', goal: dailyGoals.pushups, current: dailyProgress.pushups, icon: FaDumbbell, unit: 'reps' },
        { name: 'Situps', goal: dailyGoals.situps, current: dailyProgress.situps, icon: GiSittingDog, unit: 'reps' },
        { name: 'Squats', goal: dailyGoals.squats, current: dailyProgress.squats, icon: FaChild, unit: 'reps' },
        { name: 'Run', goal: dailyGoals.runDistance, current: dailyProgress.running, icon: FaRunning, unit: 'km' },
    ], [dailyGoals, dailyProgress]);

    const completedQuests = useMemo(() => quests.filter(q => q.current >= q.goal).length, [quests]);
    const rankLetter = useMemo(() => getRankLetter(userTier), [userTier]);
    const expForNextLevel = useMemo(() => calculateExpForNextLevel(userLevel), [userLevel]);
    const levelProgressPercent = useMemo(() => expForNextLevel > 0 ? Math.min(100, Math.round((userExperience / expForNextLevel) * 100)) : 0, [userExperience, expForNextLevel]);

    // --- Styling Values ---
    const sectionBg = useColorModeValue('gray.50', 'gray.700'); // Use subtle background
    const sectionBorderColor = useColorModeValue('gray.200', 'gray.600');
    const rankColors = { C: 'teal', B: 'blue', A: 'purple', S: 'orange', D: 'gray' };
    const rankColorScheme = rankColors[rankLetter as keyof typeof rankColors] || 'gray';

    // --- Render Logic ---
    const isLoading = (userStatus === 'loading' || userStatus === 'idle') || (exerciseStatus === 'loading' && todayExercises.length === 0);
    const isError = exerciseStatus === 'failed' || userStatus === 'failed'; // Check both user and exercise errors
    const errorMsg = exerciseError; // || userError; // Combine error messages if needed

    if (isLoading) { return ( <Center h="400px"> <Spinner size="xl" color="purple.500" /> </Center> ); }
    if (isError) { return ( <Center h="200px"> <Tag colorScheme="red" size="lg"><Icon as={WarningIcon} mr={2}/> Error loading data: {errorMsg || 'Unknown error'}</Tag> </Center> ); }
    if (!userId) { return ( <Center h="200px"> <Tag colorScheme="orange" size="lg"><Icon as={WarningIcon} mr={2}/> User not loaded.</Tag> </Center> ); }


    return (
        <Box p={{ base: 2, md: 4 }} maxW="container.lg" mx="auto"> {/* Use a standard container width */}
            <Grid
                templateAreas={{
                    base: `"rank resources"
                           "quests resources"
                           "char char"
                           "power energy"
                           "battle battle"`,
                    // Adjusted layout for better spacing on medium screens
                    md: `"rank char resources"
                         "quests char energy"
                         "quests char energy"
                         "power battle energy"`
                }}
                gridTemplateRows={{ base: 'auto auto 1fr auto auto', md: 'auto auto 1fr auto' }}
                gridTemplateColumns={{ base: '1fr 1fr', md: '250px 1fr 250px' }} // Adjusted column widths
                gap={{ base: 3, md: 6 }} // Increased gap
            >
                {/* Rank Section */}
                <GridItem area="rank" bg={sectionBg} p={4} borderRadius="xl" borderWidth="1px" borderColor={sectionBorderColor} boxShadow="md">
                    <VStack align="stretch" spacing={1}>
                        <Text fontWeight="bold" fontSize="md" textAlign="center" color={rankColorScheme + ".600"} _dark={{ color: rankColorScheme + ".300" }}>RANK</Text>
                        <Text fontWeight="extrabold" fontSize="5xl" textAlign="center" lineHeight="1.1" color={rankColorScheme + ".500"}>{rankLetter}</Text>
                        <Progress value={levelProgressPercent} size="sm" colorScheme={rankColorScheme} borderRadius="sm" mt={1} />
                        <Text fontSize="xs" textAlign="center" color="gray.500">{userExperience} / {expForNextLevel} XP</Text>
                    </VStack>
                </GridItem>

                {/* Daily Quests Section */}
                <GridItem area="quests" bg={sectionBg} p={4} borderRadius="xl" borderWidth="1px" borderColor={sectionBorderColor} boxShadow="md">
                    <Heading size="sm" mb={3} textAlign="center">DAILY QUESTS</Heading>
                    <List spacing={2}>
                        {quests.map(quest => {
                            const isComplete = quest.current >= quest.goal;
                            return (
                                <ListItem key={quest.name} opacity={isComplete ? 0.6 : 1}>
                                    <HStack justify="space-between">
                                        <HStack spacing={2}>
                                            <Icon as={quest.icon} boxSize={5} color={isComplete ? 'green.500' : 'gray.400'} />
                                            <Text fontSize="sm" fontWeight="medium" textDecoration={isComplete ? 'line-through' : 'none'}>
                                                {quest.name}
                                            </Text>
                                        </HStack>
                                        <HStack spacing={1.5}>
                                             <Text fontSize="xs" fontWeight="bold" color={isComplete ? 'green.500' : 'gray.500'}>
                                                {quest.current.toFixed(quest.unit === 'km' ? 1: 0)}/{quest.goal}{quest.unit === 'km' ? 'km' : ''}
                                            </Text>
                                            {isComplete && <Icon as={CheckCircleIcon} color="green.500" boxSize={4}/>}
                                        </HStack>
                                    </HStack>
                                </ListItem>
                            );
                        })}
                    </List>
                    <Text fontSize="xs" fontWeight="bold" textAlign="center" mt={3} color="gray.500">
                        {completedQuests} / {quests.length} QUESTS COMPLETED
                    </Text>
                </GridItem>

                {/* Character Display Section */}
                <GridItem area="char" display="flex" alignItems="center" justifyContent="center">
                     <Image
                        src={getCharacterImage(userAvatar)}
                        alt="User Avatar"
                        maxH="350px" // Slightly larger maybe
                        objectFit="contain"
                     />
                </GridItem>

                {/* Resources (Unified Power) Section */}
                <GridItem area="resources" bg={sectionBg} p={4} borderRadius="xl" borderWidth="1px" borderColor={sectionBorderColor} boxShadow="md">
                     <VStack spacing={1}>
                         <Heading size="sm" mb={2}>POWER</Heading>
                         <HStack>
                             <Icon as={FaFistRaised} boxSize={8} color="red.400"/>
                             <Text fontSize="3xl" fontWeight="bold">{totalPower}</Text>
                         </HStack>
                         <Text fontSize="xs" color="gray.500">From Exercises</Text>
                     </VStack>
                </GridItem>

                {/* Energy Section */}
                <GridItem area="energy" bg={sectionBg} p={4} borderRadius="xl" borderWidth="1px" borderColor={sectionBorderColor} boxShadow="md" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                     <Icon as={GiPotionBall} boxSize={12} color="cyan.400" mb={1}/>
                     <Text fontSize="4xl" fontWeight="bold" color="cyan.500">{currentEnergy}</Text>
                     <Text fontSize="md" fontWeight="bold">ENERGY</Text>
                     <Progress value={(currentEnergy/maxEnergy)*100} size="sm" colorScheme="cyan" width="80%" mt={1} borderRadius="sm"/>
                </GridItem>

                {/* Level Display (Bottom Left) */}
                 <GridItem area="power" bg={sectionBg} p={4} borderRadius="xl" borderWidth="1px" borderColor={sectionBorderColor} boxShadow="md" display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                     <Icon as={FaUserNinja} boxSize={10} color="orange.400" mb={1}/>
                     <Text fontSize="4xl" fontWeight="bold" color="orange.500">{userLevel}</Text>
                     <Text fontSize="md" fontWeight="bold">LEVEL</Text>
                 </GridItem>

                {/* Battle Button Section */}
                <GridItem area="battle" display="flex" alignItems="center" justifyContent="center">
                     <Button
                        colorScheme="yellow"
                        size="lg"
                        width={{ base: "90%", md: "70%" }}
                        py={8} // Taller button
                        fontSize="3xl" // Larger font
                        fontWeight="extrabold" // Bolder
                        letterSpacing="widest" // More spacing
                        boxShadow="xl"
                        onClick={() => navigate('/battles')} // Add navigation
                        _hover={{ transform: 'scale(1.05)' }}
                        transition="transform 0.2s ease-in-out"
                     >
                        BATTLE
                     </Button>
                </GridItem>

            </Grid>
        </Box>
    );
};

export default Dashboard;
