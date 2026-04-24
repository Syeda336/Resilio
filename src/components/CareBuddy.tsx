import { useState, useEffect, useRef } from "react";
import {
  Send,
  MessageCircle,
  Bot,
  Heart,
  Sparkles,
} from "lucide-react";
import {
  projectId,
  publicAnonKey,
} from "../utils/supabase/info";
import { logActivity } from "../utils/activityTracker";
import { CareBuddyCharacter } from "./CareBuddyCharacter";
import { dashboardRefresh } from '../utils/dashboardRefresh';

// Flask API Configuration
// Set this to your Flask API URL (e.g., "http://localhost:5000" for local or your deployed URL)
const FLASK_API_URL = "http://localhost:5000"; // Change this to your deployed Flask API URL

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
  mood?:
    | "happy"
    | "sad"
    | "caring"
    | "worried"
    | "excited"
    | "calm"
    | "curious"
    | "surprised"
    | "playful"
    | "confident"
    | "grateful"
    | "mad"
    | "furious"
    | "angry"
    | "fear"
    | "neutral"
    | "disgust"
    | "tension"
    | "anxious"
    | "depressed"
    // New positive/neutral
    | "joy"
    | "contentment"
    | "relaxation"
    | "satisfaction"
    | "interest"
    | "thoughtful"
    | "attentive"
    | "focused"
    | "emotional-balance"
    | "serious"
    // New mild negative
    | "slight-concern"
    | "mild-fatigue"
    | "confusion"
    | "indifference"
    // New sadness variants
    | "hopelessness"
    | "grief"
    | "crying"
    | "loneliness"
    | "despair"
    | "tearfulness"
    // New anxiety variants
    | "nervousness"
    | "panic"
    | "restlessness"
    | "apprehensive"
    | "hypervigilance"
    | "overwhelm"
    // New anger variants
    | "irritation"
    | "frustration"
    | "aggression"
    | "pressure"
    | "rage"
    | "impatience"
    | "crazy"
    | "burnout"
    // New severe negative
    | "emotional-numbness"
    | "flat-affect"
    | "shame"
    | "guilt"
    | "emptiness"
    | "blank-expression"
    | "worthlessness"
    | "exhaust"
    | "mental-overload";
}

interface CareBuddySession {
  id: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
}

interface CareBuddyProps {
  userName: string;
  userId: string;
  accessToken?: string;
}

