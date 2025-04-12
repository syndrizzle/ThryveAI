import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsSafari } from '../hooks/useIsSafari';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { retellService } from '../lib/retellService';
import { GradientBackground } from '../components/GradientBackground';

function Form(): JSX.Element {
    const isSafari = useIsSafari();
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

            // Initiate call using the stored phone number
            const callId = await retellService.createCall(profile.phone_number);
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
        <GradientBackground className="flex flex-col items-center justify-center">
            <div className="px-6 sm:px-8 max-w-2xl mx-auto w-full py-12 sm:py-16">
                <header className="flex flex-col items-center text-center gap-y-8">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-48 sm:w-56 md:w-64 pointer-events-none"
                    >
                        <source 
                            src={isSafari ? "/waves.mov" : "/waves.webm"} 
                            type={isSafari ? "video/quicktime" : "video/webm"} 
                        />
                    </video>
                    <div className="space-y-6">
                        <h1 className="bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-500 bg-clip-text text-transparent text-6xl sm:text-7xl md:text-8xl font-heading">
                            Thryve
                        </h1>
                        <div className="space-y-3">
                            <h2 className="text-xl sm:text-2xl text-neutral-100 font-bold font-body">
                                Your AI-Powered Health Detective
                            </h2>
                            <p className="text-neutral-300 font-body text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
                                Ready to understand your health better? Have a conversation with our AI that helps identify potential health concerns and provides personalized preventive tips.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="mt-12 flex justify-center">
                    <motion.button
                        onClick={handleStartCall}
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Initiating Health Check...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <span>Start Health Assessment</span>
                            </>
                        )}
                    </motion.button>
                </div>
            </div>
        </GradientBackground>
    );
}

export default Form;
