import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from '@phosphor-icons/react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { AnimatedButton } from '../components/AnimatedButton'; // Assuming AnimatedButton is reusable

const plans = [
    {
        name: "Free",
        price: "$0",
        frequency: "/ month",
        description: "Get started with basic access.",
        features: [
            "10 AI chat messages",
            "View health tips",
            "Basic profile management",
            "Limited history"
        ],
        cta: "Current Plan",
        planId: 'free',
        highlight: false,
    },
    {
        name: "Premium",
        price: "$20",
        frequency: "/ month",
        description: "Unlock full access to health assessments.",
        features: [
            "Unlimited AI chat messages",
            "AI voice health assessments",
            "Detailed call summaries & insights",
            "Full conversation history",
            "Priority support",
        ],
        cta: "Upgrade to Premium",
        planId: 'premium',
        highlight: true,
    },
];

function Pricing(): JSX.Element {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [currentPlan, setCurrentPlan] = useState<string>('free'); // Fetch this ideally

    // Fetch current plan on load (optional, but good UX)
    useEffect(() => {
        const fetchPlan = async () => {
            if (!user) return;
            const { data, error } = await supabase
                .from('user_profiles')
                .select('subscription_plan')
                .eq('user_id', user.id)
                .single();
            
            if (data && !error) {
                setCurrentPlan(data.subscription_plan || 'free');
            }
        };
        fetchPlan();
    }, [user]);

    const handleSelectPlan = async (planId: string) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (planId === currentPlan) return; // No action if already on this plan

        setLoadingPlan(planId);
        try {
            const { error } = await supabase
                .from('user_profiles')
                .update({ subscription_plan: planId })
                .eq('user_id', user.id);

            if (error) throw error;
            setCurrentPlan(planId); // Update local state
            // Optionally show a success message or navigate
            console.log(`Successfully updated to ${planId} plan.`);

        } catch (error) {
            console.error("Error updating plan:", error);
            // Show error message to user
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col min-h-screen justify-center items-center py-16 px-4 sm:px-8 relative" // Added relative positioning for potential future absolute elements inside
      >
        <div className="flex-1 flex flex-col items-center max-w-5xl mx-auto w-full space-y-12 py-8">
          <div className="space-y-4 text-center px-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading py-4 font-medium">
              Choose Your Plan
            </h1>
            <p className="text-neutral-300 text-base sm:text-lg mx-auto max-w-2xl">
              Select the plan that best fits your health journey needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`rounded-2xl p-8 flex flex-col backdrop-blur-lg ${
                  plan.highlight
                    ? "bg-neutral-900/60  border-2 border-zinc-600/70 shadow-xl shadow-zinc-400/20"
                    : "bg-neutral-950/50 border border-white/20"
                }`}
              >
                <h2 className="text-2xl font-semibold text-white">
                  {plan.name}
                </h2>
                <p className="mt-2 text-neutral-400">{plan.description}</p>

                <div className="mt-6">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-neutral-400">{plan.frequency}</span>
                </div>

                <ul className="mt-8 space-y-3 flex-grow">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3">
                      <CheckCircle
                        size={20}
                        weight="duotone"
                        className={
                          plan.highlight ? "text-purple-400" : "text-green-500"
                        }
                      />
                      <span className="text-neutral-300 text-sm">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <AnimatedButton
                    onClick={plan.planId === 'premium' ? undefined : () => handleSelectPlan(plan.planId)} // Disable onClick for premium plan
                    disabled={
                      loadingPlan === plan.planId || 
                      currentPlan === plan.planId || 
                      plan.planId === 'premium' // Also explicitly disable the premium button visually
                    }
                    className={`w-full ${
                      plan.highlight ? "" : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    {loadingPlan === plan.planId ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          {" "}
                          {/* Simple spinner */}
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
                        Processing...
                      </div>
                    ) : currentPlan === plan.planId ? (
                      "Current Plan"
                    ) : plan.planId === 'premium' ? ( // Change text for disabled premium button
                      "Coming Soon" // Or keep "Upgrade to Premium" if you prefer
                    ) : (
                      plan.cta
                    )}
                  </AnimatedButton>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Back Button */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"> 
          <AnimatedButton onClick={() => navigate('/')}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </AnimatedButton>
        </div>
      </motion.div>
    );
}

export default Pricing;