export function CareBuddy({
  userName,
  userId,
  accessToken,
}: CareBuddyProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentSession, setCurrentSession] =
    useState<CareBuddySession | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const authToken =
        accessToken ||
        localStorage.getItem("resilio_access_token") ||
        publicAnonKey;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/care-buddy/messages?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (response.ok) {
        const savedMessages = await response.json();
        if (savedMessages && savedMessages.length > 0) {
          setMessages(savedMessages);
        } else {
          // Show welcome message if no saved messages
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            text: `Hello ${userName}! I'm your Care Buddy. I'm here to listen and support you. How are you feeling today?`,
            sender: "bot",
            timestamp: new Date().toISOString(),
            mood: "happy",
          };
          setMessages([welcomeMessage]);
          saveMessage(welcomeMessage);
        }
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      // Show welcome message on error
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: `Hello ${userName}! I'm your Care Buddy. I'm here to listen and support you. How are you feeling today?`,
        sender: "bot",
        timestamp: new Date().toISOString(),
        mood: "happy",
      };
      setMessages([welcomeMessage]);
    }

    startSession();
  };

  const saveMessage = async (message: Message) => {
    try {
      const authToken =
        accessToken ||
        localStorage.getItem("resilio_access_token") ||
        publicAnonKey;

      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/care-buddy/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            ...message,
            userId,
          }),
        },
      );
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };
  
  const saveMoodEntry = async (mood: string) => {
    try {
      const authToken =
        accessToken ||
        localStorage.getItem("resilio_access_token") ||
        publicAnonKey;

      // Map Care Buddy moods to emoji moods for dashboard
      const moodMapping: { [key: string]: { emoji: string; label: string } } = {
        'happy': { emoji: '😊', label: 'Happy' },
        'joy': { emoji: '😄', label: 'Joyful' },
        'excited': { emoji: '🤩', label: 'Excited' },
        'grateful': { emoji: '🙏', label: 'Grateful' },
        'confident': { emoji: '💪', label: 'Confident' },
        'playful': { emoji: '😄', label: 'Playful' },
        'contentment': { emoji: '😌', label: 'Content' },
        'satisfaction': { emoji: '😊', label: 'Satisfied' },
        'calm': { emoji: '😌', label: 'Calm' },
        'relaxation': { emoji: '😌', label: 'Relaxed' },
        'emotional-balance': { emoji: '😊', label: 'Balanced' },
        'curious': { emoji: '🤔', label: 'Curious' },
        'interested': { emoji: '🤔', label: 'Interested' },
        'thoughtful': { emoji: '🤔', label: 'Thoughtful' },
        'attentive': { emoji: '👀', label: 'Attentive' },
        'focused': { emoji: '🎯', label: 'Focused' },
        'serious': { emoji: '😐', label: 'Serious' },
        'surprised': { emoji: '😮', label: 'Surprised' },
        'neutral': { emoji: '😐', label: 'Neutral' },
        'indifference': { emoji: '😐', label: 'Indifferent' },
        'slight-concern': { emoji: '😟', label: 'Slightly Concerned' },
        'mild-fatigue': { emoji: '😪', label: 'Tired' },
        'confusion': { emoji: '😕', label: 'Confused' },
        'worried': { emoji: '😟', label: 'Worried' },
        'anxious': { emoji: '😰', label: 'Anxious' },
        'nervousness': { emoji: '😰', label: 'Nervous' },
        'tension': { emoji: '😬', label: 'Tense' },
        'pressure': { emoji: '😓', label: 'Under Pressure' },
        'restlessness': { emoji: '😰', label: 'Restless' },
        'apprehensive': { emoji: '😟', label: 'Apprehensive' },
        'panic': { emoji: '😱', label: 'Panicked' },
        'hypervigilance': { emoji: '👁️', label: 'Hypervigilant' },
        'overwhelm': { emoji: '😵', label: 'Overwhelmed' },
        'fear': { emoji: '😨', label: 'Fearful' },
        'sad': { emoji: '😢', label: 'Sad' },
        'crying': { emoji: '😭', label: 'Crying' },
        'tearfulness': { emoji: '😢', label: 'Tearful' },
        'lonely': { emoji: '😔', label: 'Lonely' },
        'loneliness': { emoji: '😔', label: 'Lonely' },
        'grief': { emoji: '😭', label: 'Grieving' },
        'despair': { emoji: '😞', label: 'Despairing' },
        'hopelessness': { emoji: '😞', label: 'Hopeless' },
        'depressed': { emoji: '😔', label: 'Depressed' },
        'worthlessness': { emoji: '😔', label: 'Worthless' },
        'guilt': { emoji: '😔', label: 'Guilty' },
        'shame': { emoji: '😔', label: 'Ashamed' },
        'emptiness': { emoji: '😶', label: 'Empty' },
        'emotional-numbness': { emoji: '😶', label: 'Numb' },
        'flat-affect': { emoji: '😶', label: 'Flat' },
        'blank-expression': { emoji: '😶', label: 'Blank' },
        'mad': { emoji: '😠', label: 'Mad' },
        'angry': { emoji: '😡', label: 'Angry' },
        'irritation': { emoji: '😠', label: 'Irritated' },
        'frustration': { emoji: '😤', label: 'Frustrated' },
        'impatience': { emoji: '😤', label: 'Impatient' },
        'furious': { emoji: '😡', label: 'Furious' },
        'rage': { emoji: '🤬', label: 'Enraged' },
        'aggression': { emoji: '😡', label: 'Aggressive' },
        'disgust': { emoji: '🤢', label: 'Disgusted' },
        'crazy': { emoji: '🤪', label: 'Crazy' },
        'burnout': { emoji: '😵', label: 'Burnt Out' },
        'exhaust': { emoji: '😴', label: 'Exhausted' },
        'mental-overload': { emoji: '🤯', label: 'Overloaded' },
        'caring': { emoji: '💜', label: 'Cared For' },
      };

      const moodData = moodMapping[mood] || { emoji: '😊', label: mood };

      const entry = {
        id: Date.now().toString(),
        content: `Mood detected from Care Buddy conversation`,
        mood: moodData.label,
        moodEmoji: moodData.emoji,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        userId: userId,
      };

      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/entries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(entry),
        },
      );
      
      console.log('Mood entry saved:', moodData.label);
      dashboardRefresh.trigger();
    } catch (error) {
      console.error("Error saving mood entry:", error);
    }
  };

  const startSession = async () => {
    try {
      const sessionId = `care_buddy_session_${Date.now()}`;
      const session: CareBuddySession = {
        id: sessionId,
        startedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        messageCount: 0,
      };

      const authToken =
        accessToken ||
        localStorage.getItem("resilio_access_token") ||
        publicAnonKey;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/care-buddy/sessions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(session),
        },
      );

      if (response.ok) {
        setCurrentSession(session);
        console.log("Care Buddy session started:", sessionId);
      } else {
        console.error("Failed to start Care Buddy session");
      }
    } catch (error) {
      console.error(
        "Error starting Care Buddy session:",
        error,
      );
    }
  };

  const updateSession = async () => {
    if (!currentSession) return;

    try {
      const updatedSession = {
        ...currentSession,
        lastMessageAt: new Date().toISOString(),
        messageCount: currentSession.messageCount + 1,
      };

      const authToken =
        accessToken ||
        localStorage.getItem("resilio_access_token") ||
        publicAnonKey;

      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/care-buddy/sessions/${currentSession.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(updatedSession),
        },
      );

      setCurrentSession(updatedSession);
    } catch (error) {
      console.error(
        "Error updating Care Buddy session:",
        error,
      );
    }
  };

  const detectSentiment = (
    userMessage: string,
  ):
    | "happy"
    | "sad"
    | "pressure"
    | "caring"
    | "worried"
    | "excited"
    | "calm"
    | "curious"
    | "surprised"
    | "playful"
    | "confident"
    | "grateful"
    | "mad"
    | "furious"
    | "angry"
    | "fear"
    | "neutral"
    | "disgust"
    | "tension"
    | "anxious"
    | "depressed"
    | "joy"
    | "contentment"
    | "relaxation"
    | "satisfaction"
    | "interest"
    | "thoughtful"
    | "attentive"
    | "focused"
    | "emotional-balance"
    | "serious"
    | "slight-concern"
    | "mild-fatigue"
    | "confusion"
    | "indifference"
    | "hopelessness"
    | "grief"
    | "crying"
    | "loneliness"
    | "despair"
    | "tearfulness"
    | "nervousness"
    | "panic"
    | "restlessness"
    | "apprehensive"
    | "hypervigilance"
    | "overwhelm"
    | "irritation"
    | "frustration"
    | "aggression"
    | "rage"
    | "impatience"
    | "crazy"
    | "burnout"
    | "emotional-numbness"
    | "flat-affect"
    | "shame"
    | "guilt"
    | "emptiness"
    | "blank-expression"
    | "worthlessness"
    | "exhaust"
    | "mental-overload" => {
    const lowerMessage = userMessage.toLowerCase();

    // Simplified mood detection for character animation only
    // Extreme negative emotions
    if (
      lowerMessage.includes("furious") ||
      lowerMessage.includes("enraged") ||
      lowerMessage.includes("livid")
    ) {
      return "furious";
    }

    if (
      lowerMessage.includes("angry") ||
      lowerMessage.includes("pissed") ||
      lowerMessage.includes("frustrated") ||
      lowerMessage.includes("rage")
    ) {
      return "angry";
    }

    if (
      lowerMessage.includes("mad") ||
      lowerMessage.includes("upset")
    ) {
      return "mad";
    }

    if (
      lowerMessage.includes("fear") ||
      lowerMessage.includes("scared") ||
      lowerMessage.includes("terrified") ||
      lowerMessage.includes("panic")
    ) {
      return "fear";
    }

    if (
      lowerMessage.includes("depressed") ||
      lowerMessage.includes("hopeless") ||
      lowerMessage.includes("worthless") ||
      lowerMessage.includes("empty") ||
      lowerMessage.includes("numb")
    ) {
      return "depressed";
    }

    if (
      lowerMessage.includes("sad") ||
      lowerMessage.includes("down") ||
      lowerMessage.includes("crying") ||
      lowerMessage.includes("lonely")
    ) {
      return "sad";
    }

    if (
      lowerMessage.includes("anxious") ||
      lowerMessage.includes("anxiety") ||
      lowerMessage.includes("nervous") ||
      lowerMessage.includes("restless")
    ) {
      return "anxious";
    }

    if (
      lowerMessage.includes("tension") ||
      lowerMessage.includes("tense") ||
      lowerMessage.includes("on edge")
    ) {
      return "tension";
    }

    if (
      lowerMessage.includes("pressure") ||
      lowerMessage.includes("under pressure") ||
      lowerMessage.includes("deadline")
    ) {
      return "pressure";
    }

    if (
      lowerMessage.includes("worried") ||
      lowerMessage.includes("stress") ||
      lowerMessage.includes("overwhelmed")
    ) {
      return "worried";
    }

    // Positive emotions
    if (
      lowerMessage.includes("excited") ||
      lowerMessage.includes("thrilled") ||
      lowerMessage.includes("pumped")
    ) {
      return "excited";
    }

    if (
      lowerMessage.includes("happy") ||
      lowerMessage.includes("good") ||
      lowerMessage.includes("great") ||
      lowerMessage.includes("wonderful") ||
      lowerMessage.includes("joy")
    ) {
      return "happy";
    }

    if (
      lowerMessage.includes("grateful") ||
      lowerMessage.includes("thank") ||
      lowerMessage.includes("appreciate")
    ) {
      return "grateful";
    }

    if (
      lowerMessage.includes("calm") ||
      lowerMessage.includes("peace") ||
      lowerMessage.includes("relaxed")
    ) {
      return "calm";
    }

    if (
      lowerMessage.includes("confident") ||
      lowerMessage.includes("strong") ||
      lowerMessage.includes("proud")
    ) {
      return "confident";
    }

    if (
      lowerMessage.includes("curious") ||
      lowerMessage.includes("wonder") ||
      lowerMessage.includes("why") ||
      lowerMessage.includes("how")
    ) {
      return "curious";
    }

    if (
      lowerMessage.includes("surprised") ||
      lowerMessage.includes("wow") ||
      lowerMessage.includes("shocked")
    ) {
      return "surprised";
    }

    if (
      lowerMessage.includes("fun") ||
      lowerMessage.includes("lol") ||
      lowerMessage.includes("haha") ||
      lowerMessage.includes("funny")
    ) {
      return "playful";
    }

    if (
      lowerMessage.includes("neutral") ||
      lowerMessage.includes("meh") ||
      lowerMessage.includes("okay") ||
      lowerMessage.includes("fine")
    ) {
      return "neutral";
    }

    // Default caring mood
    return "caring";
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInputText = inputText; // Store the input text before clearing
    setInputText("");
    setLoading(true);

    // Save user message
    await saveMessage(userMessage);
    await updateSession();
    await logActivity(
      "care_buddy",
      "Sent message",
      `Message: \"${userInputText.substring(0, 50)}...\"`,
    );

    // Call Flask API only
    try {
      const response = await fetch(`${FLASK_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_inputs: [userInputText],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const apiResponseText = data.response || data.responses?.[0] || "I'm here to listen. Please tell me more.";
        
        // Detect mood from user's message for character animation
        const detectedMood = detectSentiment(userInputText);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: apiResponseText,
          sender: "bot",
          timestamp: new Date().toISOString(),
          mood: detectedMood,
        };

        setMessages((prev) => [...prev, botMessage]);
        await saveMessage(botMessage);
        await saveMoodEntry(detectedMood);
        setLoading(false);
      } else {
        // Show error message if API fails
        console.error("Flask API request failed");
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm having trouble connecting right now. Please make sure the Flask API is running at " + FLASK_API_URL,
          sender: "bot",
          timestamp: new Date().toISOString(),
          mood: "worried",
        };
        setMessages((prev) => [...prev, errorMessage]);
        await saveMessage(errorMessage);
        setLoading(false);
      }
    } catch (error) {
      // Show error message if API call throws error
      console.error("Error calling Flask API:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to the Flask API. Please make sure it's running at " + FLASK_API_URL + ". Error: " + (error as Error).message,
        sender: "bot",
        timestamp: new Date().toISOString(),
        mood: "worried",
      };
      setMessages((prev) => [...prev, errorMessage]);
      await saveMessage(errorMessage);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-violet-50/30">
      {/* Header with chat-style design and vertical accent */}
      <div className="relative bg-gradient-to-r from-violet-600 via-blue-600 to-teal-600 text-white px-4 md:px-8 py-6 shadow-lg">
        {/* Decorative vertical stripe */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-teal-400 to-violet-400"></div>

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white blur-3xl"></div>
        </div>

        <div className="relative z-10 pl-14 md:pl-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/50 shadow-lg overflow-hidden">
              <div className="scale-[0.35] -mt-1">
                <CareBuddyCharacter
                  mood="happy"
                  isThinking={false}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-white mb-0">Care Buddy</h1>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs">
                    AI Powered
                  </span>
                </div>
              </div>
              <p className="text-purple-100 text-sm">
                Powered by your trained BERT-to-GPT2 model
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-purple-200 text-sm">
            <Heart className="w-4 h-4" />
            <span>Here to support you</span>
          </div>
        </div>
      </div>

      {/* Messages Area with decorative side bars */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        {/* Decorative vertical bars on both sides */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-violet-500 via-blue-500 to-teal-500 hidden md:block"></div>
        <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-500 via-blue-500 to-violet-500 hidden md:block"></div>

        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-4 duration-300`}
            >
              <div
                className={`max-w-[75%] rounded-2xl shadow-lg ${
                  message.sender === "user"
                    ? "bg-gradient-to-br from-violet-600 to-blue-600 text-white px-6 py-4"
                    : "glass border border-slate-200"
                }`}
              >
                {message.sender === "bot" && (
                  <div className="flex gap-4">
                    {/* Cute character in bot message */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="scale-75">
                        <CareBuddyCharacter
                          mood={message.mood || "caring"}
                          isThinking={false}
                        />
                      </div>
                    </div>
                    <div className="flex-1 px-6 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold bg-gradient-to-r from-violet-600 to-teal-600 bg-clip-text text-transparent">
                          Care Buddy
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                      <p className="text-xs text-slate-400 mt-3">
                        {new Date(
                          message.timestamp,
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )}

                {message.sender === "user" && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold">
                        You
                      </span>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {message.text}
                    </p>
                    <p className="text-xs text-purple-200 mt-3">
                      {new Date(
                        message.timestamp,
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="glass rounded-2xl shadow-lg border border-slate-200 max-w-[75%]">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <CareBuddyCharacter
                      mood="listening"
                      isThinking={true}
                    />
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      Care Buddy is thinking...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area with floating design */}
      <div className="relative bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Share your thoughts with Care Buddy..."
              className="flex-1 px-5 py-4 bg-white border-2 border-slate-200 rounded-xl focus:border-violet-500 focus:outline-none text-slate-900 placeholder-slate-400 resize-none shadow-sm transition-all"
              rows={2}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputText.trim()}
              className="px-6 py-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-3 h-3" />
            <span>Powered by your custom trained AI model</span>
          </div>
        </div>
      </div>
    </div>
  );
}
