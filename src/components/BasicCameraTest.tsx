import React, { useEffect, useRef, useState } from 'react';
import { Box, Heading, Text, Alert, AlertIcon, AspectRatio, Center, Button, Spinner, VStack } from '@chakra-ui/react';

const BasicCameraTest: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<true>(true);
    const streamRef = useRef<MediaStream | null>(null); // To hold the stream for cleanup

    useEffect(() => {
        let isMounted = true;
        console.log("BasicCameraTest: useEffect starting.");
        setError(null); // Clear previous errors
        setIsLoading(true);

        // Check if getUserMedia is supported
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            console.error("BasicCameraTest: getUserMedia not supported.");
            if (isMounted) {
                setError("Your browser does not support camera access (getUserMedia).");
                setIsLoading(false);
            }
            return;
        }

        console.log("BasicCameraTest: Requesting camera access...");
        navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
            .then(stream => {
                console.log("BasicCameraTest: Camera access granted.");
                streamRef.current = stream; // Store stream for cleanup
                if (isMounted && videoRef.current) {
                    console.log("BasicCameraTest: Attaching stream to video element.");
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                         console.log("BasicCameraTest: Video metadata loaded, playing video.");
                         videoRef.current?.play().catch(playErr => {
                             console.error("BasicCameraTest: Error playing video:", playErr);
                             if(isMounted) setError(`Failed to play video: ${playErr.message}`);
                         });
                         if(isMounted) setIsLoading(false); // Set loading false after metadata loads
                    };
                     videoRef.current.onerror = (e) => {
                        console.error("BasicCameraTest: Video element error:", e);
                         if(isMounted) setError("An error occurred with the video stream display.");
                         setIsLoading(false);
                    }

                } else if (isMounted) {
                     console.warn("BasicCameraTest: Video ref not ready after getting stream.");
                     setError("Video element not ready.");
                     setIsLoading(false);
                     // Stop tracks if component unmounted before video ref ready
                     stream.getTracks().forEach(track => track.stop());
                } else {
                    // Component unmounted before stream attached, stop tracks
                    console.log("BasicCameraTest: Component unmounted before stream attached.");
                    stream.getTracks().forEach(track => track.stop());
                }
            })
            .catch(err => {
                console.error("BasicCameraTest: Error getting camera stream:", err);
                let userMessage = "Failed to access camera.";
                if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                    userMessage = "Camera permission denied. Please allow camera access in browser settings and refresh.";
                } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                    userMessage = "No camera found. Ensure it's connected and enabled.";
                } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
                     userMessage = "Camera might be already in use by another application.";
                } else {
                    userMessage = `Could not access camera: ${err.name || 'Unknown Error'}.`;
                }
                if (isMounted) {
                    setError(userMessage);
                    setIsLoading(false);
                }
            });

        // Cleanup function
        return () => {
            isMounted = false;
            console.log("BasicCameraTest: Cleanup running.");
            if (streamRef.current) {
                console.log("BasicCameraTest: Stopping camera tracks.");
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null; // Detach stream
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <Box p={4} w="full" maxW="lg" mx="auto">
            <Heading size="md" textAlign="center" mb={4}>Basic Camera Test</Heading>
            {error && (
                <Alert status="error" borderRadius="md" mb={4}>
                    <AlertIcon />
                    {error}
                </Alert>
            )}
            <Box position="relative" bg="gray.900" borderRadius="md" overflow="hidden">
                <AspectRatio ratio={640 / 480}>
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted // Mute is often required for autoplay
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} // Mirror effect
                    />
                </AspectRatio>
                 {isLoading && (
                    <AbsoluteCenter bg="blackAlpha.700" w="full" h="full" zIndex={20}>
                         <VStack spacing={3}>
                            <Spinner size="lg" color="white" />
                            <Text color="white" fontWeight="medium">Accessing Camera...</Text>
                         </VStack>
                    </AbsoluteCenter>
                )}
            </Box>
             {!isLoading && !error && (
                 <Text textAlign="center" color="green.500" mt={2} fontWeight="bold">
                     Camera feed should be active!
                 </Text>
            )}
             <Text textAlign="center" fontSize="xs" color="text-muted" mt={3}>
                 This test only checks basic camera access, not pose detection.
            </Text>
        </Box>
    );
};

// How to use in ExercisePage:
/*
import BasicCameraTest from './BasicCameraTest'; // Assuming you save it as BasicCameraTest.tsx

// Inside ExercisePage component, in the second TabPanel:
<TabPanel p={0}>
    <BasicCameraTest />
</TabPanel>
*/

export default BasicCameraTest; // Export if saving in a separate file


