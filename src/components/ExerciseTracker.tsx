import React, { useState, useEffect, useCallback, useRef } from 'react';
// Import Redux hooks and the CORRECTED actions/thunks
import { useDispatch, useSelector } from 'react-redux';
// Make sure these imports point to your refactored slice with async thunks
import { addExercise, fetchTodayExercises, Exercise } from '../features/exercise/exerciseSlice'; // Adjust path if needed
import { addExperience } from '../features/user/userSlice'; // Adjust path if needed
// Import RootState type from your store configuration
import { RootState, AppDispatch } from '../store'; // Adjust path if needed

// Import Chakra UI components
import {
    Box, Heading, Text, VStack, HStack, FormControl, FormLabel, Select, Input,
    Slider, SliderTrack, SliderFilledTrack, SliderThumb, Button, Progress, List,
    ListItem, ListIcon, Tag, useToast, Spinner, Tabs, TabList, TabPanels, Tab,
    TabPanel, Icon, Center, AspectRatio, Alert, AlertIcon, AlertTitle,
    AlertDescription, AbsoluteCenter, NumberInput, NumberInputField, NumberInputStepper,
    NumberIncrementStepper, NumberDecrementStepper,
    Stat, StatLabel, StatNumber, StatHelpText, StatGroup // Added Stat components
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
// Import icons
import { FaRunning, FaDumbbell, FaChild, FaBolt } from 'react-icons/fa'; // Added FaBolt
import { GiSittingDog } from 'react-icons/gi';

// --- Types ---
export type ExerciseType = 'pushup' | 'situp' | 'squat' | 'run';
export interface Exercise { id: string; type: ExerciseType; count: number; date: string; powerGenerated: number; formQuality: number; userId?: string; }
type Landmark = { x: number; y: number; z: number; visibility?: number; };
type PoseResult = { poseLandmarks: Landmark[]; };

// --- Helpers ---
const calculatePower = (type: string, count: number, formQuality: number): number => { const quality = Math.max(0.1, Math.min(1, formQuality || 0.5)); const baseMultiplier = quality * 1.5; switch (type) { case 'pushup': case 'situp': case 'squat': return Math.round(count * baseMultiplier); case 'run': return Math.round(count * 10 * baseMultiplier); default: return 0; } };
const formatExerciseName = (type: string) => { switch (type) { case 'pushup': return 'Pushups'; case 'situp': return 'Situps'; case 'squat': return 'Squats'; case 'run': return 'Running'; default: return 'Exercise'; } };
function calculateAngle(a: Landmark, b: Landmark, c: Landmark): number { const abX = b.x - a.x; const abY = b.y - a.y; const cbX = b.x - c.x; const cbY = b.y - c.y; const dotProduct = abX * cbX + abY * cbY; const magAB = Math.sqrt(abX * abX + abY * abY); const magCB = Math.sqrt(cbX * cbX + cbY * cbY); if (magAB === 0 || magCB === 0) { return 0; } const cosTheta = dotProduct / (magAB * magCB); const clampedCosTheta = Math.max(-1.0, Math.min(1.0, cosTheta)); const angleRad = Math.acos(clampedCosTheta); return angleRad * (180.0 / Math.PI); }

// --- Component: ManualExerciseTracker ---
interface ManualExerciseTrackerProps { userId: string; todayExercises: Exercise[]; dailyProgress: { pushups: number, situps: number, squats: number, running: number }; goals: { pushups: number, situps: number, squats: number, running: number }; submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed'; currentEnergy: number; maxEnergy: number; }
const ManualExerciseTracker: React.FC<ManualExerciseTrackerProps> = ({ userId, todayExercises, dailyProgress, goals = { pushups: 100, situps: 100, squats: 100, running: 10 }, submitStatus, currentEnergy, maxEnergy }) => {
    const dispatch: AppDispatch = useDispatch();
    const toast = useToast();
    const [exerciseType, setExerciseType] = useState<ExerciseType>('pushup');
    const [count, setCount] = useState<number>(0);
    const [formQuality, setFormQuality] = useState<number>(0.7);

    const handleSubmit = async (event: React.FormEvent) => { event.preventDefault(); if (count <= 0) { toast({ title: 'Invalid input', description: `Please enter a positive value.`, status: 'warning', duration: 3000, isClosable: true }); return; } if (!userId) { toast({ title: 'User Error', description: 'User ID not found.', status: 'error', duration: 3000, isClosable: true }); return; } const powerGenerated = calculatePower(exerciseType, count, formQuality); const exerciseDataPayload = { userId, exercise: { type: exerciseType, count, date: new Date().toISOString(), powerGenerated, formQuality } }; try { console.log("ManualTracker: Dispatching addExercise thunk"); await dispatch(addExercise(exerciseDataPayload)).unwrap(); console.log("ManualTracker: addExercise thunk fulfilled"); dispatch(addExperience(count)); toast({ title: 'Exercise Recorded!', description: `+${powerGenerated} power points!`, status: 'success', duration: 3000, isClosable: true }); setCount(0); setFormQuality(0.7); } catch (err: any) { console.error('ManualTracker: Failed to save exercise:', err); toast({ title: 'Error', description: err.message || 'Failed to save exercise.', status: 'error', duration: 3000, isClosable: true }); } };
    const renderProgress = (label: string, value: number, goal: number, colorScheme: string) => ( <Box w="100%"> <HStack justify="space-between" mb={1}> <Text fontSize="sm" fontWeight="medium">{label}</Text> <Text fontSize="sm">{value.toFixed(label === 'Running' ? 1 : 0)} / {goal} {label === 'Running' ? 'km' : ''}</Text> </HStack> <Progress value={goal > 0 ? (value / goal) * 100 : 0} size="sm" colorScheme={colorScheme} borderRadius="md" hasStripe isAnimated={value > 0 && value < goal} /> </Box> );
    let historyContent;
    if (!todayExercises) { historyContent = <Text color="gray.500">Loading exercises...</Text>; }
    else if (todayExercises.length === 0) { historyContent = <Text color="gray.500">No exercises recorded today.</Text>; }
    else { historyContent = ( <List spacing={3}> {todayExercises.map((ex) => ( <ListItem key={ex.id} p={2} bg="bg-surface" borderRadius="md" shadow="sm" _hover={{ bg: "bg-subtle-hover" }}> <HStack justify="space-between"> <HStack> {ex.type === 'pushup' && <Icon as={FaDumbbell} color="red.500" />} {ex.type === 'situp' && <Icon as={GiSittingDog} color="blue.500" />} {ex.type === 'squat' && <Icon as={FaChild} color="green.500" />} {ex.type === 'run' && <Icon as={FaRunning} color="orange.500" />} <Text fontWeight="medium">{formatExerciseName(ex.type)}</Text> </HStack> <Text color="text-muted">{ex.count} {ex.type === 'run' ? 'km' : 'reps'}</Text> <Tag colorScheme="green" size="sm">+{ex.powerGenerated}⚡</Tag> </HStack> </ListItem> ))} </List> ); }

    return ( <Box p={{ base: 4, md: 6 }} bg="bg-surface" borderRadius="lg" shadow="md" w="full" maxW="lg" mx="auto"> <Heading as="h2" size="lg" mb={6} textAlign="center"> Daily Workout (Manual) </Heading> <Box bg="bg-subtle" p={4} borderRadius="lg" shadow="inner" mb={6}> <Heading as="h3" size="md" mb={4}>Today's Progress & Resources</Heading> <StatGroup mb={4}> <Stat> <StatLabel><Icon as={FaBolt} mr={1} color="yellow.400"/>Energy</StatLabel> <StatNumber>{currentEnergy ?? 0}/{maxEnergy ?? 100}</StatNumber> <StatHelpText>Used for Battles</StatHelpText> </Stat> </StatGroup> <VStack spacing={4} align="stretch"> {renderProgress('Pushups', dailyProgress.pushups, goals.pushups, 'red')} {renderProgress('Situps', dailyProgress.situps, goals.situps, 'blue')} {renderProgress('Squats', dailyProgress.squats, goals.squats, 'green')} {renderProgress('Running', dailyProgress.running, goals.running, 'orange')} </VStack> </Box> <Box as="form" onSubmit={handleSubmit} mb={6}> <VStack spacing={4} align="stretch"> <Heading as="h3" size="md" mb={0}>Record Exercise</Heading> <FormControl> <FormLabel htmlFor="exerciseType" fontSize="sm">Exercise Type</FormLabel> <Select id="exerciseType" value={exerciseType} onChange={(e) => setExerciseType(e.target.value as ExerciseType)}> <option value="pushup">Pushups</option> <option value="situp">Situps</option> <option value="squat">Squats</option> <option value="run">Running (km)</option> </Select> </FormControl> <FormControl> <FormLabel htmlFor="count" fontSize="sm"> {exerciseType === 'run' ? 'Distance (km)' : 'Repetitions'} </FormLabel> <NumberInput id="count" min={0} value={count} onChange={(_, value) => setCount(isNaN(value) ? 0 : value)} max={exerciseType === 'run' ? 50 : 1000} step={exerciseType === 'run' ? 0.1 : 1} precision={exerciseType === 'run' ? 1 : 0} > <NumberInputField /> <NumberInputStepper> <NumberIncrementStepper /> <NumberDecrementStepper /> </NumberInputStepper> </NumberInput> </FormControl> <FormControl> <FormLabel htmlFor="formQuality" fontSize="sm"> Form Quality: {Math.round(formQuality * 100)}% </FormLabel> <Slider id="formQuality" aria-label="form-quality-slider" min={0.1} max={1} step={0.05} value={formQuality} onChange={(val) => setFormQuality(val)} colorScheme="purple"> <SliderTrack> <SliderFilledTrack /> </SliderTrack> <SliderThumb /> </Slider> </FormControl> <Button type="submit" colorScheme="purple" isLoading={submitStatus === 'loading'} loadingText="Saving..." w="full" mt={2}> Record Exercise </Button> </VStack> </Box> <Box bg="bg-subtle" p={4} borderRadius="lg" shadow="inner"> <Heading as="h3" size="md" mb={3}>Today's Recorded Exercises</Heading> {historyContent} </Box> </Box> );
};


// --- Mock MediaPipe (Keep as is) ---
const MockPose = class { constructor() { console.log("Mock MediaPipe Pose Initialized (Fallback)"); } async send(options: any) { await new Promise(resolve => setTimeout(resolve, 50)); if (this.onResultsCallback) { const time = Date.now() / 500; const mockLandmarks = Array(33).fill(0).map((_, i) => ({ x: 0.5 + Math.sin(time + i * 0.5) * 0.1 * (i % 3), y: 0.1 + (i / 33) * 0.8 + Math.cos(time + i * 0.3) * 0.05 * (i % 2), z: 0, visibility: Math.random() > 0.1 ? Math.random() * 0.5 + 0.5 : 0, })); this.onResultsCallback({ poseLandmarks: mockLandmarks }); } } onResults(callback: (results: any) => void) { this.onResultsCallback = callback; } close() { console.log("Mock MediaPipe Pose Closed"); } setOptions(options: any) { console.log("Mock MediaPipe Pose Options:", options); } onResultsCallback?: (results: any) => void; };
const MockPOSE_CONNECTIONS = Array(32).fill(0).map((_, i) => [i, i + 1]).filter(pair => pair[1] < 33);
const MockdrawConnectors = (ctx: any, landmarks: any, connections: any, options: any) => { /* Mock draw */ };
const MockdrawLandmarks = (ctx: any, landmarks: any, options: any) => { /* Mock draw */ };
const MockCamera = class { video: any; options: any; intervalId: any = null; constructor(video: any, options: any) { this.video = video; this.options = options; console.log("Mock MediaPipe Camera Initialized (Fallback)"); } async start() { console.log("Mock Camera Started"); if (this.video.readyState >= 3) { this.options.onFrame(); } else { this.video.oncanplay = () => this.options.onFrame(); } this.intervalId = setInterval(this.options.onFrame, 100); } stop() { clearInterval(this.intervalId); console.log("Mock Camera Stopped"); } };
const VIDEO_WIDTH = 640; const VIDEO_HEIGHT = 480;

// --- Component: useExerciseCounter (Keep as is) ---
const useExerciseCounter = (landmarks: Landmark[] | null, exerciseType: ExerciseType) => { /* ... (hook logic as before) ... */ const [repCount, setRepCount] = useState(0); const [feedback, setFeedback] = useState<string>("Initializing..."); const [formQualityEstimate, setFormQualityEstimate] = useState<number>(0.7); const stage = useRef<'up' | 'down' | null>(null); useEffect(() => { if (!landmarks || landmarks.length === 0) { if (feedback !== "No pose detected. Position yourself in view.") { setFeedback("No pose detected. Position yourself in view."); } return; } if (exerciseType === 'pushup') { try { const L_SHOULDER = 11; const L_ELBOW = 13; const L_WRIST = 15; const R_SHOULDER = 12; const R_ELBOW = 14; const R_WRIST = 16; const L_HIP = 23; const R_HIP = 24; const leftShoulder = landmarks[L_SHOULDER]; const leftElbow = landmarks[L_ELBOW]; const leftWrist = landmarks[L_WRIST]; const rightShoulder = landmarks[R_SHOULDER]; const rightElbow = landmarks[R_ELBOW]; const rightWrist = landmarks[R_WRIST]; const leftHip = landmarks[L_HIP]; const rightHip = landmarks[R_HIP]; const visibilityThreshold = 0.6; if ((leftShoulder?.visibility ?? 0) < visibilityThreshold || (leftElbow?.visibility ?? 0) < visibilityThreshold || (leftWrist?.visibility ?? 0) < visibilityThreshold || (rightShoulder?.visibility ?? 0) < visibilityThreshold || (rightElbow?.visibility ?? 0) < visibilityThreshold || (rightWrist?.visibility ?? 0) < visibilityThreshold || (leftHip?.visibility ?? 0) < visibilityThreshold || (rightHip?.visibility ?? 0) < visibilityThreshold) { setFeedback("Ensure full body (shoulders, elbows, wrists, hips) is clearly visible from the side."); return; } const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist); const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist); const elbowStraightThreshold = 160; const elbowBentThreshold = 95; const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2; if (avgElbowAngle > elbowStraightThreshold) { if (stage.current === 'down') { setRepCount(prev => prev + 1); setFeedback("Up!"); stage.current = 'up'; setFormQualityEstimate(prev => Math.min(1.0, prev + 0.05)); } else if (stage.current === null) { stage.current = 'up'; setFeedback("Ready! Go down."); } } else if (avgElbowAngle < elbowBentThreshold) { if (stage.current === 'up' || stage.current === null) { setFeedback("Down..."); stage.current = 'down'; } } else if (stage.current === 'up') { setFeedback("Going down..."); } else if (stage.current === 'down') { setFeedback("Push up!"); } if (stage.current === 'down') { const leftShoulderLower = leftShoulder.y > leftElbow.y; const rightShoulderLower = rightShoulder.y > rightElbow.y; if (!leftShoulderLower || !rightShoulderLower) { setFeedback("Go deeper!"); setFormQualityEstimate(prev => Math.max(0.1, prev - 0.01)); } } } catch (error) { console.error("Error in pushup detection logic:", error); setFeedback("Error processing pose."); } } else { setFeedback(`Tracking for ${formatExerciseName(exerciseType)} not implemented yet.`); } }, [landmarks, exerciseType, feedback]); return { repCount, feedback, formQualityEstimate }; };

