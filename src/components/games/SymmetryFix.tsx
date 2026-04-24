import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, X, Trophy, Timer, Sparkles } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

interface SymmetryFixProps {
  onClose: () => void;
  onComplete: () => void;
}

type GameScreen = 'welcome' | 'game' | 'completion';

type ItemCategory = 'wood' | 'plastic' | 'paper';

interface GameItem {
  id: string;
  name: string;
  category: ItemCategory;
  emoji: string;
}

interface DroppedItem extends GameItem {
  category: ItemCategory;
}

const gameItems: GameItem[] = [
  // Wood items (33)
  { id: 'wood-1', name: 'Wooden chair', category: 'wood', emoji: '🪑' },
  { id: 'wood-2', name: 'Oak dining table', category: 'wood', emoji: '🍽️' },
  { id: 'wood-3', name: 'Pine bookshelf', category: 'wood', emoji: '📚' },
  { id: 'wood-4', name: 'Cedar chest', category: 'wood', emoji: '🧳' },
  { id: 'wood-5', name: 'Mahogany desk', category: 'wood', emoji: '🖥️' },
  { id: 'wood-6', name: 'Plywood crate', category: 'wood', emoji: '📦' },
  { id: 'wood-7', name: 'Wooden spoon', category: 'wood', emoji: '🥄' },
  { id: 'wood-8', name: 'Rolling pin', category: 'wood', emoji: '🍞' },
  { id: 'wood-9', name: 'Cutting board', category: 'wood', emoji: '🔪' },
  { id: 'wood-10', name: 'Baseball bat', category: 'wood', emoji: '⚾' },
  { id: 'wood-11', name: 'Acoustic guitar', category: 'wood', emoji: '🎸' },
  { id: 'wood-12', name: 'Picture frame', category: 'wood', emoji: '🖼️' },
  { id: 'wood-13', name: 'Wardrobe', category: 'wood', emoji: '🚪' },
  { id: 'wood-14', name: 'Bed frame', category: 'wood', emoji: '🛏️' },
  { id: 'wood-15', name: 'Nightstand', category: 'wood', emoji: '🕯️' },
  { id: 'wood-16', name: 'Treehouse', category: 'wood', emoji: '🏡' },
  { id: 'wood-17', name: 'Log cabin', category: 'wood', emoji: '🏠' },
  { id: 'wood-18', name: 'Canoe', category: 'wood', emoji: '🛶' },
  { id: 'wood-19', name: 'Picket fence', category: 'wood', emoji: '🚧' },
  { id: 'wood-20', name: 'Birdhouse', category: 'wood', emoji: '🏠' },
  { id: 'wood-21', name: 'Totem pole', category: 'wood', emoji: '🗿' },
  { id: 'wood-22', name: 'Chessboard', category: 'wood', emoji: '♟️' },
  { id: 'wood-23', name: 'Violin', category: 'wood', emoji: '🎻' },
  { id: 'wood-24', name: 'Walking stick', category: 'wood', emoji: '🦯' },
  { id: 'wood-25', name: 'Easel', category: 'wood', emoji: '🎨' },
  { id: 'wood-26', name: 'Workbench', category: 'wood', emoji: '🔨' },
  { id: 'wood-27', name: 'Step ladder', category: 'wood', emoji: '🪜' },
  { id: 'wood-28', name: 'Jewelry box', category: 'wood', emoji: '💍' },
  { id: 'wood-29', name: 'Coaster', category: 'wood', emoji: '🍺' },
  { id: 'wood-30', name: 'Garden bench', category: 'wood', emoji: '🪑' },
  { id: 'wood-31', name: 'Pencil (casing)', category: 'wood', emoji: '✏️' },
  { id: 'wood-32', name: 'Chopsticks', category: 'wood', emoji: '🥢' },
  { id: 'wood-33', name: 'Wine rack', category: 'wood', emoji: '🍷' },
  
  // Plastic items (33)
  { id: 'plastic-1', name: 'Plastic chair', category: 'plastic', emoji: '🪑' },
  { id: 'plastic-2', name: 'Water bottle', category: 'plastic', emoji: '💧' },
  { id: 'plastic-3', name: 'Storage bin', category: 'plastic', emoji: '🗄️' },
  { id: 'plastic-4', name: 'Laundry basket', category: 'plastic', emoji: '🧺' },
  { id: 'plastic-5', name: 'Food container', category: 'plastic', emoji: '🥡' },
  { id: 'plastic-6', name: 'Shower curtain', category: 'plastic', emoji: '🚿' },
  { id: 'plastic-7', name: 'Plastic fork', category: 'plastic', emoji: '🍴' },
  { id: 'plastic-8', name: 'Drinking straw', category: 'plastic', emoji: '🥤' },
  { id: 'plastic-9', name: 'Credit card', category: 'plastic', emoji: '💳' },
  { id: 'plastic-10', name: 'Phone case', category: 'plastic', emoji: '📱' },
  { id: 'plastic-11', name: 'Computer keyboard', category: 'plastic', emoji: '⌨️' },
  { id: 'plastic-12', name: 'Television remote', category: 'plastic', emoji: '📺' },
  { id: 'plastic-13', name: 'Plastic bag', category: 'plastic', emoji: '🛍️' },
  { id: 'plastic-14', name: 'Garden hose', category: 'plastic', emoji: '🚰' },
  { id: 'plastic-15', name: 'Traffic cone', category: 'plastic', emoji: '🚧' },
  { id: 'plastic-16', name: 'Lego brick', category: 'plastic', emoji: '🧱' },
  { id: 'plastic-17', name: 'Toy soldier', category: 'plastic', emoji: '🪖' },
  { id: 'plastic-18', name: 'Hula hoop', category: 'plastic', emoji: '⭕' },
  { id: 'plastic-19', name: 'Frisbee', category: 'plastic', emoji: '🥏' },
  { id: 'plastic-20', name: 'Clothes hanger', category: 'plastic', emoji: '👔' },
  { id: 'plastic-21', name: 'Shampoo bottle', category: 'plastic', emoji: '🧴' },
  { id: 'plastic-22', name: 'Toothbrush handle', category: 'plastic', emoji: '🪥' },
  { id: 'plastic-23', name: 'Protractor', category: 'plastic', emoji: '📐' },
  { id: 'plastic-24', name: 'Safety helmet', category: 'plastic', emoji: '⛑️' },
  { id: 'plastic-25', name: 'Dashboard', category: 'plastic', emoji: '🚗' },
  { id: 'plastic-26', name: 'Syringe', category: 'plastic', emoji: '💉' },
  { id: 'plastic-27', name: 'Bubble wrap', category: 'plastic', emoji: '📦' },
  { id: 'plastic-28', name: 'Plastic bucket', category: 'plastic', emoji: '🪣' },
  { id: 'plastic-29', name: 'Watering can', category: 'plastic', emoji: '💦' },
  { id: 'plastic-30', name: 'Palette knife', category: 'plastic', emoji: '🎨' },
  { id: 'plastic-31', name: 'Calculator casing', category: 'plastic', emoji: '🧮' },
  { id: 'plastic-32', name: 'Trash can', category: 'plastic', emoji: '🗑️' },
  { id: 'plastic-33', name: 'Keycap', category: 'plastic', emoji: '⌨️' },
  
  // Paper items (34)
  { id: 'paper-1', name: 'Paper book', category: 'paper', emoji: '📕' },
  { id: 'paper-2', name: 'Paper plane', category: 'paper', emoji: '✈️' },
  { id: 'paper-3', name: 'Cardboard box', category: 'paper', emoji: '📦' },
  { id: 'paper-4', name: 'Newspaper', category: 'paper', emoji: '📰' },
  { id: 'paper-5', name: 'Magazine', category: 'paper', emoji: '📖' },
  { id: 'paper-6', name: 'Notebook', category: 'paper', emoji: '📓' },
  { id: 'paper-7', name: 'Envelope', category: 'paper', emoji: '✉️' },
  { id: 'paper-8', name: 'Postcard', category: 'paper', emoji: '📮' },
  { id: 'paper-9', name: 'Greeting card', category: 'paper', emoji: '💌' },
  { id: 'paper-10', name: 'Paper bag', category: 'paper', emoji: '🛍️' },
  { id: 'paper-11', name: 'Tissue paper', category: 'paper', emoji: '🧻' },
  { id: 'paper-12', name: 'Paper towel', category: 'paper', emoji: '🧻' },
  { id: 'paper-13', name: 'Toilet roll', category: 'paper', emoji: '🧻' },
  { id: 'paper-14', name: 'Wallpaper', category: 'paper', emoji: '🖼️' },
  { id: 'paper-15', name: 'Calendar', category: 'paper', emoji: '📅' },
  { id: 'paper-16', name: 'Business card', category: 'paper', emoji: '💼' },
  { id: 'paper-17', name: 'Flyer', category: 'paper', emoji: '📄' },
  { id: 'paper-18', name: 'Poster', category: 'paper', emoji: '🖼️' },
  { id: 'paper-19', name: 'Sketchbook', category: 'paper', emoji: '📔' },
  { id: 'paper-20', name: 'Origami crane', category: 'paper', emoji: '🦢' },
  { id: 'paper-21', name: 'Paper plate', category: 'paper', emoji: '🍽️' },
  { id: 'paper-22', name: 'Paper cup', category: 'paper', emoji: '🥤' },
  { id: 'paper-23', name: 'Confetti', category: 'paper', emoji: '🎊' },
  { id: 'paper-24', name: 'Index card', category: 'paper', emoji: '📇' },
  { id: 'paper-25', name: 'Map', category: 'paper', emoji: '🗺️' },
  { id: 'paper-26', name: 'Blueprint', category: 'paper', emoji: '📐' },
  { id: 'paper-27', name: 'Sheet music', category: 'paper', emoji: '🎼' },
  { id: 'paper-28', name: 'Wrapping paper', category: 'paper', emoji: '🎁' },
  { id: 'paper-29', name: 'Bookmark', category: 'paper', emoji: '🔖' },
  { id: 'paper-30', name: 'Paper lantern', category: 'paper', emoji: '🏮' },
  { id: 'paper-31', name: 'Playing card', category: 'paper', emoji: '🃏' },
  { id: 'paper-32', name: 'Sticky note', category: 'paper', emoji: '📝' },
  { id: 'paper-33', name: 'Paper straw', category: 'paper', emoji: '🥤' },
  { id: 'paper-34', name: 'Certificate', category: 'paper', emoji: '📜' },
];

