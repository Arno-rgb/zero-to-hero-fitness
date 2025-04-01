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
  useToast,
  useDisclosure
} from '@chakra-ui/react';
import { VStack } from '@chakra-ui/layout';
import { Progress } from '@chakra-ui/progress';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton } from '@chakra-ui/modal';
import { Stat, StatLabel, StatNumber, StatHelpText, StatGroup } from '@chakra-ui/stat';
import { selectBoss, attackBoss, endBattle } from '../features/battle/battleSlice';
import { usePower } from '../features/exercise/exerciseSlice';
import { incrementTier, addExperience } from '../features/user/userSlice';
import { db, getBattleHistory, addBattleRecord } from '../utils/database';

// Placeholder boss images - these would be replaced with actual assets
const bossImages = {
  'training_dummy.png': 'https://via.placeholder.com/200?text=Training+Dummy',
  'fitness_goblin.png': 'https://via.placeholder.com/200?text=Fitness+Goblin',
  'cardio_crusher.png': 'https://via.placeholder.com/200?text=Cardio+Crusher',
  'tier1_champion.png': 'https://via.placeholder.com/200?text=Tier+1+Champion',
};

interface Boss {
  id: string;
  name: string;
  tier: number;
  health: number;
  maxHealth: number;
  weakness: 'strike' | 'core' | 'force' | 'endurance' | 'balanced';
  image: string;
  defeated: boolean;
}