// --- Component: PoseTrackerCamera ---
interface PoseTrackerCameraProps { onComplete: (data: { type: ExerciseType; count: number; formQuality: number }) => void; initialExerciseType?: ExerciseType; }
const PoseTrackerCamera: React.FC<PoseTrackerCameraProps> = ({ onComplete, initialExerciseType = 'pushup' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [latestLandmarks, setLatestLandmarks] = useState<Landmark[] | null>(null);
    const poseRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const toast = useToast();
    const [currentExerciseType] = useState<ExerciseType>(initialExerciseType);
    const { repCount, feedback, formQualityEstimate } = useExerciseCounter(latestLandmarks, currentExerciseType);
    const PoseClass = (window as any).Pose || (window as any).solutions?.pose?.Pose || MockPose;
    const CameraClass = (window as any).Camera || (window as any).camera_utils?.Camera || MockCamera;
    const ActivePOSE_CONNECTIONS = (window as any).POSE_CONNECTIONS || (window as any).solutions?.pose?.POSE_CONNECTIONS || MockPOSE_CONNECTIONS;
    const activeDrawConnectors = (window as any).drawConnectors || (window as any).solutions?.drawingUtils?.drawConnectors || MockdrawConnectors;
    const activeDrawLandmarks = (window as any).drawLandmarks || (window as any).solutions?.drawingUtils?.drawLandmarks || MockdrawLandmarks;

    const onResults = useCallback((results: PoseResult) => { if (!canvasRef.current || !videoRef.current) return; const canvasCtx = canvasRef.current.getContext('2d'); if (!canvasCtx) { console.error("'onResults': Failed to get canvas context."); return; } setLatestLandmarks(results.poseLandmarks || null); canvasCtx.save(); canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); canvasCtx.translate(canvasRef.current.width, 0); canvasCtx.scale(-1, 1); if (results.poseLandmarks) { activeDrawConnectors(canvasCtx, results.poseLandmarks, ActivePOSE_CONNECTIONS, { color: '#4ade80', lineWidth: 3 }); activeDrawLandmarks(canvasCtx, results.poseLandmarks, { color: '#f87171', lineWidth: 1, radius: 4 }); } canvasCtx.restore(); }, [ActivePOSE_CONNECTIONS, activeDrawConnectors, activeDrawLandmarks]);
    useEffect(() => { console.log("PoseTrackerCamera: useEffect starting initialization."); let isMounted = true; if (!PoseClass || !CameraClass) { console.error("PoseTrackerCamera: MediaPipe Pose or Camera class is unavailable."); if (isMounted) { setErrorMessage("Error: Pose detection library or Camera utility not found."); setIsLoading(false); } return; } else { console.log("PoseTrackerCamera: PoseClass and CameraClass found."); if (PoseClass === MockPose) console.warn("PoseTrackerCamera: Using MockPose fallback!"); if (CameraClass === MockCamera) console.warn("PoseTrackerCamera: Using MockCamera fallback!"); } if (!videoRef.current || !canvasRef.current) { console.error("PoseTrackerCamera: Video or Canvas ref not available on mount."); if (isMounted) { setErrorMessage("UI elements not ready."); setIsLoading(false); } return; } console.log("PoseTrackerCamera: Refs (video, canvas) are available."); const videoElement = videoRef.current; const canvasElement = canvasRef.current; canvasElement.width = VIDEO_WIDTH; canvasElement.height = VIDEO_HEIGHT; console.log(`PoseTrackerCamera: Canvas dimensions set to ${VIDEO_WIDTH}x${VIDEO_HEIGHT}.`); try { console.log("PoseTrackerCamera: Initializing MediaPipe Pose..."); poseRef.current = new PoseClass({ locateFile: (file: string) => { const url = `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`; console.log(`PoseTrackerCamera: Locating file: ${url}`); return url; } }); poseRef.current.setOptions({ modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false, minDetectionConfidence: 0.5, minTrackingConfidence: 0.6 }); console.log("PoseTrackerCamera: Pose options set."); poseRef.current.onResults(onResults); console.log("PoseTrackerCamera: 'onResults' callback attached to Pose."); console.log("PoseTrackerCamera: Initializing MediaPipe Camera..."); cameraRef.current = new CameraClass(videoElement, { onFrame: async () => { if (videoElement.readyState >= 3) { if (poseRef.current?.send) { try { videoElement.width = VIDEO_WIDTH; videoElement.height = VIDEO_HEIGHT; await poseRef.current.send({ image: videoElement }); } catch (error) { console.error("PoseTrackerCamera: Error sending frame to MediaPipe Pose:", error); } } } }, width: VIDEO_WIDTH, height: VIDEO_HEIGHT, }); console.log("PoseTrackerCamera: MediaPipe Camera initialized."); if (typeof cameraRef.current.start === 'function') { console.log("PoseTrackerCamera: Calling camera.start()..."); cameraRef.current.start() .then(() => { console.log("PoseTrackerCamera: camera.start() promise resolved successfully."); if (isMounted) { console.log("PoseTrackerCamera: Setting isLoading to false."); setIsLoading(false); } else { console.log("PoseTrackerCamera: camera started but component unmounted."); } }) .catch((err: any) => { console.error("PoseTrackerCamera: camera.start() promise rejected:", err); let userMessage = "Failed to start camera."; if (err.name === "NotAllowedError") userMessage = "Camera permission denied. Please allow camera access in browser settings and refresh."; else if (err.name === "NotFoundError") userMessage = "No camera found. Ensure it's connected and enabled."; else userMessage = `Could not access camera (${err.name || 'Unknown Error'}). Check connections/permissions.`; if (isMounted) { console.log("PoseTrackerCamera: Setting error message and isLoading=false due to camera start failure."); setErrorMessage(userMessage); setIsLoading(false); toast({ title: 'Camera Error', description: userMessage, status: 'error', duration: 7000, isClosable: true }); } }); } else { console.error("PoseTrackerCamera: cameraRef.current.start is not a function."); throw new Error("Camera object does not have a start method."); } } catch (initError) { console.error("PoseTrackerCamera: Error during initialization block:", initError); if (isMounted) { setErrorMessage(`Initialization failed: ${initError instanceof Error ? initError.message : String(initError)}`); setIsLoading(false); } } return () => { isMounted = false; console.log("PoseTrackerCamera: Cleanup function running..."); if (cameraRef.current && typeof cameraRef.current.stop === 'function') { try { console.log("PoseTrackerCamera: Stopping camera..."); cameraRef.current.stop(); } catch (e) { console.error("Error stopping camera:", e) } } else if (cameraRef.current?.srcObject) { try { console.log("PoseTrackerCamera: Stopping camera tracks (fallback)..."); (cameraRef.current.srcObject as MediaStream)?.getTracks().forEach(track => track.stop()); } catch (e) { console.error("Error stopping camera stream tracks:", e) } } if (poseRef.current && typeof poseRef.current.close === 'function') { try { console.log("PoseTrackerCamera: Closing pose model..."); poseRef.current.close(); } catch (e) { console.error("Error closing pose model:", e) } } cameraRef.current = null; poseRef.current = null; console.log("PoseTrackerCamera: Cleanup complete."); }; }, [onResults, toast, PoseClass, CameraClass]);
    const handleCompleteExercise = () => { if (repCount <= 0) { toast({ title: 'No Reps', description: 'No repetitions were counted.', status: 'warning', duration: 3000, isClosable: true }); return; } console.log(`Completing ${currentExerciseType} with ${repCount} reps. Estimated Quality: ${formQualityEstimate}`); onComplete({ type: currentExerciseType, count: repCount, formQuality: formQualityEstimate }); };

    // Component JSX
    return (
        <Box p={{ base: 2, md: 4 }} w="full" maxW="2xl" mx="auto">
            <Heading size="lg" mb={4} textAlign="center"> Camera Tracker ({formatExerciseName(currentExerciseType)}) </Heading>
            {errorMessage && ( <Alert status="error" borderRadius="md" mb={4}> <AlertIcon /> <Box> <AlertTitle>Camera/Pose Error!</AlertTitle> <AlertDescription>{errorMessage}</AlertDescription> </Box> </Alert> )}
            <Box position="relative" w="full" bg="gray.900" borderRadius="lg" overflow="hidden" shadow="lg" mb={4}>
                 {/* --- AspectRatio FIX Applied --- */}
                 <AspectRatio ratio={VIDEO_WIDTH / VIDEO_HEIGHT}>
                     <Box position="relative" width="100%" height="100%">
                        <video ref={videoRef} autoPlay playsInline muted style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }} />
                     </Box>
                 </AspectRatio>
                 {/* --- End AspectRatio FIX --- */}
                {isLoading && ( <AbsoluteCenter bg="blackAlpha.700" w="full" h="full" zIndex={20}> <VStack spacing={3}> <Spinner size="lg" color="white" /> <Text color="white" fontWeight="medium">Initializing Camera & Pose Model...</Text> </VStack> </AbsoluteCenter> )}
                {!isLoading && !errorMessage && ( <VStack position="absolute" top={3} left={3} zIndex={15} spacing={2} align="flex-start"> <Box bg="blackAlpha.600" color="white" px={3} py={1.5} borderRadius="md" shadow="md"> <Text fontSize="lg" fontWeight="bold">Reps: {repCount}</Text> </Box> <Box bg="blackAlpha.600" color="white" px={3} py={1.5} borderRadius="md" shadow="md" maxW="xs"> <Text fontSize="sm"><Text as="span" fontWeight="semibold">Feedback:</Text> {feedback}</Text> </Box> </VStack> )}
            </Box>
            {!isLoading && !errorMessage && ( <Center> <Button colorScheme="green" onClick={handleCompleteExercise} isDisabled={repCount <= 0} size="lg" shadow="md"> Finish & Record Reps </Button> </Center> )}
            <Text textAlign="center" fontSize="xs" color="text-muted" mt={3}> Ensure good lighting and that your full body is visible for best results. </Text>
        </Box>
     );
};