const completionMessages = [
  {
    message: "Perfect organization! Just like these 15 items, your thoughts can be sorted beautifully too. 🌟",
    image: "https://images.unsplash.com/photo-1603910234656-7f8b6c77b1cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbml6ZWQlMjBzdG9yYWdlJTIwc2hlbGYlMjBuZWF0fGVufDB8fHx8MTczMTc1OTQ1Nnww&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    message: "Amazing work! You've placed all 15 items exactly where they belong. Order brings peace! 📦",
    image: "https://images.unsplash.com/photo-1581087222768-f93cc8cffc11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGVhbiUyMG9yZ2FuaXplZCUyMGRlc2t8ZW58MHx8fHwxNzMxNzU5NDU2fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    message: "Wonderful! All 15 items are in harmony. Your mind can achieve this clarity too! ✨",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbml6ZWQlMjBkcmF3ZXJ8ZW58MHx8fHwxNzMxNzU5NDU3fDA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

interface DraggableItemProps {
  item: GameItem;
  isPlaced: boolean;
}

function DraggableItem({ item, isPlaced }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'item',
    item: { item },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    canDrag: !isPlaced,
  }), [isPlaced]);

  if (isPlaced) return null;

  return (
    <motion.div
      ref={drag}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className={`p-4 bg-white rounded-xl shadow-md cursor-grab active:cursor-grabbing border-2 border-slate-200 hover:border-teal-400 transition-all ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="text-4xl text-center">{item.emoji}</div>
    </motion.div>
  );
}

interface DropZoneProps {
  category: ItemCategory;
  droppedItems: DroppedItem[];
  onDrop: (item: GameItem, category: ItemCategory) => void;
}

function DropZone({ category, droppedItems, onDrop }: DropZoneProps) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'item',
    drop: (draggedItem: { item: GameItem }) => {
      onDrop(draggedItem.item, category);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [category]);

  const categoryColors = {
    wood: {
      bg: 'from-amber-100 to-amber-200',
      border: 'border-amber-500',
      text: 'text-amber-800',
      icon: '🪵'
    },
    plastic: {
      bg: 'from-blue-100 to-blue-200',
      border: 'border-blue-500',
      text: 'text-blue-800',
      icon: '♻️'
    },
    paper: {
      bg: 'from-green-100 to-green-200',
      border: 'border-green-500',
      text: 'text-green-800',
      icon: '📄'
    }
  };

  const config = categoryColors[category];
  const itemsInCategory = droppedItems.filter(item => item.category === category);

  return (
    <div
      ref={drop}
      className={`flex-1 min-h-[200px] p-6 rounded-2xl border-4 ${config.border} bg-gradient-to-br ${config.bg} transition-all ${
        isOver && canDrop ? 'scale-105 shadow-2xl ring-4 ring-teal-400' : ''
      }`}
    >
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">{config.icon}</div>
        <h3 className={`font-bold ${config.text} uppercase tracking-wide`}>
          {category}
        </h3>
        <p className="text-sm text-slate-600 mt-1">{itemsInCategory.length} / 5</p>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {itemsInCategory.map((item) => (
          <motion.div
            key={item.id}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="p-3 bg-white/80 rounded-lg shadow-sm text-center"
          >
            <div className="text-3xl">{item.emoji}</div>
            <p className="text-xs text-slate-600 mt-1 truncate">{item.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SymmetryFixGame({ onClose, onComplete }: SymmetryFixProps) {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('welcome');
  const [droppedItems, setDroppedItems] = useState<DroppedItem[]>([]);
  const [placedItemIds, setPlacedItemIds] = useState<Set<string>>(new Set());
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [selectedCompletionMessage, setSelectedCompletionMessage] = useState(completionMessages[0]);
  const [selectedItems, setSelectedItems] = useState<GameItem[]>([]);
  
  // Timer interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sound effects refs
  const startSoundRef = useRef<HTMLAudioElement | { play: () => void } | null>(null);
  const gameSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | { play: () => void } | null>(null);
  const dropSoundRef = useRef<HTMLAudioElement | { play: () => void } | null>(null);

  // Initialize sound effects on mount
  useEffect(() => {
    // Create simple beep sounds using Web Audio API instead of external URLs
    const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;
    
    // Helper function to play a beep
    const playBeep = (frequency: number, duration: number, volume: number) => {
      if (!audioContext) return;
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };
    
    // Store the beep function in refs for use in other functions
    startSoundRef.current = { play: () => playBeep(523.25, 0.2, 0.3) } as any; // C note
    dropSoundRef.current = { play: () => playBeep(659.25, 0.1, 0.2) } as any; // E note
    endSoundRef.current = { play: () => {
      // Play a success chord
      playBeep(523.25, 0.3, 0.2); // C
      setTimeout(() => playBeep(659.25, 0.3, 0.2), 100); // E
      setTimeout(() => playBeep(783.99, 0.5, 0.2), 200); // G
    }} as any;

    // Cleanup on unmount
    return () => {
      startSoundRef.current = null;
      gameSoundRef.current = null;
      endSoundRef.current = null;
      dropSoundRef.current = null;
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  // Select random completion message on mount
  useEffect(() => {
    const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)];
    setSelectedCompletionMessage(randomMessage);
  }, []);

  // Timer effect
  useEffect(() => {
    if (currentScreen === 'game') {
      timerRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentScreen, startTime]);

  const handleStartGame = () => {
    // Select random items - 5 from each category
    const woodItems = gameItems.filter(item => item.category === 'wood');
    const plasticItems = gameItems.filter(item => item.category === 'plastic');
    const paperItems = gameItems.filter(item => item.category === 'paper');
    
    // Shuffle and pick 5 random from each category
    const shuffleArray = <T,>(array: T[]): T[] => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };
    
    const selectedWood = shuffleArray(woodItems).slice(0, 5);
    const selectedPlastic = shuffleArray(plasticItems).slice(0, 5);
    const selectedPaper = shuffleArray(paperItems).slice(0, 5);
    
    const randomItems = shuffleArray([...selectedWood, ...selectedPlastic, ...selectedPaper]);
    setSelectedItems(randomItems);
    
    setStartTime(Date.now());
    setElapsedTime(0);
    setDroppedItems([]);
    setPlacedItemIds(new Set());
    setCurrentScreen('game');
    
    // Play start sound
    if (startSoundRef.current) {
      startSoundRef.current.play();
    }
    
    // Play game music
    if (gameSoundRef.current) {
      gameSoundRef.current.play();
    }
  };

  const handleDrop = (item: GameItem, targetCategory: ItemCategory) => {
    // Check if item is already placed
    if (placedItemIds.has(item.id)) return;

    // Check if item belongs to target category
    if (item.category !== targetCategory) {
      // Wrong category - show feedback
      alert(`Oops! ${item.name} doesn't belong in ${targetCategory}. Try again!`);
      return;
    }

    // Correct placement
    setDroppedItems(prev => [...prev, { ...item, category: targetCategory }]);
    setPlacedItemIds(prev => new Set([...prev, item.id]));
    
    // Play drop sound
    if (dropSoundRef.current) {
      dropSoundRef.current.play();
    }
  };

  // Check if game is complete
  useEffect(() => {
    if (selectedItems.length > 0 && droppedItems.length === selectedItems.length && currentScreen === 'game') {
      setTimeout(() => {
        setCurrentScreen('completion');
        onComplete();
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
        }, 6000);
      }, 1000);
      
      // Play end sound
      if (endSoundRef.current) {
        endSoundRef.current.play();
      }
      
      // Stop game music
      if (gameSoundRef.current) {
        gameSoundRef.current.pause();
      }
    }
  }, [droppedItems.length, selectedItems.length, currentScreen, onComplete, onClose]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {/* Welcome Screen */}
        {currentScreen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-4xl h-[600px] rounded-3xl overflow-hidden shadow-2xl"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1600353068440-6361ef3a86e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmdhbml6ZWQlMjBjb2xvcmZ1bCUyMHRoaW5ncyUyMG5eYXR8ZW58MHx8fHwxNzMxNzU5NDU4fDA&ixlib=rb-4.1.0&q=80&w=1080)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-teal-900/70 via-cyan-900/50 to-teal-900/70 flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center mb-12"
              >
                <h1 className="text-6xl font-bold text-white mb-4">
                  Symmetry Fix
                </h1>
                <p className="text-2xl text-teal-200 mb-3">
                  Organize items into their perfect categories!
                </p>
              </motion.div>

              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartGame}
                className="flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full text-2xl font-bold shadow-2xl hover:shadow-teal-500/50 transition-all"
              >
                <Play className="w-8 h-8" fill="white" />
                Start Game
              </motion.button>

              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Game Screen */}
        {currentScreen === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-7xl h-[90vh] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-50 to-slate-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Timer className="w-6 h-6" />
                <span className="text-2xl font-bold">{formatTime(elapsedTime)}</span>
              </div>
              
              <h2 className="text-2xl font-bold">Symmetry Fix</h2>
              
              <div className="flex items-center gap-4">
                <Trophy className="w-6 h-6" />
                <span className="text-lg">{droppedItems.length} / {selectedItems.length}</span>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-20 right-6 w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all z-50"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Drop Zones */}
            <div className="p-8 flex gap-6 h-[calc(100%-200px)]">
              <DropZone 
                category="wood" 
                droppedItems={droppedItems}
                onDrop={handleDrop}
              />
              <DropZone 
                category="plastic" 
                droppedItems={droppedItems}
                onDrop={handleDrop}
              />
              <DropZone 
                category="paper" 
                droppedItems={droppedItems}
                onDrop={handleDrop}
              />
            </div>

            {/* Item Sheet at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t-4 border-teal-500 p-6 shadow-2xl">
              <h3 className="text-center text-slate-700 font-bold mb-3 text-lg">
                📦 Drag items to their correct categories
              </h3>
              <div className="grid grid-cols-5 gap-3 max-w-4xl mx-auto">
                {selectedItems.map((item) => (
                  <DraggableItem
                    key={item.id}
                    item={item}
                    isPlaced={placedItemIds.has(item.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Completion Screen */}
        {currentScreen === 'completion' && (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-5xl h-[700px] rounded-3xl overflow-hidden shadow-2xl"
            style={{
              backgroundImage: `url(${selectedCompletionMessage.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-teal-900/80 via-cyan-900/70 to-teal-900/80 flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  className="inline-block mb-6"
                >
                  <Trophy className="w-28 h-28 text-yellow-400" />
                </motion.div>

                <h1 className="text-6xl font-bold text-white mb-6">
                  Perfect Organization!
                </h1>

                {/* Time Display */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8 bg-white/20 backdrop-blur-sm rounded-2xl p-6 inline-block"
                >
                  <div className="flex items-center gap-4 text-white">
                    <Timer className="w-10 h-10" />
                    <div>
                      <p className="text-lg text-teal-200">Your Time</p>
                      <p className="text-5xl font-bold">{formatTime(elapsedTime)}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Completion Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="mb-8 px-8"
                >
                  <p className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 leading-tight">
                    {selectedCompletionMessage.message}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center gap-8 justify-center text-white/80 text-lg"
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold text-amber-300">8</div>
                    <div className="text-sm">Wood Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-300">8</div>
                    <div className="text-sm">Plastic Items</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-300">8</div>
                    <div className="text-sm">Paper Items</div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Sparkles */}
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                    opacity: 1
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: [0, 1.5, 0],
                    opacity: [1, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    ease: 'easeOut'
                  }}
                  className="absolute"
                >
                  <Sparkles className="w-8 h-8 text-yellow-300" />
                </motion.div>
              ))}

              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring' }}
                onClick={onClose}
                className="mt-8 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-full text-xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SymmetryFix({ onClose, onComplete }: SymmetryFixProps) {
  return (
    <DndProvider backend={HTML5Backend}>
      <SymmetryFixGame onClose={onClose} onComplete={onComplete} />
    </DndProvider>
  );
}