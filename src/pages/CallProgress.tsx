import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsSafari } from '../hooks/useIsSafari';
import { retellService, CallDetails } from '../lib/retellService';

function CallProgress(): JSX.Element {
  const navigate = useNavigate();
  const [callStatus, setCallStatus] = useState<string>('registered');
  const [callDetails, setCallDetails] = useState<CallDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isSafari = useIsSafari();

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
            console.log('Call ended, navigating to results page');
            navigate('/call-results', { state: { from: 'app' } });
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
      case 'ended':
        return 'Your call has ended. Preparing your conversation analysis...';
      case 'error':
        return 'There was an error with your call. Redirecting to error page...';
      default:
        return 'Processing your conversation. Please wait...';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <video autoPlay loop muted playsInline className="w-1/2 sm:w-1/4 md:w-1/6 pointer-events-none">
        <source 
          src={isSafari ? "/blob.mov" : "/blob.webm"} 
          type={isSafari ? "video/quicktime" : "video/webm"} 
        />
      </video>
      <div className="text-center mt-8 space-y-6">
        <h2 className="text-4xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-heading py-4">
          {getStatusText()}
        </h2>
        <p className="text-neutral-200 text-lg sm:text-xl md:text-2xl font-body">
          {getStatusDescription()}
        </p>
        {callDetails && callDetails.duration && (
          <p className="text-neutral-300 text-base">
            Call duration: {Math.floor(callDetails.duration / 60)} minutes {callDetails.duration % 60} seconds
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default CallProgress;
