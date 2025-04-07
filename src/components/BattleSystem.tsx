import React, { useState, useEffect, useMemo } from 'react';
// Import Redux hooks and actions
import { useDispatch, useSelector } from 'react-redux';
// import { selectBoss, attackBoss, endBattle } from '../features/battle/battleSlice'; // Assuming these exist
import { usePower } from '../features/exercise/exerciseSlice'; // Use updated usePower
import { incrementTier, addExperience, useEnergy } from '../features/user/userSlice'; // User actions
import { RootState, AppDispatch } from '../store'; // Import state and dispatch types

// Import Chakra UI components
import {
    Box,
    Heading,
    Text,
    SimpleGrid,
    Button,
    Image,
    Flex,
    Badge,
    useToast,
    useDisclosure,
    VStack,
    HStack,
    Progress,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Stat, StatLabel, StatNumber, StatHelpText, StatGroup,
    Icon,
    Card,
    CardHeader,
    CardBody,
    Spinner, // Added Spinner for loading state
    Center // Added Center
} from '@chakra-ui/react';
// Import icons
import { FaTrophy, FaRunning, FaDumbbell, FaChild, FaBolt, FaFistRaised } from 'react-icons/fa';
import { GiSittingDog, GiPotionBall } from 'react-icons/gi';


// Assuming DB functions are still needed for battle history and user data
import { db, getBattleHistory, addBattleRecord, UserData } from '../utils/database'; // Adjust path

// Placeholder boss images
const bossImages = {
    'training_dummy.png': 'https://via.placeholder.com/200?text=Training+Dummy',
    'fitness_goblin.png': 'https://via.placeholder.com/200?text=Fitness+Goblin',
    'cardio_crusher.png': 'https://via.placeholder.com/200?text=Cardio+Crusher',
    'tier1_champion.png': 'https://via.placeholder.com/200?text=Tier+1+Champion',
    'strength_sentinel.png': 'https://via.placeholder.com/200?text=Strength+Sentinel' // Example tier 2
};

// Boss interface
interface Boss {
    id: string;
    name: string;
    tier: number;
    health: number; // Current health in battle
    maxHealth: number;
    weakness: 'strike' | 'core' | 'force' | 'endurance' | 'balanced'; // Weakness might need rethinking
    image: string;
    defeated: boolean; // Whether defeated previously
}

// --- ADDED BACK: Define costs for attacks ---
const ENERGY_COSTS = { quick: 5, power: 15, special: 25 };
const POWER_COSTS = { quick: 10, power: 30, special: 50 }; // Unified power cost
// --- END ADDED BACK ---

