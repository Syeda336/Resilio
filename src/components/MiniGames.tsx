import { useState } from 'react';
import { Gamepad2, Play, Trophy, Zap } from 'lucide-react';
import { logActivity } from '../utils/activityTracker';
import { gamesAPI, GameSession } from '../utils/gamesAPI';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { PaintingOutOfBox } from './games/PaintingOutOfBox';
import { SymmetryFix } from './games/SymmetryFix';
import { ArrowPuzzle } from './games/ArrowPuzzle';

interface MiniGamesProps {
  userName: string;
  userId: string;
}

export function MiniGames({ userName, userId }: MiniGamesProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showPaintingGame, setShowPaintingGame] = useState(false);
  const [showSymmetryFixGame, setShowSymmetryFixGame] = useState(false);
  const [showArrowPuzzleGame, setShowArrowPuzzleGame] = useState(false);
  const [gameTrackingId, setGameTrackingId] = useState<string | null>(null);

  const games = [
    { 
      id: 'painting', 
      name: 'Breaking out the Boxes', 
      icon: 'https://images.unsplash.com/photo-1597418881091-e62c106f03c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHBhaW50aW5nJTIwY3JlYXRpdmUlMjBjb2xvcmZ1bHxlbnwxfHx8fDE3NzE2NzU5Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', 
      description: 'Create abstract art beyond boundaries',
      color: 'from-purple-500 to-pink-600',
      border: 'border-purple-500'
    },
    { 
      id: 'organizing', 
      name: 'Symmetry Fix', 
      icon: 'https://images.unsplash.com/photo-1652111867040-a9219ff18ef1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbml6aW5nJTIwaXRlbXMlMjBPQ0QlMjBuZWF0JTIwdGlkeXxlbnwxfHx8fDE3NzE2NzU5NzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', 
      description: 'Organize items to perfection',
      color: 'from-teal-500 to-cyan-600',
      border: 'border-teal-500'
    },
    { 
      id: 'arrow', 
      name: 'Arrow Puzzle', 
      icon: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnJvdyUyMHB1enpsZSUyMGdhbWV8ZW58MXx8fHwxNzQ0ODIzNTM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral', 
      description: 'Rotate arrows to align them all',
      color: 'from-blue-500 to-indigo-600',
      border: 'border-blue-500'
    },
  ];

  const handlePlayGame = async (gameName: string) => {
    try {
      // Start tracking
      const { gamesTracking } = await import('../utils/graphsTracking');
      const trackId = await gamesTracking.start(gameName);
      setGameTrackingId(trackId);

      // If it's Breaking out the Boxes game, show the custom game component
      if (gameName === 'Breaking out the Boxes') {
        setShowPaintingGame(true);
        // Don't log activity on start - only on completion
        return;
      }

      // If it's Symmetry Fix game, show the custom game component
      if (gameName === 'Symmetry Fix') {
        setShowSymmetryFixGame(true);
        // Don't log activity on start - only on completion
        return;
      }

      // If it's Arrow Puzzle game, show the custom game component
      if (gameName === 'Arrow Puzzle') {
        setShowArrowPuzzleGame(true);
        // Don't log activity on start - only on completion
        return;
      }

      setSelectedGame(gameName);
      const session = await gamesAPI.startGame(gameName);
      setCurrentSessionId(session.id);
      // Don't log activity on start - only on completion
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const handleGameComplete = async () => {
    try {
      const gameName = showPaintingGame ? 'Breaking out the Boxes' : showSymmetryFixGame ? 'Symmetry Fix' : 'Arrow Puzzle';
      
      // End tracking
      if (gameTrackingId) {
        const { gamesTracking } = await import('../utils/graphsTracking');
        await gamesTracking.end(gameTrackingId);
        setGameTrackingId(null);
      }
      
      await logActivity('game', 'Completed Game', gameName);
      if (currentSessionId) {
        await gamesAPI.endGame(currentSessionId, 100); // 100% completion
      }
      
      // Refresh dashboard
      const { dashboardRefresh } = await import('../utils/dashboardRefresh');
      dashboardRefresh.trigger();
    } catch (error) {
      console.error('Error completing game:', error);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-orange-50/30 to-purple-50/30 min-h-screen">
      {/* Header with playful diagonal split effect */}
      <div className="relative bg-gradient-to-r from-orange-500 via-purple-600 to-rose-600 text-white px-4 md:px-8 py-8 overflow-hidden">
        {/* Decorative diagonal stripe */}
        <div className="absolute left-0 top-0 w-full h-2 bg-gradient-to-r from-teal-400 via-rose-400 to-purple-400"></div>
        
        {/* Animated background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-teal-300 blur-3xl"></div>
        </div>

        <div className="relative z-10 pl-14 md:pl-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/50">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-white mb-1">Mini Games</h1>
              <p className="text-orange-100 text-sm">Take a break and boost your brain power</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="text-white text-sm">User: {userName}</span>
          </div>
        </div>
      </div>

      {/* Content with zigzag layout */}
      <div className="p-4 md:p-8 relative">
        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-br-3xl"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-orange-500/20 to-transparent rounded-tl-3xl"></div>
        
        <div className="max-w-7xl mx-auto">
          {/* Games Grid with alternating accents */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <div
                key={game.id}
                className="group relative"
              >
                {/* Vertical accent bar */}
                <div className={`absolute ${index % 2 === 0 ? 'left-0' : 'right-0'} top-0 bottom-0 w-1 bg-gradient-to-b ${game.color} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                
                <div className={`glass rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 border-l-4 ${game.border} h-full flex flex-col`}>
                  <div className="text-center flex-1 flex flex-col">
                    {/* Image container with overlay effect */}
                    <div className="relative mb-4 overflow-hidden rounded-xl">
                      <ImageWithFallback
                        src={game.icon}
                        alt={game.name}
                        className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${game.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}></div>
                    </div>
                    
                    <h3 className="text-slate-900 mb-2 font-semibold">{game.name}</h3>
                    <p className="text-slate-600 text-sm mb-6 flex-1">{game.description}</p>
                    
                    <button
                      onClick={() => handlePlayGame(game.name)}
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${game.color} text-white rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg`}
                    >
                      <Play className="w-5 h-5" />
                      Play Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Game Modal/Overlay would go here */}
      {selectedGame && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
            <h2 className="text-slate-900 mb-4">Starting {selectedGame}...</h2>
            <p className="text-slate-600 mb-6">Get ready to play!</p>
            <button
              onClick={() => setSelectedGame(null)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-rose-600 text-white rounded-xl hover:shadow-xl transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Painting Out of Box Game */}
      {showPaintingGame && (
        <PaintingOutOfBox
          onClose={() => setShowPaintingGame(false)}
          onComplete={handleGameComplete}
        />
      )}

      {/* Symmetry Fix Game */}
      {showSymmetryFixGame && (
        <SymmetryFix
          onClose={() => setShowSymmetryFixGame(false)}
          onComplete={handleGameComplete}
        />
      )}

      {/* Arrow Puzzle Game */}
      {showArrowPuzzleGame && (
        <ArrowPuzzle
          onClose={() => setShowArrowPuzzleGame(false)}
          onComplete={handleGameComplete}
        />
      )}
    </div>
  );
}