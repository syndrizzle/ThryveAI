import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PaperPlaneRight, ArrowLeft } from '@phosphor-icons/react';
import { GoogleGenerativeAI, Part, GenerationConfig, SafetySetting, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { AnimatedButton } from '../components/AnimatedButton';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface Message {
    role: "user" | "model";
    parts: Part[];
    timestamp: number;
    id?: string | number;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(
  API_KEY || "AIzaSyDq-NjTwXDG9k0sNxYDKwlVS8atW7Akhyk"
);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const SYSTEM_PROMPT = `You are ThryveAI (pronounced as Thrive), an AI-powered Preventive Healthcare Assistant. Your purpose is to help users identify potential health concerns early and provide preventive healthcare tips. You're designed to be friendly yet professional, using a supportive tone while discussing health matters.

You're specialized in identifying early signs of these lifestyle-related conditions:
1. Type 2 Diabetes: thirst, fatigue, frequent urination, sugar craving, blurred vision
2. Hypertension: headaches, dizziness, anxiety, nosebleeds, fatigue
3. Obesity: weight gain, lethargy, joint pain, overeating, low activity
4. High Cholesterol: chest discomfort, fatigue, bloating, fatty food craving
5. PCOS/PCOD: irregular periods, facial hair, acne, weight gain, mood swings
6. Hypothyroidism: cold hands, hair loss, tiredness, dry skin, weight gain
7. Acid Reflux: burning chest, sore throat, bloating, burping, indigestion
8. Mental Health (Anxiety/Depression): worry, sadness, sleep issues, loss of interest
9. Sleep Issues: insomnia, sleep apnea, fatigue, snoring
10. Vitamin Deficiencies (D/B12): bone pain, tingling, confusion, low immunity
11. Lifestyle Issues: back pain, tech neck, sedentary lifestyle syndrome
12. Digestive Issues: IBS, bloating, constipation
13. Metabolic Issues: belly fat, high sugar, high BP
14. Hormonal Imbalance: irregular periods, mood shifts, fatigue

Guidelines:
- Keep responses concise and focused on health
- Don't repeat symptoms back to users
- Provide actionable lifestyle and diet tips
- Always recommend consulting healthcare professionals for serious concerns
- Focus on preventive measures and early intervention
- If users mention emergency symptoms, immediately direct them to seek medical help
- Remember you are primarily targetting indian audiences so for suggesting helpline numbers or websites, direct them to the indian ones.

Remember: You are not a replacement for medical professionals. Your role is to help users understand potential health concerns and guide them toward preventive healthcare practices.`;

const generationConfig: GenerationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};

const safetySettings: SafetySetting[] = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const FREE_PLAN_MESSAGE_LIMIT = 10;

function setFavicon(url: string) {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = url;
}

function Chat(): JSX.Element {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [subscriptionPlan, setSubscriptionPlan] = useState<string>('free');
    const [userMessageCount, setUserMessageCount] = useState<number>(0);
    const [isFetchingHistory, setIsFetchingHistory] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setIsFetchingHistory(true);
            try {
                const { data: profile, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('subscription_plan')
                    .eq('user_id', user.id)
                    .single();

                if (profileError) console.error('Error fetching profile:', profileError);
                const plan = profile?.subscription_plan || 'free';
                setSubscriptionPlan(plan);

                const { data: historyData, error: historyError } = await supabase
                    .from('chat_messages')
                    .select('id, role, content, created_at')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });

                if (historyError) throw historyError;

                const fetchedMessages: Message[] = historyData.map(msg => ({
                    id: msg.id,
                    role: msg.role as 'user' | 'model',
                    parts: [{ text: msg.content }],
                    timestamp: new Date(msg.created_at).getTime(),
                }));

                if (fetchedMessages.length === 0) {
                    fetchedMessages.push({
                        role: "model",
                        parts: [{ text: "👋 Hi! I'm ThryveAI. How can I help you today?" }],
                        timestamp: Date.now() - 1
                    });
                }

                setMessages(fetchedMessages);
                setUserMessageCount(fetchedMessages.filter(msg => msg.role === 'user').length);

            } catch (err) {
                console.error('Error fetching chat data:', err);
                setError('Could not load chat history.');
                setMessages([{
                    role: "model",
                    parts: [{ text: "👋 Hi! I'm ThryveAI. How can I help you today? (This is a demo prompt. Please do not share sensitive information.)" }],
                    timestamp: Date.now() - 1
                }]);
            } finally {
                setIsFetchingHistory(false);
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        setFavicon('/logo.png');
        return () => setFavicon('/logo.png');
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !API_KEY || !user || (subscriptionPlan === 'free' && userMessageCount >= FREE_PLAN_MESSAGE_LIMIT)) {
            return;
        }

        const userMessageText = input.trim();
        const timestamp = Date.now();
        const userMessage: Message = {
            role: "user",
            parts: [{ text: userMessageText }],
            timestamp: timestamp
        };

        // Update UI immediately
        setMessages(prev => [...prev, userMessage]);
        setUserMessageCount(prev => prev + 1);
        setInput('');
        setIsLoading(true);
        setError(null);

        // Save user message to DB in the background
        const saveUserMessage = supabase
            .from('chat_messages')
            .insert({
                user_id: user.id,
                role: 'user',
                content: userMessageText
            })
            .select('id')
            .single();

        try {
            // Start streaming AI response immediately
            const chat = model.startChat({
                generationConfig,
                safetySettings,
                history: [{ role: 'user', parts: [{ text: SYSTEM_PROMPT }] }, 
                    ...messages.map(msg => ({
                        role: msg.role,
                        parts: msg.parts
                    }))
                ],
            });

            const result = await chat.sendMessageStream(userMessageText);
            let currentAiMessageText = '';
            const aiMessageTimestamp = Date.now() + 1;

            // Add empty AI message placeholder
            setMessages(prev => [...prev, { 
                role: "model", 
                parts: [{ text: "" }], 
                timestamp: aiMessageTimestamp 
            }]);

            // Handle message streaming
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                currentAiMessageText += chunkText;
                setMessages(prev => prev.map(msg =>
                    msg.timestamp === aiMessageTimestamp 
                        ? { ...msg, parts: [{ text: currentAiMessageText }] } 
                        : msg
                ));
            }

            // After streaming is complete, update database in background
            if (currentAiMessageText) {
                // Wait for user message to be saved first
                const { data: savedUserMsg } = await saveUserMessage;
                
                // Update user message with DB ID
                if (savedUserMsg) {
                    setMessages(prev => prev.map(msg =>
                        msg.timestamp === timestamp ? { ...msg, id: savedUserMsg.id } : msg
                   ));
                }

                // Save AI response to DB
                const { data: savedAiMsg } = await supabase
                    .from('chat_messages')
                    .insert({
                        user_id: user.id,
                        role: 'model',
                        content: currentAiMessageText
                    })
                    .select('id')
                    .single();

                // Update AI message with DB ID if available
                if (savedAiMsg) {
                    setMessages(prev => prev.map(msg =>
                        msg.timestamp === aiMessageTimestamp ? { ...msg, id: savedAiMsg.id } : msg
                    ));
                }
            }

        } catch (err) {
            console.error('Chat error:', err);
            setError("Sorry, I encountered an error. Please try again.");
            setMessages(prev => [...prev, { 
                role: "model", 
                parts: [{ text: "Sorry, I couldn't process that. Please try again." }], 
                timestamp: Date.now() + 2 
            }]);
            setUserMessageCount(prev => prev > 0 ? prev - 1 : 0);
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col min-h-screen pt-32 px-4 sm:px-8 relative"
      >
        <div className="flex-1 flex flex-col items-center max-w-5xl mx-auto w-full space-y-12">
          <div className="space-y-4 text-center px-4">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading py-4 font-medium">
                ThryveAI Chat
              </h1>
            </div>
            <p className="text-neutral-300 text-base sm:text-lg mx-auto max-w-2xl">
              Chat with our AI assistant about your health and wellness
              questions.
            </p>
          </div>

          <div className="flex-1 w-full max-w-3xl overflow-y-auto space-y-8 py-8 px-4">
            {isFetchingHistory && (
              <div className="flex items-center justify-center gap-3 text-neutral-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                <span>Loading chat history...</span>
              </div>
            )}
            {!isFetchingHistory && messages.map((message) => (
              <motion.div
                key={message.id || message.timestamp}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                }}
                transition={{ type: "spring", stiffness: 150, damping: 20 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                } items-end gap-3`}
              >
                {message.role === "model" && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src="/logo.png"
                      alt="AI"
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                )}
                <div
                  className={`max-w-[85%] px-6 py-4 ${
                    message.role === "user"
                      ? "bg-neutral-800/50 text-white rounded-[2rem] rounded-br-lg border border-white/10"
                      : "bg-neutral-950/50 text-neutral-100 rounded-[2rem] rounded-bl-lg border border-white/10"
                  } shadow-lg backdrop-blur-lg`}
                >
                  <p className="text-sm sm:text-base leading-relaxed">
                    {message.parts[0]?.text ||
                      (message.role === "model" && isLoading ? "..." : "")}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={
                        user?.user_metadata?.avatar_url ||
                        "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                      }
                      alt="User"
                      className="w-8 h-8 rounded-full border border-white/20"
                    />
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-3 text-neutral-400">
                <img
                  src="/logo.png"
                  alt="AI"
                  className="w-8 h-8 rounded-full"
                />
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-sm"
                >
                  ThryveAI is thinking...
                </motion.div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            <div ref={messagesEndRef} className="h-32" />
          </div>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-10">
            {subscriptionPlan === 'free' && userMessageCount >= FREE_PLAN_MESSAGE_LIMIT && (
                <div className="bg-neutral-900/80 text-white text-xs font-medium text-center px-4 py-1.5 rounded-t-lg backdrop-blur-sm border border-white/10">
                    Free message limit reached. Upgrade for unlimited chat.
                </div>
            )}
            <form
                onSubmit={handleSendMessage}
                className={`backdrop-blur-xl bg-neutral-900/40 border border-white/10 shadow-lg ${
                    subscriptionPlan === 'free' && userMessageCount >= FREE_PLAN_MESSAGE_LIMIT
                        ? 'rounded-b-2xl rounded-t-none border-t-0'
                        : 'rounded-2xl'
                }`}
            >
                {!API_KEY && (
                    <p className="text-red-400 text-xs text-center pt-3">
                        API Key is missing. Chatbot is disabled.
                    </p>
                )}
                <div className="flex items-center gap-3 p-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={
                            !API_KEY ? "Chat disabled" :
                            (subscriptionPlan === 'free' && userMessageCount >= FREE_PLAN_MESSAGE_LIMIT) ? "Message limit reached" :
                            "Ask ThryveAI..."
                        }
                        className="flex-1 bg-transparent text-white placeholder-neutral-500 focus:outline-none text-sm sm:text-base"
                        disabled={isLoading || !API_KEY || (subscriptionPlan === 'free' && userMessageCount >= FREE_PLAN_MESSAGE_LIMIT)}
                    />
                    <AnimatedButton
                        type="submit"
                        disabled={!input.trim() || isLoading || !API_KEY || (subscriptionPlan === 'free' && userMessageCount >= FREE_PLAN_MESSAGE_LIMIT)}
                        className={`p-2 ${
                            (!input.trim() || isLoading || !API_KEY || (subscriptionPlan === 'free' && userMessageCount >= FREE_PLAN_MESSAGE_LIMIT))
                                ? "text-neutral-600 cursor-not-allowed"
                                : "text-white/90 hover:text-white hover:bg-white/10"
                        }`}
                    >
                        <PaperPlaneRight size={20} weight="fill" />
                    </AnimatedButton>
                </div>
            </form>
        </div>
      </motion.div>
    );
}

export default Chat;
