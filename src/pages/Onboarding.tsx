import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

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
            className="min-h-screen flex items-center justify-center p-4"
        >
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-4">
                    {user.user_metadata.avatar_url && (
                        <img
                            src={user.user_metadata.avatar_url}
                            alt={user.user_metadata.full_name || 'User'}
                            className="w-24 h-24 rounded-full mx-auto border-2 border-white/10"
                        />
                    )}
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                        Welcome, {user.user_metadata.full_name}!
                    </h1>
                    <p className="text-neutral-300">
                        {user.email}
                    </p>
                    <p className="text-neutral-400 text-sm max-w-sm mx-auto">
                        To complete your profile setup, please provide a phone number where we can reach you for your mental health check-ins.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <label className="block text-sm font-medium text-neutral-300 mb-2">
                            Your Phone Number
                        </label>
                        <div className="flex">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="h-full px-4 py-3 flex items-center gap-2 bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-l-xl hover:bg-neutral-800 transition-colors focus:outline-none"
                                >
                                    <img 
                                        src={countryCode === "+91" ? "/in.svg" : "/us.svg"}
                                        alt={countryCode === "+91" ? "India" : "USA"}
                                        className="w-5 h-4"
                                    />
                                    <span className="text-neutral-200">{countryCode}</span>
                                    <svg
                                        className="w-4 h-4 text-neutral-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute mt-2 w-48 bg-neutral-800/90 backdrop-blur-xl border border-neutral-700 rounded-xl shadow-xl z-50"
                                    >
                                        {[
                                            { code: "+91", country: "India", flag: "/in.svg" },
                                            { code: "+1", country: "United States", flag: "/us.svg" },
                                        ].map((option) => (
                                            <button
                                                key={option.code}
                                                type="button"
                                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-neutral-700/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                                                onClick={() => {
                                                    setCountryCode(option.code);
                                                    setDropdownOpen(false);
                                                }}
                                            >
                                                <img src={option.flag} alt={option.country} className="w-5 h-4" />
                                                <span className="text-neutral-200">{option.country}</span>
                                                <span className="ml-auto text-neutral-400">{option.code}</span>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </div>

                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="flex-1 bg-neutral-800/50 backdrop-blur-sm text-neutral-200 border border-l-0 border-neutral-700 rounded-r-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                placeholder="Enter phone number"
                                required
                            />
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        disabled={loading || !phone}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-4 text-white bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl font-medium 
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                            shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200
                            flex items-center justify-center gap-3 text-lg"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-3">
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Saving...
                            </span>
                        ) : (
                            "Complete Profile"
                        )}
                    </motion.button>
                </form>
            </div>
        </motion.div>
    );
} 