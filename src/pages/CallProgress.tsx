import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { retellService, CallDetails } from '../lib/retellService';

function CallProgress(): JSX.Element {
  const navigate = useNavigate();
  const [callStatus, setCallStatus] = useState<string>('registered');
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCallStatus = async () => {
      const callId = localStorage.getItem("callId");

      try {
        if (callId) {
          console.log('Fetching call status for call ID:', callId);
          const details = await retellService.getCallDetails(callId);
          console.log('Received call details:', details);
          
          setCallDetails(details);
          setCallStatus(details.call_status || 'registered');
          
          if (details.call_status === 'ended') {
            console.log('Call ended, waiting for analysis...');
            setCallStatus('analyzing'); // Add new status
            // Wait 5 seconds before navigating
            setTimeout(() => {
              navigate('/call-results', { state: { from: 'app' } });
            }, 5000);
          } else if (details.call_status === 'error') {
            console.log('Call error detected, navigating to error page');
            setErrorMessage('There was an error with your call. Redirecting to error page...');
            setTimeout(() => navigate('/error'), 2000);
          }
        } else {
          console.error('No call ID found in localStorage');
          setErrorMessage('No call ID found. Please try again.');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (error) {
        console.error("Error fetching call status:", error);
        setErrorMessage('Error fetching call status. Please try again.');
        setTimeout(() => navigate('/error'), 2000);
      }
    };

    fetchCallStatus();
    const intervalId = setInterval(fetchCallStatus, 2000);
    return () => clearInterval(intervalId);
  }, [navigate]);

  const getStatusText = () => {
    switch (callStatus) {
      case 'registered':
        return 'Initiating your call...';
      case 'ongoing':
        return 'Your conversation is in progress...';
      case 'analyzing':
        return 'Analyzing your conversation...';
      case 'ended':
        return 'Call completed. Preparing your analysis...';
      case 'error':
        return 'There was an error with your call...';
      default:
        return 'Processing your conversation...';
    }
  };

  const getStatusDescription = () => {
    if (errorMessage) {
      return errorMessage;
    }
    
    switch (callStatus) {
      case 'registered':
        return 'Your call is being initiated. The phone should ring shortly.';
      case 'ongoing':
        return 'Your call is in progress. The analysis will appear once the call is completed.';
      case 'analyzing':
        return 'Please wait while we analyze your conversation..';
      case 'ended':
        return 'Your call has ended. Preparing your conversation analysis..';
      case 'error':
        return 'There was an error with your call. Redirecting to error page..';
      default:
        return 'Processing your conversation. Please wait..';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 space-y-8"
    >
      <div className="w-full max-w-xl">
        <div className="p-8 rounded-2xl bg-neutral-950/50 backdrop-blur-xl border border-white/10 space-y-8">
          {/* Loading Animation */}
          <div className="flex items-center justify-center py-12 relative">
            <motion.div
              className="absolute w-32 h-32 rounded-full border-2 border-white/20"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute w-32 h-32 rounded-full border-2 border-white/20"
              animate={{
                scale: [1.1, 1.2, 1.1],
                opacity: [0.2, 0.1, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            />
            <motion.div
              className="relative w-24 h-24 rounded-full bg-gradient-to-r from-neutral-900 to-neutral-800 flex items-center justify-center"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className="absolute inset-0.5 rounded-full bg-neutral-950" />
              <div className="absolute w-full h-full rounded-full border border-white/10" />
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-white/20"
                style={{ top: "4px" }}
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>

          {/* Status Text */}
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-heading font-medium text-white">
              {getStatusText()}
            </h2>
            <p className="text-neutral-300 text-lg">
              {getStatusDescription()}
            </p>
            {callDetails && callDetails.duration && (
              <div className="p-4 rounded-xl bg-neutral-900/40 backdrop-blur-sm border border-white/10">
                <p className="text-neutral-300">
                  Call duration: {Math.floor((callDetails.duration / 1000) / 60)} minutes {Math.floor((callDetails.duration / 1000) % 60)} seconds
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default CallProgress;
