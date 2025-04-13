import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { retellService } from '../lib/retellService';
import { Drop, Timer, Waves, Moon } from '@phosphor-icons/react';

const healthTips = [
    {
        tip: "Stay hydrated: Drink 8 glasses of water daily",
        icon: <Drop weight="duotone" className="w-6 h-6 text-white/90" />
    },
    {
        tip: "Take regular breaks: 5 minutes every hour",
        icon: <Timer weight="duotone" className="w-6 h-6 text-white/90" />
    },
    {
        tip: "Practice deep breathing for stress relief",
        icon: <Waves weight="duotone" className="w-6 h-6 text-white/90" />
    },
    {
        tip: "Get 7-9 hours of sleep each night",
        icon: <Moon weight="duotone" className="w-6 h-6 text-white/90" />
    }
];

function Form(): JSX.Element {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleStartCall = async () => {
        setLoading(true);
        
        try {
            // Get user's phone number from profile
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('phone_number')
                .eq('user_id', user?.id)
                .single();

            if (profileError || !profile?.phone_number) {
                throw new Error('Could not find your phone number');
            }

            // Get user's first name from metadata
            const firstName = user?.user_metadata.full_name?.split(" ")[0] || "User";

            // Initiate call using the stored phone number and first name
            const callId = await retellService.createCall(profile.phone_number, firstName);
            localStorage.setItem("callId", callId);
            navigate("/call-progress", { state: { from: 'app' } });
        } catch (error) {
            console.error("Error:", error);
            navigate("/error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col min-h-screen py-32 px-4 sm:px-8"
        >
          <div className="flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto w-full space-y-12 py-8">
            <div className="space-y-4 text-center px-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading py-4 font-medium">
                Welcome back,{" "}
                {user?.user_metadata.full_name?.split(" ")[0] || "there"}
              </h1>
              <p className="text-neutral-300 text-base sm:text-lg mx-auto max-w-2xl">
                Let's check in on your health today. Our AI assistant is ready to
                listen and provide personalized insights for your well-being.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-2xl">
              {healthTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <div className="p-4 rounded-xl bg-neutral-900/40 backdrop-blur-xl gap-3 group-hover:bg-neutral-800/60 transition-colors w-full h-full flex items-center justify-center border border-neutral-600/20">
                    {tip.icon}
                    <p className="text-neutral-200 text-sm leading-relaxed pt-0.5">
                      {tip.tip}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={handleStartCall}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto relative group p-[1px] rounded-xl overflow-hidden animate-border [background:linear-gradient(45deg,transparent,theme(colors.neutral.900)_40%,transparent)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.neutral.600/.3)_20%,theme(colors.white)_40%,theme(colors.neutral.600/.3))_border-box]"
            >
              <div className="relative px-8 py-4 rounded-xl bg-neutral-950/90 backdrop-blur-sm text-white font-medium group-hover:bg-neutral-900/90 transition-colors">
                {loading ? (
                  <div className="flex items-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Initiating Health Check...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>Start Health Assessment</span>
                  </div>
                )}
              </div>
            </motion.button>
          </div>
        </motion.div>
    );
}

export default Form;
