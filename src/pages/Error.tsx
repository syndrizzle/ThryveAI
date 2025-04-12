import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Error(): JSX.Element {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-10 justify-center items-center flex flex-col"
            >
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading bg-gradient-to-r from-purple-400 to-red-500 bg-clip-text text-transparent">
                    OOPS!
                </h1>
                <div>
                    <p className="text-neutral-200 text-lg sm:text-xl md:text-2xl font-body">
                        We couldn't connect your call due to some error.
                    </p>
                    <p className="text-neutral-200 text-lg sm:text-xl md:text-2xl font-body max-w-3xl">
                        Please make sure that you've picked up the call. Possible reasons
                        include call getting declined or voicemail activation.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/")}
                    className="group flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
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
    );
}

export default Error;
