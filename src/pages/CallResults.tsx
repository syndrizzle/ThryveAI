import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { retellService, CallDetails } from '../lib/retellService';

interface Message {
  role: 'Agent' | 'User';
  content: string;
}

function CallResults(): JSX.Element {
  const navigate = useNavigate();
  const [results, setResults] = useState<CallDetails | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      const callId = localStorage.getItem("callId");
      
      try {
        if (callId) {
          const callDetails = await retellService.getCallDetails(callId);
          setResults(callDetails);
          localStorage.removeItem("callId");
        }
      } catch (error) {
        console.error("Error fetching call results:", error);
        navigate('/error');
      }
    };

    fetchResults();
  }, [navigate]);

  const parseTranscript = (transcript: string): Message[] => {
    if (!transcript) return [];
    
    return transcript.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [role, ...contentParts] = line.split(':');
        return {
          role: role.trim() as 'Agent' | 'User',
          content: contentParts.join(':').trim().replace(/"/g, '')
        };
      });
  };

  return (
    <div className="container mx-auto px-4 sm:px-6">
      <div className="min-h-screen flex flex-col">
        <div className="py-6 sm:py-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent font-heading py-4">
            Call Analysis
          </h1>
          <p className="text-neutral-300 text-lg sm:text-xl font-body py-2 px-4">
            Here's what we found from your conversation
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 sm:space-y-8 mb-24"
        >
          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/50 backdrop-blur-xl border border-white/[0.08] shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">📝</span>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Summary
              </h3>
            </div>
            <p className="text-neutral-300 leading-relaxed text-lg">
              {results?.summary || "No summary available"}
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/50 backdrop-blur-xl border border-white/[0.08] shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">💭</span>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                User Sentiment
              </h3>
            </div>
            <p className="text-neutral-300 leading-relaxed text-lg">
              {results?.user_sentiment || "No sentiment data available"}
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/50 backdrop-blur-xl border border-white/[0.08] shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xl sm:text-2xl">💬</span>
              <h3 className="text-3xl sm:text-3xl font-bold bg-gradient-to-r from-sky-400 to-teal-400 bg-clip-text text-transparent">
                Transcript
              </h3>
            </div>
            <div className="space-y-3">
              {results?.transcript ? (
                parseTranscript(results.transcript).map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${message.role === 'User' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-[90%] sm:max-w-[80%] p-3 rounded-2xl flex flex-col gap-1
                        ${message.role === 'User' 
                          ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-tr-none border-t border-r border-indigo-500/20' 
                          : 'bg-gradient-to-r from-neutral-800/60 to-neutral-900/60 rounded-tl-none border-t border-l border-neutral-500/20'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs sm:text-sm pr-4 sm:pr-8 font-bold font-body ${message.role === 'User' ? 'text-purple-400' : 'text-gray-200'}`}>
                          {message.role}
                        </span>
                      </div>
                      <p className="text-neutral-300 text-sm leading-relaxed pr-2 sm:pr-4">
                        {message.content}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-neutral-400 text-center">No transcript available</p>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 w-[90%] sm:w-auto"
        >
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white group-hover:-translate-x-1 transition-transform"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-white font-black font-body">Back to Home</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default CallResults;
