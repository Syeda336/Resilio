import { useState, useEffect } from 'react';
import { Sparkles, Lightbulb } from 'lucide-react';
import { getDailyRecommendation, DailyRecommendation as Recommendation } from '../utils/dailyRecommendations';
import { publicAnonKey } from '../utils/supabase/info';

interface DailyRecommendationProps {
  userId: string;
  accessToken: string;
  projectId: string;
}

export function DailyRecommendation({ userId, accessToken, projectId }: DailyRecommendationProps) {
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    loadRecommendation();
  }, [userId, accessToken, projectId]);

  useEffect(() => {
    if (!loading && recommendation) {
      // Delay showing the popup by 2 seconds
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [loading, recommendation]);

  const loadRecommendation = async () => {
    setLoading(true);
    try {
      const rec = await getDailyRecommendation(userId, accessToken, projectId, publicAnonKey);
      setRecommendation(rec);
    } catch (error) {
      console.error('Error loading recommendation:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !recommendation || !showPopup) {
    return null;
  }

  return (
    <div className="relative mb-6 overflow-hidden popup-animation">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-90 animate-gradient-x"></div>
      
      {/* Sparkle effects */}
      <div className="absolute top-2 left-4 animate-pulse">
        <Sparkles className="w-4 h-4 text-yellow-300" />
      </div>
      <div className="absolute bottom-3 right-8 animate-pulse delay-300">
        <Sparkles className="w-3 h-3 text-yellow-200" />
      </div>
      
      {/* Content */}
      <div className="relative px-6 py-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-white font-bold text-lg">
                Daily Wellness Tip
              </h3>
              
            </div>
            
            <p className="text-white/95 text-base leading-relaxed">
              {recommendation.text}
            </p>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </div>

      <style>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes popup {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          60% {
            transform: scale(1.05) translateY(-5px);
          }
          80% {
            transform: scale(0.98) translateY(0);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 8s ease infinite;
        }

        .popup-animation {
          animation: popup 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
}