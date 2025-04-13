import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedButton } from '../components/AnimatedButton';
import { Warning } from '@phosphor-icons/react';

function Error(): JSX.Element {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8 space-y-8"
        >
            <div className="w-full max-w-xl">
                <div className="p-8 rounded-2xl bg-neutral-950/50 backdrop-blur-xl border border-white/10 space-y-8">
                    {/* Error Icon */}
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
                            <Warning size={48} weight="duotone" className="text-red-500" />
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="space-y-4 text-center">
                        <h1 className="text-3xl font-heading font-medium text-white">
                            Connection Error
                        </h1>
                        <div className="space-y-2">
                            <p className="text-neutral-300 text-lg">
                                We couldn't connect your call due to an error.
                            </p>
                            <p className="text-neutral-400">
                                Please make sure that you've picked up the call. This might happen if the call was declined or went to voicemail.
                            </p>
                        </div>
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-center pt-4">
                        <AnimatedButton onClick={() => navigate("/")}>
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
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                />
                            </svg>
                            <span>Back to Home</span>
                        </AnimatedButton>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default Error;
