import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useIsSafari } from '../hooks/useIsSafari';

function Title(): JSX.Element {
    const navigate = useNavigate();
    const isSafari = useIsSafari();

    useEffect(() => {
        // Set the visited flag
        sessionStorage.setItem("visited", "true");
        
        const timer = setTimeout(() => {
            navigate('/home', { state: { from: 'app' } });
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className="text-center space-y-6 py-12 sm:py-16">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="w-48 sm:w-56 md:w-64 mx-auto mb-8 pointer-events-none"
            >
                <source 
                    src={isSafari ? "/waves.mov" : "/waves.webm"} 
                    type={isSafari ? "video/quicktime" : "video/webm"} 
                />
            </video>
            <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-gradient-to-r from-indigo-400 via-purple-400 to-sky-500 bg-clip-text text-transparent text-6xl sm:text-7xl md:text-9xl font-heading mix-blend-plus-lighter px-4"
            >
                Nirvaan
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.2 }}
                className="text-neutral-300 font-thin text-lg sm:text-xl"
            >
                YOUR JOURNEY TO PEACE BEGINS HERE
            </motion.p>
        </div>
    );
}

export default Title;