import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Phone } from '@phosphor-icons/react';
import { AnimatedButton } from '../components/AnimatedButton';

export default function Onboarding() {
    const { user } = useAuth();
    const [phone, setPhone] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    user_id: user?.id,
                    phone_number: countryCode + phone,
                    full_name: user?.user_metadata.full_name,
                    email: user?.email,
                    avatar_url: user?.user_metadata.avatar_url
                });

            if (error) throw error;
            navigate('/');
        } catch (error) {
            console.error("Error saving phone number:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen pt-32 px-4 sm:px-8"
        >
            <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full py-8">
                <div className="w-full space-y-8">
                    <div className="text-center space-y-6 px-4">
                        {user?.user_metadata.avatar_url && (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt={user.user_metadata.full_name || 'User'}
                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto border border-white/10 shadow-xl"
                            />
                        )}
                        <div className="space-y-2">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-medium text-white">
                                Welcome!
                            </h1>
                            <p className="text-neutral-400 text-base sm:text-lg">
                                {user?.email}
                            </p>
                        </div>
                        <p className="text-neutral-300 text-base sm:text-lg max-w-sm mx-auto">
                            To complete your profile, please provide your phone number for health assessments.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 w-full">
                        <div className="p-4 sm:p-6 rounded-2xl bg-neutral-950/50 backdrop-blur-xl border border-white/10 space-y-4 relative z-50">
                            <div className="flex items-center gap-3">
                                <Phone weight="duotone" className="w-6 h-6 text-white/90" />
                                <h2 className="text-xl font-medium text-white">Phone Number</h2>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 relative">
                                <div className="relative w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neutral-900/50 border border-white/10 hover:bg-neutral-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
                                    >
                                        <img 
                                            src={countryCode === "+91" ? "/in.svg" : "/us.svg"}
                                            alt={countryCode === "+91" ? "India" : "USA"}
                                            className="w-5 h-4"
                                        />
                                        <span className="text-white/90">{countryCode}</span>
                                        <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute left-0 top-full mt-2 w-full sm:w-48 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-[60]"
                                        >
                                            {[
                                                { code: "+91", country: "India", flag: "/in.svg" },
                                                { code: "+1", country: "United States", flag: "/us.svg" },
                                            ].map((option) => (
                                                <button
                                                    key={option.code}
                                                    type="button"
                                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                                    onClick={() => {
                                                        setCountryCode(option.code);
                                                        setDropdownOpen(false);
                                                    }}
                                                >
                                                    <img src={option.flag} alt={option.country} className="w-5 h-4" />
                                                    <span className="text-white/90">{option.country}</span>
                                                    <span className="ml-auto text-white/60">{option.code}</span>
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>

                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-neutral-900/50 text-white border border-white/10 rounded-xl px-4 py-3 
                                        focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-white/40"
                                    placeholder="Enter your phone number"
                                    required
                                />
                            </div>
                        </div>

                        <AnimatedButton
                            type="submit"
                            disabled={loading || !phone}
                            className="w-full"
                        >
                            <div className="flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Completing Setup...</span>
                                    </>
                                ) : (
                                    <span>Complete Profile Setup</span>
                                )}
                            </div>
                        </AnimatedButton>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}