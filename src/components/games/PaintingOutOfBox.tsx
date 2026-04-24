import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, X, Sparkles } from "lucide-react";
import { affirmations } from "../../data/affirmations";

interface PaintingOutOfBoxProps {
  onClose: () => void;
  onComplete: () => void;
}

type GameScreen = "welcome" | "game" | "completion";

interface MessagePart {
  text: string;
  x: number;
  y: number;
  revealed: boolean;
}

export function PaintingOutOfBox({
  onClose,
  onComplete,
}: PaintingOutOfBoxProps) {
  const [currentScreen, setCurrentScreen] =
    useState<GameScreen>("welcome");
  const [brokenBoxes, setBrokenBoxes] = useState<Set<number>>(
    new Set(),
  );
  const [allBoxesBroken, setAllBoxesBroken] = useState(false);
  const [messageParts, setMessageParts] = useState<
    MessagePart[]
  >([]);
  const [selectedMessage, setSelectedMessage] =
    useState<string>("");
  const [messageWords, setMessageWords] = useState<string[]>(
    [],
  );

  // Audio refs
  const startAudioRef = useRef<HTMLAudioElement | null>(null);
  const breakAudioRef = useRef<HTMLAudioElement | null>(null);
  const revealAudioRef = useRef<HTMLAudioElement | null>(null);
  const endAudioRef = useRef<HTMLAudioElement | null>(null);

  // Total boxes (8 columns x 4 rows = 32 boxes)
  const totalBoxes = 32;
  const columns = 8;
  const rows = 4;

  // Select a random message on mount
  useEffect(() => {
    const randomMessage =
      affirmations.messages[
        Math.floor(Math.random() * affirmations.messages.length)
      ];
    setSelectedMessage(randomMessage);
    setMessageWords(randomMessage.split(" "));
  }, []);

  // Initialize message parts with random positions
  useEffect(() => {
    const parts: MessagePart[] = messageWords.map(() => ({
      text: "",
      x: Math.random() * 70 + 10, // Random x between 10% and 80%
      y: Math.random() * 70 + 10, // Random y between 10% and 80%
      revealed: false,
    }));
    setMessageParts(parts);
  }, [messageWords]);

  // Create audio elements
  useEffect(() => {
    // Using Web Audio API to create simple beep sounds
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    const createBeep = (
      frequency: number,
      duration: number,
      type: OscillatorType = "sine",
    ) => {
      return () => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        gainNode.gain.setValueAtTime(
          0.3,
          audioContext.currentTime,
        );
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration,
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      };
    };

    // Assign sound functions
    const playStart = createBeep(523.25, 0.3, "sine"); // C5
    const playBreak = createBeep(329.63, 0.15, "square"); // E4
    const playReveal = createBeep(659.25, 0.5, "sine"); // E5
    const playEnd = createBeep(783.99, 0.6, "sine"); // G5

    startAudioRef.current = { play: playStart } as any;
    breakAudioRef.current = { play: playBreak } as any;
    revealAudioRef.current = { play: playReveal } as any;
    endAudioRef.current = { play: playEnd } as any;

    return () => {
      audioContext.close();
    };
  }, []);

  const handleStartGame = () => {
    startAudioRef.current?.play();
    setCurrentScreen("game");
  };

  const handleBoxClick = (boxIndex: number) => {
    if (brokenBoxes.has(boxIndex)) return;

    breakAudioRef.current?.play();
    setBrokenBoxes((prev) => new Set([...prev, boxIndex]));

    // Reveal a random message part
    const unrevealedIndices = messageParts
      .map((part, idx) => (!part.revealed ? idx : -1))
      .filter((idx) => idx !== -1);

    if (unrevealedIndices.length > 0) {
      const randomIndex =
        unrevealedIndices[
          Math.floor(Math.random() * unrevealedIndices.length)
        ];
      setMessageParts((prev) =>
        prev.map((part, idx) =>
          idx === randomIndex
            ? {
                ...part,
                text: messageWords[idx],
                revealed: true,
              }
            : part,
        ),
      );
    }
  };

  // Check if all message parts are revealed
  useEffect(() => {
    const allMessagesRevealed =
      messageParts.length > 0 &&
      messageParts.every((part) => part.revealed);

    if (allMessagesRevealed && !allBoxesBroken) {
      setAllBoxesBroken(true);
      revealAudioRef.current?.play();

      // Move to completion screen after 3 seconds
      setTimeout(() => {
        endAudioRef.current?.play();
        setCurrentScreen("completion");
      }, 1000);

      // Auto close after 6 seconds total
      setTimeout(() => {
        onComplete();
        onClose();
      }, 8000);
    }
  }, [messageParts, allBoxesBroken, onClose, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {/* Welcome Screen */}
        {currentScreen === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-4xl h-[600px] rounded-3xl overflow-hidden shadow-2xl"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1770975765362-448e5c2b6e8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMGFic3RyYWN0JTIwYXJ0JTIwc3R1ZGlvJTIwY3JlYXRpdmV8ZW58MXx8fHwxNzcyOTY1Mzg0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/60 via-pink-900/40 to-orange-900/60 flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center mb-12"
              >
                <h1 className="text-6xl font-bold text-white mb-4">
                  Breaking out the Boxes
                </h1>
                <p className="text-2xl text-orange-200">
                  Break boxes and unleash hidden messages
                </p>
              </motion.div>

              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.6,
                  type: "spring",
                  stiffness: 200,
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartGame}
                className="flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-2xl font-bold shadow-2xl hover:shadow-purple-500/50 transition-all"
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
        {currentScreen === "game" && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-6xl h-[700px] rounded-3xl overflow-hidden shadow-2xl"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1759333213207-daabf2584348?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3RpYyUyMGNhbnZhcyUyMHBhaW50JTIwc3R1ZGlvJTIwd29ya3NwYWNlfGVufDF8fHx8MTc3Mjk2NTc3NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-all z-50"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Hidden Message Parts (revealed as boxes break) at random positions */}
            <div className="absolute inset-0 pointer-events-none">
              {messageParts.map((part, index) => (
                <AnimatePresence key={index}>
                  {part.revealed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        type: "spring",
                      }}
                      className="absolute"
                      style={{
                        left: `${part.x}%`,
                        top: `${part.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <span className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 drop-shadow-2xl whitespace-nowrap">
                        {part.text}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>

            {/* Boxes Grid */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                  maxWidth: "900px",
                  width: "100%",
                }}
              >
                {Array.from({ length: totalBoxes }).map(
                  (_, index) => {
                    const isBroken =
                      brokenBoxes.has(index) || allBoxesBroken;

                    return (
                      <div
                        key={index}
                        className="aspect-square"
                      >
                        {!isBroken && (
                          <motion.button
                            initial={{
                              scale: 1,
                              rotateZ: 0,
                              opacity: 1,
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{
                              scale: isBroken ? 0 : 1,
                              rotateZ: isBroken ? 360 : 0,
                              opacity: isBroken ? 0 : 1,
                            }}
                            transition={{
                              duration: 0.5,
                              type: "spring",
                            }}
                            onClick={() =>
                              handleBoxClick(index)
                            }
                            className="w-full h-full rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 border-4 border-orange-700 shadow-lg hover:shadow-xl transition-all cursor-pointer relative overflow-hidden"
                            style={{
                              boxShadow:
                                "inset 0 -4px 8px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)",
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-300/50 to-transparent"></div>
                            <motion.div
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="absolute inset-2 border-2 border-orange-200/30 rounded-md"
                            ></motion.div>
                          </motion.button>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Progress indicator */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/80 backdrop-blur-sm rounded-full px-6 py-3">
              <p className="text-white text-lg font-semibold">
                Messages Revealed:{" "}
                {messageParts.filter((p) => p.revealed).length}{" "}
                / {messageWords.length}
              </p>
            </div>

            {/* All boxes broken - Sparkle effects */}
            {allBoxesBroken && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 pointer-events-none"
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: "50%",
                      y: "50%",
                      scale: 0,
                      opacity: 1,
                    }}
                    animate={{
                      x: `${Math.random() * 100}%`,
                      y: `${Math.random() * 100}%`,
                      scale: [0, 1.5, 0],
                      opacity: [1, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.1,
                      ease: "easeOut",
                    }}
                    className="absolute"
                  >
                    <Sparkles className="w-8 h-8 text-yellow-400" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Completion Screen */}
        {currentScreen === "completion" && (
          <motion.div
            key="completion"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6 }}
            className="relative w-full max-w-4xl h-[600px] rounded-3xl overflow-hidden shadow-2xl"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1760348178728-8dc7832c9790?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjZWxlYnJhdGlvbiUyMHN1Y2Nlc3MlMjBjb25mZXR0aSUyMGhhcHB5fGVufDF8fHx8MTc3Mjk2NTM4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/70 via-pink-900/60 to-orange-900/70 flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-center"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                  className="inline-block mb-6"
                >
                  <Sparkles className="w-24 h-24 text-yellow-400" />
                </motion.div>

                <h1 className="text-6xl font-bold text-white mb-6">
                  Amazing Work!
                </h1>

                {/* Display the full revealed message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="mb-8 px-8"
                >
                  <p className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 leading-tight">
                    {selectedMessage}
                  </p>
                </motion.div>

                <p className="text-3xl text-orange-200 mb-4">
                  You've broken free from all the boxes! 🎨
                </p>
                <p className="text-xl text-purple-200">
                  Keep creating without limits!
                </p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.8,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="mt-8 text-white/60 text-lg"
                >
                  Closing in a moment...
                </motion.div>
              </motion.div>

              {/* Floating confetti */}
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: "50%",
                    y: -20,
                    rotate: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: "100%",
                    rotate:
                      360 * (Math.random() > 0.5 ? 1 : -1),
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "linear",
                  }}
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: [
                      "#F59E0B",
                      "#EC4899",
                      "#8B5CF6",
                      "#10B981",
                    ][Math.floor(Math.random() * 4)],
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}