const BattleSystem: React.FC = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [userId, setUserId] = useState<string>('');
  const [userTier, setUserTier] = useState<number>(0);
  const [availableBosses, setAvailableBosses] = useState<Boss[]>([]);
  const [selectedBoss, setSelectedBoss] = useState<Boss | null>(null);
  const [battleActive, setBattleActive] = useState<boolean>(false);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [playerPower, setPlayerPower] = useState({
    strike: 0,
    core: 0,
    force: 0,
    endurance: 0,
  });
  const [battleResult, setBattleResult] = useState<'ongoing' | 'victory' | 'defeat' | null>(null);
  
  // Load user data and bosses on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get the first user
        const user = await db.users.toCollection().first();
        if (user) {
          setUserId(user.id);
          setUserTier(user.tier);
          
          // Get available bosses based on user tier
          const initialBosses: Boss[] = [
            {
              id: 'boss1',
              name: 'Training Dummy',
              tier: 1,
              health: 100,
              maxHealth: 100,
              weakness: 'strike',
              image: 'training_dummy.png',
              defeated: false,
            },
            {
              id: 'boss2',
              name: 'Fitness Goblin',
              tier: 1,
              health: 200,
              maxHealth: 200,
              weakness: 'core',
              image: 'fitness_goblin.png',
              defeated: false,
            },
            {
              id: 'boss3',
              name: 'Cardio Crusher',
              tier: 1,
              health: 300,
              maxHealth: 300,
              weakness: 'endurance',
              image: 'cardio_crusher.png',
              defeated: false,
            },
            {
              id: 'boss4',
              name: 'Tier 1 Champion',
              tier: 1,
              health: 500,
              maxHealth: 500,
              weakness: 'balanced',
              image: 'tier1_champion.png',
              defeated: false,
            },
          ];
          
          // Filter bosses based on user tier
          const filteredBosses = initialBosses.filter(boss => boss.tier <= user.tier + 1);
          
          // Get battle history to mark defeated bosses
          const battleHistory = await getBattleHistory(user.id);
          const defeatedBossIds = battleHistory
            .filter(battle => battle.result === 'victory')
            .map(battle => battle.bossId);
          
          // Mark defeated bosses
          const updatedBosses = filteredBosses.map(boss => ({
            ...boss,
            defeated: defeatedBossIds.includes(boss.id),
          }));
          
          setAvailableBosses(updatedBosses);
          
          // Get user's power
          const exercises = await db.exercises.where('userId').equals(user.id).toArray();
          const strikePower = exercises
            .filter(ex => ex.type === 'pushup')
            .reduce((sum, ex) => sum + ex.powerGenerated, 0);
          const corePower = exercises
            .filter(ex => ex.type === 'situp')
            .reduce((sum, ex) => sum + ex.powerGenerated, 0);
          const forcePower = exercises
            .filter(ex => ex.type === 'squat')
            .reduce((sum, ex) => sum + ex.powerGenerated, 0);
          const endurancePower = exercises
            .filter(ex => ex.type === 'run')
            .reduce((sum, ex) => sum + ex.powerGenerated, 0);
          
          setPlayerPower({
            strike: strikePower,
            core: corePower,
            force: forcePower,
            endurance: endurancePower,
          });
        }
      } catch (error) {
        console.error('Error loading battle data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load battle data',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    
    loadData();
  }, [toast]);
  
  // Start battle with selected boss
  const handleStartBattle = (boss: Boss) => {
    setSelectedBoss({ ...boss, health: boss.maxHealth });
    setBattleActive(true);
    setBattleLog([`Battle with ${boss.name} has begun!`]);
    setBattleResult('ongoing');
    dispatch(selectBoss(boss.id));
    onOpen();
  };
  
  // Calculate damage based on attack type and boss weakness
  const calculateDamage = (
    attackType: 'quick' | 'power' | 'special',
    powerUsed: { strike: number; core: number; force: number; endurance: number },
    bossWeakness: 'strike' | 'core' | 'force' | 'endurance' | 'balanced'
  ) => {
    const totalPower = powerUsed.strike + powerUsed.core + powerUsed.force + powerUsed.endurance;
    
    // Base damage calculation
    let damage = totalPower;
    
    // Apply multipliers based on attack type
    if (attackType === 'quick') {
      damage = Math.round(totalPower * 0.5);
    } else if (attackType === 'power') {
      damage = Math.round(totalPower * 1.2);
    } else if (attackType === 'special') {
      damage = Math.round(totalPower * 1.5);
    }
    
    // Apply weakness multiplier
    if (bossWeakness === 'strike' && powerUsed.strike > 0) {
      damage = Math.round(damage * 1.5);
    } else if (bossWeakness === 'core' && powerUsed.core > 0) {
      damage = Math.round(damage * 1.5);
    } else if (bossWeakness === 'force' && powerUsed.force > 0) {
      damage = Math.round(damage * 1.5);
    } else if (bossWeakness === 'endurance' && powerUsed.endurance > 0) {
      damage = Math.round(damage * 1.5);
    }
    
    return damage;
  };
  
  // Attack boss with different attack types
  const handleAttack = (attackType: 'quick' | 'power' | 'special') => {
    if (!selectedBoss || !battleActive) return;
    
    // Determine power to use based on attack type
    let powerUsed = {
      strike: 0,
      core: 0,
      force: 0,
      endurance: 0,
    };
    
    if (attackType === 'quick') {
      // Quick attack uses small amount of each power
      powerUsed = {
        strike: Math.min(10, playerPower.strike),
        core: Math.min(10, playerPower.core),
        force: Math.min(10, playerPower.force),
        endurance: Math.min(10, playerPower.endurance),
      };
    } else if (attackType === 'power') {
      // Power attack uses moderate amount of power
      powerUsed = {
        strike: Math.min(30, playerPower.strike),
        core: Math.min(30, playerPower.core),
        force: Math.min(30, playerPower.force),
        endurance: Math.min(30, playerPower.endurance),
      };
    } else if (attackType === 'special') {
      // Special attack uses large amount of power
      powerUsed = {
        strike: Math.min(50, playerPower.strike),
        core: Math.min(50, playerPower.core),
        force: Math.min(50, playerPower.force),
        endurance: Math.min(50, playerPower.endurance),
      };
    }
    
    // Calculate damage
    const damage = calculateDamage(attackType, powerUsed, selectedBoss.weakness);
    
    // Update boss health
    const updatedHealth = Math.max(0, selectedBoss.health - damage);
    setSelectedBoss({ ...selectedBoss, health: updatedHealth });
    
    // Update battle log
    setBattleLog([...battleLog, `You used ${attackType} attack for ${damage} damage!`]);
    
    // Update Redux state
    dispatch(attackBoss({ attackType, powerUsed, damage }));
    
    // Use power
    dispatch(usePower(powerUsed));
    setPlayerPower({
      strike: playerPower.strike - powerUsed.strike,
      core: playerPower.core - powerUsed.core,
      force: playerPower.force - powerUsed.force,
      endurance: playerPower.endurance - powerUsed.endurance,
    });
    
    // Check if boss is defeated
    if (updatedHealth <= 0) {
      handleBossDefeated();
    } else {
      // Boss counter-attack (simplified)
      const bossDamage = Math.floor(Math.random() * 10) + 5;
      setBattleLog([...battleLog, `You used ${attackType} attack for ${damage} damage!`, `${selectedBoss.name} counter-attacks for ${bossDamage} damage!`]);
    }
  };
  
  // Handle boss defeat
  const handleBossDefeated = async () => {
    if (!selectedBoss || !userId) return;
    
    setBattleActive(false);
    setBattleResult('victory');
    setBattleLog([...battleLog, `You defeated ${selectedBoss.name}!`]);
    
    // Record battle in database
    await addBattleRecord({
      userId,
      bossId: selectedBoss.id,
      date: new Date().toISOString(),
      result: 'victory',
      damageDealt: selectedBoss.maxHealth,
      powerUsed: {
        strike: 0, // This would be the actual power used in a real implementation
        core: 0,
        force: 0,
        endurance: 0,
      },
    });
    
    // Mark boss as defeated
    const updatedBosses = availableBosses.map(boss => 
      boss.id === selectedBoss.id ? { ...boss, defeated: true } : boss
    );
    setAvailableBosses(updatedBosses);
    
    // Check if all bosses in current tier are defeated
    const currentTierBosses = updatedBosses.filter(boss => boss.tier === userTier + 1);
    const allDefeated = currentTierBosses.every(boss => boss.defeated);
    
    if (allDefeated) {
      // Increment user tier
      await db.users.update(userId, { tier: userTier + 1 });
      setUserTier(userTier + 1);
      dispatch(incrementTier());
      
      toast({
        title: 'Tier Completed!',
        description: `You've advanced to Tier ${userTier + 2}!`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
    
    // Add experience
    dispatch(addExperience(100));
    
    toast({
      title: 'Victory!',
      description: `You defeated ${selectedBoss.name} and gained 100 experience!`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // End battle
  const handleEndBattle = () => {
    setBattleActive(false);
    setSelectedBoss(null);
    setBattleLog([]);
    setBattleResult(null);
    dispatch(endBattle());
    onClose();
  };
  
  return (
    <Box p={5}>
      <Heading mb={6}>Boss Battles</Heading>
      
      <VStack spacing={6} align="stretch">
        {/* Power Stats */}
        <Box borderWidth={1} borderRadius="lg" p={4}>
          <Heading size="md" mb={4}>Your Power</Heading>
          
          <StatGroup>
            <Stat>
              <StatLabel>Strike Power</StatLabel>
              <StatNumber>{playerPower.strike}</StatNumber>
              <StatHelpText>From Pushups</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Core Power</StatLabel>
              <StatNumber>{playerPower.core}</StatNumber>
              <StatHelpText>From Situps</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Force Power</StatLabel>
              <StatNumber>{playerPower.force}</StatNumber>
              <StatHelpText>From Squats</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Endurance Power</StatLabel>
              <StatNumber>{playerPower.endurance}</StatNumber>
              <StatHelpText>From Running</StatHelpText>
            </Stat>
          </StatGroup>
        </Box>
        
        {/* Available Bosses */}
        <Box>
          <Heading size="md" mb={4}>Available Bosses</Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            {availableBosses.map((boss) => (
              <Box 
                key={boss.id} 
                borderWidth={1} 
                borderRadius="lg" 
                p={4}
                opacity={boss.defeated ? 0.6 : 1}
              >
                <VStack>
                  <Image 
                    src={bossImages[boss.image as keyof typeof bossImages]} 
                    alt={boss.name} 
                    borderRadius="md"
                    boxSize="150px"
                    objectFit="cover"
                  />
                  
                  <Heading size="sm">{boss.name}</Heading>
                  
                  <Badge colorScheme={
                    boss.tier === 1 ? 'green' : 
                    boss.tier === 2 ? 'blue' : 
                    boss.tier === 3 ? 'purple' : 'red'
                  }>
                    Tier {boss.tier}
                  </Badge>
                  
                  <Text fontSize="sm">
                    Weakness: {
                      boss.weakness === 'strike' ? 'Strike (Pushups)' :
                      boss.weakness === 'core' ? 'Core (Situps)' :
                      boss.weakness === 'force' ? 'Force (Squats)' :
                      boss.weakness === 'endurance' ? 'Endurance (Running)' :
                      'Balanced'
                    }
                  </Text>
                  
                  <Text fontSize="sm">Health: {boss.maxHealth}</Text>
                  
                  {boss.defeated ? (
                    <Badge colorScheme="gray">Defeated</Badge>
                  ) : (
                    <Button 
                      colorScheme="teal" 
                      size="sm" 
                      onClick={() => handleStartBattle(boss)}
                      isDisabled={
                        playerPower.strike + playerPower.core + 
                        playerPower.force + playerPower.endurance < 50
                      }
                    >
                      Battle
                    </Button>
                  )}
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
      
      {/* Battle Modal */}
      <Modal isOpen={isOpen} onClose={handleEndBattle} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedBoss ? `Battle with ${selectedBoss.name}` : 'Battle'}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            {selectedBoss && (
              <VStack spacing={4}>
                <Image 
                  src={bossImages[selectedBoss.image as keyof typeof bossImages]} 
                  alt={selectedBoss.name} 
                  borderRadius="md"
                  boxSize="200px"
                  objectFit="cover"
                />
                
                <Box width="100%">
                  <Text mb={1}>
                    {selectedBoss.name} - Health: {selectedBoss.health}/{selectedBoss.maxHealth}
                  </Text>
                  <Progress 
                    value={(selectedBoss.health / selectedBoss.maxHealth) * 100} 
                    colorScheme="red" 
                  />
                </Box>
                
                {battleResult === 'victory' ? (
                  <Box 
                    p={4} 
                    bg="green.100" 
                    borderRadius="md" 
                    width="100%"
                    textAlign="center"
                  >
                    <Heading size="md" color="green.600">Victory!</Heading>
                    <Text>You defeated {selectedBoss.name}!</Text>
                  </Box>
                ) : (
                  <Flex gap={2} width="100%" justify="center">
                    <Button 
                      colorScheme="blue" 
                      onClick={() => handleAttack('quick')}
                      isDisabled={!battleActive || battleResult !== 'ongoing'}
                    >
                      Quick Attack
                    </Button>
                    <Button 
                      colorScheme="purple" 
                      onClick={() => handleAttack('power')}
                      isDisabled={!battleActive || battleResult !== 'ongoing'}
                    >
                      Power Attack
                    </Button>
                    <Button 
                      colorScheme="red" 
                      onClick={() => handleAttack('special')}
                      isDisabled={!battleActive || battleResult !== 'ongoing'}
                    >
                      Special Attack
                    </Button>
                  </Flex>
                )}
                
                <Box 
                  borderWidth={1} 
                  borderRadius="md" 
                  p={3} 
                  width="100%" 
                  height="150px" 
                  overflowY="auto"
                >
                  <Heading size="xs" mb={2}>Battle Log</Heading>
                  {battleLog.map((log, index) => (
                    <Text key={index} fontSize="sm">{log}</Text>
                  ))}
                </Box>
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button colorScheme="gray" onClick={handleEndBattle}>
              {battleResult === 'victory' ? 'Close' : 'Retreat'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BattleSystem;
