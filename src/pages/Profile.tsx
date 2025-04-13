import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AnimatedButton } from '../components/AnimatedButton';

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
    if (!user || !phone) return;
    
    setLoading(true);
    try {
        const { error } = await supabase
            .from('user_profiles')
            .upsert(
                {
                    user_id: user.id,
                    phone_number: countryCode + phone,
                    full_name: user.user_metadata.full_name,
                    email: user.email,
                    avatar_url: user.user_metadata.avatar_url
                },
                {
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                }
            );

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8"
    >
      <div className="w-full max-w-xl">
        <div className="p-8 rounded-2xl bg-neutral-950/50 backdrop-blur-xl border border-white/10 space-y-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border border-white/10 ring-2 ring-white/5 ring-offset-2 ring-offset-black/50">
              {user?.user_metadata.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-medium">
                  {(user?.user_metadata.full_name || user?.email || 'U')[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-heading font-medium text-white">
                {user?.user_metadata.full_name || 'User'}
              </h1>
              <p className="text-neutral-400 mt-1">{user?.email}</p>
            </div>
          </div>

          {/* Phone Number Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">Phone Number</h2>
              {!isEditing && (
                <AnimatedButton onClick={() => setIsEditing(true)}>
                  Edit Number
                </AnimatedButton>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="h-12 px-3 rounded-xl bg-neutral-900/60 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors flex items-center gap-2 text-white min-w-[80px]"
                    >
                      {getCountryInfo(countryCode) && (
                        <img src={getCountryInfo(countryCode)?.flag} alt="" className="w-5 h-4" />
                      )}
                      {countryCode}
                    </button>
                    {dropdownOpen && (
                      <div className="absolute mt-2 w-48 rounded-xl bg-neutral-950/80 backdrop-blur-xl border border-white/10 overflow-hidden">
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
                    className="flex-1 h-12 px-4 rounded-xl bg-neutral-900/60 backdrop-blur-sm border border-white/10 hover:border-white/20 focus:border-white/30 transition-colors text-white placeholder-neutral-500"
                  />
                </div>
                <div className="flex gap-2">
                  <AnimatedButton type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </AnimatedButton>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 h-12 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-900/40 backdrop-blur-sm border border-white/10">
                <div className="flex items-center gap-3">
                  {countryCode && phone ? (
                    <>
                      {getCountryInfo(countryCode) && (
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/5">
                          <img 
                            src={getCountryInfo(countryCode)?.flag} 
                            alt={getCountryInfo(countryCode)?.country}
                            className="w-5 h-4" 
                          />
                          <span className="text-neutral-400 text-sm">{countryCode}</span>
                        </div>
                      )}
                      <span className="text-white text-lg">{phone}</span>
                    </>
                  ) : (
                    <p className="text-neutral-400">No phone number set</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6 flex justify-center">
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
};

export default Profile;