import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function AudioControls() {
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio('/background.mp3');
        
        if (audioRef.current) {
            audioRef.current.loop = true;
            audioRef.current.volume = 0.4;
            
            const attemptAutoplay = async () => {
                try {
                    await audioRef.current?.play();
                } catch {
                    console.log('Autoplay failed, waiting for user interaction');
                    const playAudio = () => {
                        audioRef.current?.play();
                        document.removeEventListener('click', playAudio);
                    };
                    document.addEventListener('click', playAudio);
                }
            };

            attemptAutoplay();
        }

        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.muted = isMuted;
        }
    }, [isMuted]);

    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMuted(!isMuted)}
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-neutral-900/50 backdrop-blur-sm border border-white/10 shadow-lg hover:scale-110 transition-transform duration-200"
            title={isMuted ? "Unmute" : "Mute"}
        >
            {isMuted ? (
                <svg className="w-6 h-6 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
            ) : (
                <svg className="w-6 h-6 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            )}
        </motion.button>
    );
} 