// --- Component: ExercisePage (Controller/Wrapper - Refactored for Redux) ---
const ExercisePage: React.FC = () => {
    const dispatch: AppDispatch = useDispatch();
    const toast = useToast();

    // --- Select ALL necessary state from Redux Store ---
    const userId = useSelector((state: RootState) => state.user.id || '');
    const todayExercises = useSelector((state: RootState) => state.exercise.todayExercises || []);
    const exerciseStatus = useSelector((state: RootState) => state.exercise.status);
    const exerciseError = useSelector((state: RootState) => state.exercise.error);
    const currentEnergy = useSelector((state: RootState) => state.user.energy);
    const maxEnergy = useSelector((state: RootState) => state.user.maxEnergy);


    // --- Fetch initial data on mount if needed ---
    useEffect(() => {
        // Fetch only if exercise status is 'idle' and we have a valid userId
        if (exerciseStatus === 'idle' && userId) {
            console.log("ExercisePage: Dispatching fetchTodayExercises");
            dispatch(fetchTodayExercises(userId));
        }
    }, [exerciseStatus, userId, dispatch]);

    // --- Calculate daily progress using useMemo for optimization ---
    const dailyProgress = React.useMemo(() => {
        console.log("ExercisePage: Recalculating daily progress. # Exercises:", todayExercises.length);
        const pushups = todayExercises.filter(ex => ex.type === 'pushup').reduce((sum, ex) => sum + (ex.count || 0), 0);
        const situps = todayExercises.filter(ex => ex.type === 'situp').reduce((sum, ex) => sum + (ex.count || 0), 0);
        const squats = todayExercises.filter(ex => ex.type === 'squat').reduce((sum, ex) => sum + (ex.count || 0), 0);
        const running = todayExercises.filter(ex => ex.type === 'run').reduce((sum, ex) => sum + (ex.count || 0), 0);
        return { pushups, situps, squats, running };
    }, [todayExercises]);

    // --- Handle completion from camera tracker ---
    const handleCameraExerciseComplete = async (data: { type: ExerciseType; count: number; formQuality: number }) => {
        if (!userId) { toast({ title: 'User Error', description: 'Cannot save without user ID.', status: 'error' }); return; }
        const powerGenerated = calculatePower(data.type, data.count, data.formQuality);
        const exerciseDataPayload = { userId, exercise: { ...data, date: new Date().toISOString(), powerGenerated } };
        try {
            console.log("ExercisePage: Dispatching addExercise from Camera");
            await dispatch(addExercise(exerciseDataPayload)).unwrap();
            dispatch(addExperience(data.count));
            toast({ title: 'Saved from Camera!', description: `Recorded ${data.count} ${formatExerciseName(data.type)}.`, status: 'success' });
        } catch (err: any) { console.error("Failed to save camera exercise:", err); toast({ title: 'Save Error', description: err.message || 'Could not save camera exercise.', status: 'error' }); }
    };

    // --- Render Logic ---
    const isLoadingUI = exerciseStatus === 'loading' && todayExercises.length === 0;
    const isError = exerciseStatus === 'failed';
    const errorMsg = exerciseError;

    // Check for userId before rendering main content
    if (!userId) {
         return ( <Center h="400px"> <Tag colorScheme="orange" size="lg"> <Icon as={WarningIcon} mr={2}/> Loading User Profile... </Tag> </Center> );
    }
    // Handle initial loading state for exercises
    if (isLoadingUI) {
        return ( <Center h="400px"> <VStack> <Spinner size="xl" color="purple.500" /> <Text mt={3} color="text-muted">Loading Exercise Data...</Text> </VStack> </Center> );
    }
    // Handle error state for exercises
    if (isError) {
        return ( <Center h="400px"> <Tag colorScheme="red" size="lg"> <Icon as={WarningIcon} mr={2}/> Error loading data: {errorMsg || 'Unknown error'} </Tag> </Center> );
    }

    // Render page content when data is ready
    return (
        <Box w="full" maxW="4xl" mx="auto" py={6}>
             <Heading as="h1" size="xl" textAlign="center" mb={8}> Track Your Workout </Heading>
            <Tabs isFitted variant="soft-rounded" colorScheme="purple">
                <TabList mb="1em"> <Tab>Manual Tracker</Tab> <Tab>Camera Tracker (Beta)</Tab> </TabList>
                <TabPanels>
                    <TabPanel p={0}>
                        {/* Pass all required props, including energy */}
                        <ManualExerciseTracker
                            userId={userId}
                            todayExercises={todayExercises}
                            dailyProgress={dailyProgress}
                            goals={{ pushups: 100, situps: 100, squats: 100, running: 10 }}
                            submitStatus={exerciseStatus}
                            currentEnergy={currentEnergy} // Pass energy down
                            maxEnergy={maxEnergy} // Pass max energy down
                        />
                    </TabPanel>
                    <TabPanel p={0}>
                        <PoseTrackerCamera onComplete={handleCameraExerciseComplete} />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

// Export ExercisePage as the default for this file
export default ExercisePage;
