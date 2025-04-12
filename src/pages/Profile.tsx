import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { GradientBackground } from '../components/GradientBackground';

// Country options array moved outside component
const countryOptions = [
  { code: "+91", country: "India", flag: "/in.svg" },
  { code: "+1", country: "United States", flag: "/us.svg" },
];

// Parse phone number function moved outside component
const parsePhoneNumber = (fullNumber: string) => {
  for (const option of countryOptions) {
    if (fullNumber.startsWith(option.code)) {
      return {
        countryCode: option.code,
        phone: fullNumber.slice(option.code.length)
      };
    }
  }
  return null;
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format date to a simpler format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // If it's today
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    // If it's yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    // If it's this year
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    // If it's a different year
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get country info based on country code
  const getCountryInfo = (code: string) => {
    return countryOptions.find(option => option.code === code) || null;
  };

  // Fetch user profile on mount
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('phone_number')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        if (data?.phone_number) {
          const parsed = parsePhoneNumber(data.phone_number);
          if (parsed) {
            setCountryCode(parsed.countryCode);
            setPhone(parsed.phone);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          phone_number: countryCode + phone,
          full_name: user.user_metadata.full_name,
          email: user.email,
          avatar_url: user.user_metadata.avatar_url
        });

      if (error) throw error;
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating phone number:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen p-4 sm:p-8">
        <div className="max-w-4xl mx-auto w-full">
          <div className="relative backdrop-blur-xl bg-neutral-900/50 rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/10">
                {user.user_metadata.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt={user.user_metadata.full_name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-400 to-indigo-400 flex items-center justify-center text-white text-3xl font-medium">
                    {(user.user_metadata.full_name || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                  {user.user_metadata.full_name || 'User'}
                </h1>
                <p className="text-neutral-400">{user.email}</p>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white/90">Phone Number</h2>
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="h-12 px-3 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-neutral-600 transition-colors flex items-center gap-2 text-neutral-300"
                        >
                          {countryCode}
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        {dropdownOpen && (
                          <div className="absolute mt-2 w-48 bg-neutral-800/90 backdrop-blur-xl border border-neutral-700 rounded-xl shadow-xl z-50">
                            {countryOptions.map((option) => (
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
                          </div>
                        )}
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="flex-1 h-12 px-4 rounded-xl bg-neutral-800 border border-neutral-700 hover:border-neutral-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-white placeholder-neutral-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-6 h-12 rounded-xl border border-neutral-700 text-neutral-300 font-semibold hover:bg-neutral-800/50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {countryCode && phone ? (
                        <>
                          {getCountryInfo(countryCode) && (
                            <img 
                              src={getCountryInfo(countryCode)?.flag} 
                              alt={getCountryInfo(countryCode)?.country}
                              className="w-5 h-4" 
                            />
                          )}
                          <p className="text-neutral-300">
                            <span className="text-neutral-500">{countryCode}</span>
                            {phone}
                          </p>
                        </>
                      ) : (
                        <p className="text-neutral-300">No phone number set</p>
                      )}
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 h-10 rounded-lg border border-neutral-700 text-neutral-300 font-medium hover:bg-neutral-800/50 transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white/90">Account Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
                    <p className="text-sm text-neutral-400">Account Created</p>
                    <p className="text-neutral-200 mt-1">
                      {user.created_at ? formatDate(user.created_at) : '-'}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-neutral-800/50 border border-neutral-700">
                    <p className="text-sm text-neutral-400">Last Sign In</p>
                    <p className="text-neutral-200 mt-1">
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
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
    </GradientBackground>
  );
};

export default Profile; 