const BattleSystem: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Local State
    const [availableBosses, setAvailableBosses] = useState<Boss[] | null>(null);
    const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
    const [battleActive, setBattleActive] = useState<boolean>(false);
    const [battleLog, setBattleLog] = useState<string[]>([]);
    const [battleResult, setBattleResult] = useState<'ongoing' | 'victory' | 'defeat' | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Redux State
    const playerTotalPower = useSelector((state: RootState) => state.exercise.totalPower);
    const userId = useSelector((state: RootState) => state.user.id);
    const userTier = useSelector((state: RootState) => state.user.tier);
    const currentEnergy = useSelector((state: RootState) => state.user.energy);
    const maxEnergy = useSelector((state: RootState) => state.user.maxEnergy);

    // Load Boss Data Effect
    useEffect(() => {
        if (!userId) { setIsLoading(false); return; }
        const loadBossData = async () => { /* ... (loadBossData logic remains the same) ... */ setIsLoading(true); try { const initialBosses: Omit<Boss, 'health' | 'defeated'>[] = [ { id: 'boss1', name: 'Training Dummy', tier: 1, maxHealth: 100, weakness: 'strike', image: 'training_dummy.png'}, { id: 'boss2', name: 'Fitness Goblin', tier: 1, maxHealth: 200, weakness: 'core', image: 'fitness_goblin.png'}, { id: 'boss3', name: 'Cardio Crusher', tier: 1, maxHealth: 300, weakness: 'endurance', image: 'cardio_crusher.png'}, { id: 'boss4', name: 'Tier 1 Champion', tier: 1, maxHealth: 500, weakness: 'balanced', image: 'tier1_champion.png'}, { id: 'boss5', name: 'Strength Sentinel', tier: 2, maxHealth: 750, weakness: 'force', image: 'strength_sentinel.png'}, ]; const filteredBosses = initialBosses.filter(boss => boss.tier <= userTier + 1); const battleHistory = await getBattleHistory(userId); const defeatedBossIds = new Set(battleHistory.filter(b => b.result === 'victory').map(b => b.bossId)); const updatedBosses: Boss[] = filteredBosses.map(bossData => ({ ...bossData, health: bossData.maxHealth, defeated: defeatedBossIds.has(bossData.id), })); setAvailableBosses(updatedBosses); } catch (error) { console.error('Error loading battle data:', error); toast({ title: 'Error', description: 'Failed to load battle data', status: 'error', duration: 3000, isClosable: true }); setAvailableBosses([]); } finally { setIsLoading(false); } };
        loadBossData();
    }, [userId, userTier, toast]);

    // Start Battle Handler
    const handleStartBattle = (boss: Boss) => { /* Uses URL Params to open HTML game */ const currentPower = playerTotalPower ?? 0; const energy = currentEnergy ?? 0; const maxE = maxEnergy ?? 100; const params = new URLSearchParams({ power: currentPower.toString(), energy: energy.toString(), maxEnergy: maxE.toString(), bossName: boss.name, bossMaxHealth: boss.maxHealth.toString(), }); const gameUrl = `/battle-game-3d.html?${params.toString()}`; console.log(`Opening battle game: ${gameUrl}`); window.open(gameUrl, '_blank'); };

    // Helper to render weakness
    const renderWeakness = (weakness: Boss['weakness']) => { let icon = null; let text = 'Balanced'; switch (weakness) { case 'strike': icon = FaDumbbell; text = 'Strike'; break; case 'core': icon = GiSittingDog; text = 'Core'; break; case 'force': icon = FaChild; text = 'Force'; break; } return ( <HStack spacing={1}> {icon && <Icon as={icon} color="gray.500" boxSize={4}/>} <Text fontSize="sm">{text}</Text> </HStack> ); };

    // Loading state
    if (isLoading) { return ( <Center h="400px"> <Spinner size="xl" color="purple.500" /> </Center> ); }

    // Component Render
    return (
        <Box p={5}>
            <Heading mb={6}>Boss Battles</Heading>
            <VStack spacing={6} align="stretch">
                {/* Resources Section */}
                <Box borderWidth={1} borderRadius="lg" p={4} borderColor="gray.200" _dark={{ borderColor: "gray.600" }}>
                    <Heading size="md" mb={4}>Your Resources</Heading>
                    <StatGroup>
                        <Stat> <StatLabel><Icon as={FaBolt} mr={1} color="yellow.400"/>Energy</StatLabel> <StatNumber>{currentEnergy ?? 0}/{maxEnergy ?? 100}</StatNumber> </Stat>
                        <Stat> <StatLabel><Icon as={FaFistRaised} mr={1} color="red.400"/>Power</StatLabel> <StatNumber>{playerTotalPower ?? 0}</StatNumber> </Stat>
                    </StatGroup>
                </Box>

                {/* Available Bosses */}
                <Box>
                    <Heading size="md" mb={4}>Available Bosses (Tier {userTier + 1})</Heading>
                    {availableBosses === null ? <Spinner/> :
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                        {availableBosses.filter(boss => boss.tier === userTier + 1).map((boss) => (
                            <Card key={boss.id} variant="outline" opacity={boss.defeated ? 0.6 : 1}>
                                <CardBody>
                                    <VStack spacing={2}>
                                        <Image src={bossImages[boss.image as keyof typeof bossImages]} alt={boss.name} borderRadius="md" boxSize="150px" objectFit="cover" mb={2} />
                                        <Heading size="sm">{boss.name}</Heading>
                                        <Badge colorScheme={ boss.tier === 1 ? 'green' : boss.tier === 2 ? 'blue' : boss.tier === 3 ? 'purple' : 'red' }> Tier {boss.tier} </Badge>
                                        {renderWeakness(boss.weakness)}
                                        <Text fontSize="sm">Health: {boss.maxHealth}</Text>
                                        {boss.defeated ? ( <Badge colorScheme="gray" width="full" textAlign="center" py={1}>Defeated</Badge> )
                                        : (
                                            // Ensure ENERGY_COSTS and POWER_COSTS are defined before this button renders
                                            <Button
                                                colorScheme="teal"
                                                size="sm"
                                                width="full"
                                                mt={2}
                                                onClick={() => handleStartBattle(boss)}
                                                isDisabled={ currentEnergy < ENERGY_COSTS.quick || playerTotalPower < POWER_COSTS.quick }
                                            >
                                                Battle
                                            </Button>
                                        )}
                                    </VStack>
                                </CardBody>
                            </Card>
                        ))}
                         {availableBosses.filter(boss => boss.tier === userTier + 1).length === 0 && ( <Text color="gray.500">No bosses available for this tier yet.</Text> )}
                    </SimpleGrid>
                    }
                </Box>
            </VStack>

            {/* Modal is no longer opened by handleStartBattle, keeping structure temporarily */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
                 <ModalOverlay />
                <ModalContent>
                    <ModalHeader> Battle Modal (Not Used for HTML Game)</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}> <Text>This modal is no longer used for the main battle logic.</Text> </ModalBody>
                    <ModalFooter> <Button colorScheme="gray" onClick={onClose}> Close </Button> </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default BattleSystem;
