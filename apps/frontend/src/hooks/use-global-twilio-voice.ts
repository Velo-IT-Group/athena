import { useEffect } from "react";
import { useTwilio } from "@/contexts/twilio-provider";
import { useOnInteraction } from "@/hooks/use-on-interaction";

interface UseGlobalTwilioVoiceProps {
  accessToken?: string;
  enabled?: boolean;
}

export const useGlobalTwilioVoice = ({
  accessToken,
  enabled = true,
}: UseGlobalTwilioVoiceProps) => {
  const {
    device,
    isReady,
    isLoading,
    error,
    activeCalls,
    initializeDevice,
    destroyDevice,
    updateAccessToken,
    acceptCall,
    rejectCall,
    hangupCall,
    muteCall,
  } = useTwilio();

  const interacted = useOnInteraction();

  // Initialize device when conditions are met
  useEffect(() => {
    if (!interacted || !enabled || !accessToken) return;

    // Only initialize if device doesn't exist yet
    if (!device && !isLoading) {
      console.log("Initializing global Twilio Voice device");
      initializeDevice(accessToken);
    }
  }, [interacted, enabled, accessToken, device, isLoading, initializeDevice]);

  // Update token when it changes
  useEffect(() => {
    if (device && accessToken && isReady) {
      updateAccessToken(accessToken);
    }
  }, [device, accessToken, isReady, updateAccessToken]);

  // Cleanup on unmount or when disabled
  useEffect(() => {
    return () => {
      if (!enabled) {
        destroyDevice();
      }
    };
  }, [enabled, destroyDevice]);

  return {
    device,
    isReady,
    isLoading,
    error,
    activeCalls,
    acceptCall,
    rejectCall,
    hangupCall,
    muteCall,
    destroyDevice,
  };
};
