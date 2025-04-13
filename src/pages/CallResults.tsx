import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { retellService, CallDetails } from '../lib/retellService';
import { Heart, Cookie, TreePalm, Article, Brain, Export } from '@phosphor-icons/react';
import { AnimatedButton } from '../components/AnimatedButton';
import { generatePDF } from '../utils/pdfGenerator';
import { useAuth } from '../hooks/useAuth';

interface HealthReport {
  detected_disease: string;
  diet_plan: string;
  preventive_measures: string;
  user_action: string;
}

function CallResults(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState<CallDetails | null>(null);
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      const callId = localStorage.getItem("callId");
      
      try {
        if (callId) {
          const callDetails = await retellService.getCallDetails(callId);
          console.log('Call Details in Results:', JSON.stringify(callDetails, null, 2));
          setResults(callDetails);
          
          // Debug logging for call analysis data
          console.log('Call Analysis:', callDetails.call_analysis);
          console.log('Custom Analysis Data:', callDetails.call_analysis?.custom_analysis_data);
          
          // Parse the nested JSON string from detailed_health_report
          if (callDetails.call_analysis?.custom_analysis_data?.detailed_health_report) {
            try {
              const healthReportString = callDetails.call_analysis.custom_analysis_data.detailed_health_report;
              console.log('Health Report String:', healthReportString);
              
              const parsed = JSON.parse(healthReportString);
              console.log('Parsed Health Report:', parsed);
              setHealthReport(parsed);
            } catch (parseError) {
              console.error("Error parsing health report:", parseError);
              console.error("Raw health report data:", callDetails.call_analysis.custom_analysis_data.detailed_health_report);
            }
          } else {
            console.log('No detailed health report found in response');
          }
          
          localStorage.removeItem("callId");
        }
      } catch (error) {
        console.error("Error fetching call results:", error);
        navigate('/error');
      }
    };

    fetchResults();
  }, [navigate]);

  const handleExportPDF = async () => {
    if (!user) return;
    
    await generatePDF({
      userName: user.user_metadata.full_name || 'User',
      userEmail: user.email || 'N/A',
      healthReport,
      callAnalysis: results?.call_analysis || null
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center w-full pt-32 pb-32 px-4 sm:px-8 relative"
    >
      <div className="w-full max-w-5xl space-y-6">
        <h1 className="text-4xl sm:text-5xl font-heading font-medium text-center text-white mb-8">
          Health Assessment Results
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detected Diseases */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-neutral-950/50 backdrop-blur-xl border border-white/10 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Heart weight="duotone" className="w-6 h-6 text-white/90" />
              <h2 className="text-xl font-medium text-white">Detected Conditions</h2>
            </div>
            <p className="text-neutral-300 text-lg">
              {healthReport?.detected_disease || "No conditions detected"}
            </p>
          </motion.div>

          {/* User Sentiment */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-neutral-950/50 backdrop-blur-xl border border-white/10 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Brain weight="duotone" className="w-6 h-6 text-white/90" />
              <h2 className="text-xl font-medium text-white">Overall Sentiment</h2>
            </div>
            <p className="text-neutral-300 text-lg">
              {results?.call_analysis?.user_sentiment || "No sentiment data available"}
            </p>
          </motion.div>

          {/* Preventive Measures */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-neutral-950/50 backdrop-blur-xl border border-white/10 space-y-4"
          >
            <div className="flex items-center gap-3">
              <TreePalm weight="duotone" className="w-6 h-6 text-white/90" />
              <h2 className="text-xl font-medium text-white">Preventive Measures</h2>
            </div>
            <p className="text-neutral-300 text-lg">
              {healthReport?.preventive_measures || "No preventive measures available"}
            </p>
          </motion.div>

          {/* Diet Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-neutral-950/50 backdrop-blur-xl border border-white/10 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Cookie weight="duotone" className="w-6 h-6 text-white/90" />
              <h2 className="text-xl font-medium text-white">Diet Plan</h2>
            </div>
            <p className="text-neutral-300 text-lg">
              {healthReport?.diet_plan || "No diet plan available"}
            </p>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2 p-6 rounded-2xl bg-neutral-950/50 backdrop-blur-xl border border-white/10 space-y-4"
          >
            <div className="flex items-center gap-3">
              <Article weight="duotone" className="w-6 h-6 text-white/90" />
              <h2 className="text-xl font-medium text-white">Conversation Summary</h2>
            </div>
            <p className="text-neutral-300 text-lg">
              {results?.call_analysis?.call_summary || "No summary available"}
            </p>
          </motion.div>
        </div>

        {/* Export and Back Buttons */}
        <div className="fixed bottom-8 right-8 z-50 flex gap-4">
          <AnimatedButton onClick={handleExportPDF}>
            <Export weight="duotone" className="w-5 h-5" />
            <span>Export Results</span>
          </AnimatedButton>
        </div>

        {/* Back Button - Now sticky */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <AnimatedButton onClick={() => navigate('/')}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </AnimatedButton>
        </div>
      </div>
    </motion.div>
  );
}

export default CallResults;
