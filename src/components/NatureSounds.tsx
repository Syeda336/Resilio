import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, VolumeIcon, Volume1 } from 'lucide-react';

export function NatureSounds() {
  const [volume, setVolume] = useState(0.2);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize Web Audio API and start playing automatically
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = volume;

        // Start playing nature sounds automatically
        playNatureSounds();
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initAudio();

    return () => {
      stopAllSounds();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const stopAllSounds = () => {
    oscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    oscillatorsRef.current = [];

    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
      } catch (e) {
        // Already stopped
      }
      noiseNodeRef.current = null;
    }
  };

  const createPinkNoise = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const bufferSize = 2 * audioContextRef.current.sampleRate;
    const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    const pinkNoise = audioContextRef.current.createBufferSource();
    pinkNoise.buffer = noiseBuffer;
    pinkNoise.loop = true;
    
    const noiseGain = audioContextRef.current.createGain();
    noiseGain.gain.value = 0.3; // Adjust volume for pink noise
    
    pinkNoise.connect(noiseGain);
    noiseGain.connect(gainNodeRef.current);
    pinkNoise.start();
    noiseNodeRef.current = pinkNoise;
  };

  const createOscillator = (frequency: number, type: OscillatorType = 'sine', volumeMultiplier = 1) => {
    if (!audioContextRef.current || !gainNodeRef.current) return null;

    const oscillator = audioContextRef.current.createOscillator();
    const oscGain = audioContextRef.current.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscGain.gain.value = volumeMultiplier * 0.15;
    
    oscillator.connect(oscGain);
    oscGain.connect(gainNodeRef.current);
    oscillator.start();
    
    return oscillator;
  };

  const playNatureSounds = () => {
    stopAllSounds();

    // Create heartwarming, comforting sounds
    // Warm bass tone (like a gentle hum)
    const warmBass = createOscillator(110, 'sine', 0.25);
    
    // Harmonious mid tones (creating a peaceful chord)
    const harmony1 = createOscillator(220, 'sine', 0.18);
    const harmony2 = createOscillator(330, 'sine', 0.15);
    const harmony3 = createOscillator(440, 'sine', 0.12);
    
    // Gentle high tones (like soft bells)
    const gentle1 = createOscillator(880, 'triangle', 0.08);
    const gentle2 = createOscillator(1320, 'triangle', 0.06);
    
    // Very subtle ambient pad
    const ambient = createOscillator(165, 'sine', 0.10);
    
    // Add bird chirping sounds with various frequencies
    const bird1 = createOscillator(1200, 'sine', 0.12);
    const bird2 = createOscillator(2400, 'sine', 0.10);
    const bird3 = createOscillator(1800, 'sine', 0.08);
    const bird4 = createOscillator(3000, 'sine', 0.06);
    
    if (warmBass) oscillatorsRef.current.push(warmBass);
    if (harmony1) oscillatorsRef.current.push(harmony1);
    if (harmony2) oscillatorsRef.current.push(harmony2);
    if (harmony3) oscillatorsRef.current.push(harmony3);
    if (gentle1) oscillatorsRef.current.push(gentle1);
    if (gentle2) oscillatorsRef.current.push(gentle2);
    if (ambient) oscillatorsRef.current.push(ambient);
    if (bird1) oscillatorsRef.current.push(bird1);
    if (bird2) oscillatorsRef.current.push(bird2);
    if (bird3) oscillatorsRef.current.push(bird3);
    if (bird4) oscillatorsRef.current.push(bird4);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const volumeDown = () => {
    const newVolume = Math.max(0, volume - 0.05);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const volumeUp = () => {
    const newVolume = Math.min(0.5, volume + 0.05);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="bg-white/90 backdrop-blur-sm border-2 border-pink-300 shadow-lg rounded-xl p-4 w-80">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-400 to-rose-500 text-white p-2 rounded-lg">
              <div className="animate-pulse text-xl">💖🐦</div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">Heartwarming Sounds</p>
              <p className="text-xs text-gray-600">with Bird Chirping 🌿</p>
            </div>

            <button
              onClick={toggleMute}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-gray-600" />
              ) : (
                <Volume2 className="w-5 h-5 text-pink-600" />
              )}
            </button>
          </div>

          {/* Volume Controls */}
          <div className="space-y-2">
            {/* Slider */}
            <input
              type="range"
              min="0"
              max="0.5"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
            />
            
            {/* Volume Buttons */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={volumeDown}
                disabled={volume === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Volume1 className="w-4 h-4" />
                Down
              </button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  {isMuted ? 'Muted' : `${Math.round((volume / 0.5) * 100)}%`}
                </p>
              </div>

              <button
                onClick={volumeUp}
                disabled={volume >= 0.5}
                className="flex items-center gap-1 px-3 py-1.5 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Volume2 className="w-4 h-4" />
                Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}