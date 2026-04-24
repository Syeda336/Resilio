import { useState, useRef, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';

const musicTracks = [
  { id: 'ambient1', name: 'Calm Waves', type: 'waves' },
  { id: 'ambient2', name: 'Gentle Rain', type: 'rain' },
  { id: 'ambient3', name: 'Peaceful Tones', type: 'tones' },
  { id: 'ambient4', name: 'White Noise', type: 'whitenoise' },
  { id: 'ambient5', name: 'Nature Sounds', type: 'nature' },
  { id: 'ambient6', name: 'Meditation Hum', type: 'hum' },
];

interface MusicPlayerProps {
  onClose: () => void;
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
}

export function MusicPlayer({ onClose, isPlaying, onPlayingChange }: MusicPlayerProps) {
  const [selectedTrack, setSelectedTrack] = useState(musicTracks[0]);
  const [volume, setVolume] = useState(0.3);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    // Initialize Web Audio API
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);
    gainNodeRef.current.gain.value = volume;

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

  const createWhiteNoise = () => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    const bufferSize = 2 * audioContextRef.current.sampleRate;
    const noiseBuffer = audioContextRef.current.createBuffer(1, bufferSize, audioContextRef.current.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioContextRef.current.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;
    whiteNoise.connect(gainNodeRef.current);
    whiteNoise.start();
    noiseNodeRef.current = whiteNoise;
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
    pinkNoise.connect(gainNodeRef.current);
    pinkNoise.start();
    noiseNodeRef.current = pinkNoise;
  };

  const createOscillator = (frequency: number, type: OscillatorType = 'sine', volumeMultiplier = 1) => {
    if (!audioContextRef.current || !gainNodeRef.current) return null;

    const oscillator = audioContextRef.current.createOscillator();
    const oscGain = audioContextRef.current.createGain();
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscGain.gain.value = volume * volumeMultiplier;
    
    oscillator.connect(oscGain);
    oscGain.connect(gainNodeRef.current);
    oscillator.start();
    
    return oscillator;
  };

  const playTrack = (track: typeof musicTracks[0]) => {
    stopAllSounds();

    switch (track.type) {
      case 'waves':
        // Create wave-like sounds with low frequencies
        const wave1 = createOscillator(110, 'sine', 0.3);
        const wave2 = createOscillator(165, 'sine', 0.2);
        const wave3 = createOscillator(220, 'sine', 0.15);
        if (wave1) oscillatorsRef.current.push(wave1);
        if (wave2) oscillatorsRef.current.push(wave2);
        if (wave3) oscillatorsRef.current.push(wave3);
        break;

      case 'rain':
        // Pink noise for rain sounds
        createPinkNoise();
        break;

      case 'tones':
        // Peaceful harmonic tones
        const tone1 = createOscillator(256, 'sine', 0.2);
        const tone2 = createOscillator(384, 'sine', 0.15);
        const tone3 = createOscillator(512, 'sine', 0.1);
        if (tone1) oscillatorsRef.current.push(tone1);
        if (tone2) oscillatorsRef.current.push(tone2);
        if (tone3) oscillatorsRef.current.push(tone3);
        break;

      case 'whitenoise':
        // White noise
        createWhiteNoise();
        break;

      case 'nature':
        // Nature sounds with mixed frequencies
        const nature1 = createOscillator(200, 'sine', 0.2);
        const nature2 = createOscillator(400, 'sine', 0.1);
        createPinkNoise();
        if (nature1) oscillatorsRef.current.push(nature1);
        if (nature2) oscillatorsRef.current.push(nature2);
        break;

      case 'hum':
        // Deep meditation hum
        const hum1 = createOscillator(136.1, 'sine', 0.4);
        const hum2 = createOscillator(272.2, 'sine', 0.2);
        if (hum1) oscillatorsRef.current.push(hum1);
        if (hum2) oscillatorsRef.current.push(hum2);
        break;
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAllSounds();
      onPlayingChange(false);
    } else {
      playTrack(selectedTrack);
      onPlayingChange(true);
    }
  };

  const handleTrackChange = (track: typeof musicTracks[0]) => {
    setSelectedTrack(track);
    // Play the track immediately when selected
    playTrack(track);
    onPlayingChange(true);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="bg-white border-2 border-gray-300 p-4 shadow-lg w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-black">Music Player</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-black" />
        </button>
      </div>

      {/* Track Selection */}
      <div className="mb-4">
        <label className="text-black block mb-2">Select Track:</label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {musicTracks.map((track) => (
            <button
              key={track.id}
              onClick={() => handleTrackChange(track)}
              className={`w-full text-left px-3 py-2 border transition-all ${
                selectedTrack.id === track.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-black border-gray-300 hover:border-emerald-600'
              }`}
            >
              {track.name}
            </button>
          ))}
        </div>
      </div>

      {/* Volume Control */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <label className="text-black">Volume:</label>
          <button
            onClick={toggleMute}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-black" />
            ) : (
              <Volume2 className="w-5 h-5 text-black" />
            )}
          </button>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
        <div className="text-right text-black">{Math.round(volume * 100)}%</div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {isPlaying ? (
          <>
            <button
              onClick={togglePlay}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white border-2 border-red-500 hover:bg-red-600 transition-all"
            >
              <Pause className="w-5 h-5" />
              Stop
            </button>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white border-2 border-emerald-600 hover:bg-emerald-700 transition-all"
            >
              OK
            </button>
          </>
        ) : (
          <button
            onClick={togglePlay}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white border-2 border-emerald-600 hover:bg-emerald-700 transition-all"
          >
            <Play className="w-5 h-5" />
            Play
          </button>
        )}
      </div>

      {isPlaying && (
        <div className="mt-4 pt-4 border-t border-gray-300">
          <p className="text-gray-600 text-center">
            Now Playing: <span className="text-black">{selectedTrack.name}</span>
          </p>
          <p className="text-emerald-600 text-center mt-2 animate-pulse">♫ Playing...</p>
        </div>
      )}
    </div>
  );
}