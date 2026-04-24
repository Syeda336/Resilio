import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { 
  Bold, 
  Italic, 
  Underline, 
  Mic, 
  MicOff, 
  Smile, 
  Save,
  Music,
  Palette,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface JournalEditorProps {
  onSave: (content: string, mood: string, moodEmoji: string) => void;
}

const moods = [
  // Happy moods (5)
  { label: 'Happy 😊', emoji: '😊', value: 'happy' },
  { label: 'Excited 🎉', emoji: '🎉', value: 'excited' },
  { label: 'Grateful 🙏', emoji: '🙏', value: 'grateful' },
  { label: 'Loved 💖', emoji: '💖', value: 'loved' },
  // Calm moods (4.5)
  { label: 'Peaceful 🌿', emoji: '🌿', value: 'peaceful' },
  { label: 'Calm 😌', emoji: '😌', value: 'calm' },
  { label: 'Relaxed 😌', emoji: '😌', value: 'relaxed' },
  { label: 'Content 😊', emoji: '😊', value: 'content' },
  // Good moods (4)
  { label: 'Hopeful ✨', emoji: '✨', value: 'hopeful' },
  { label: 'Energetic ⚡', emoji: '⚡', value: 'energetic' },
  { label: 'Thoughtful 🤔', emoji: '🤔', value: 'thoughtful' },
  // Neutral (3)
  { label: 'Neutral 😐', emoji: '😐', value: 'neutral' },
  // Low moods (2-2.5)
  { label: 'Tired 😴', emoji: '😴', value: 'tired' },
  { label: 'Stressed 😰', emoji: '😰', value: 'stressed' },
  { label: 'Anxious 😟', emoji: '😟', value: 'anxious' },
  { label: 'Frustrated 😤', emoji: '😤', value: 'frustrated' },
  // Down moods (1-1.5)
  { label: 'Overwhelmed 😵', emoji: '😵', value: 'overwhelmed' },
  { label: 'Sad 😢', emoji: '😢', value: 'sad' },
  { label: 'Lonely 😔', emoji: '😔', value: 'lonely' },
  { label: 'Angry 😠', emoji: '😠', value: 'angry' },
];

const emojis = [
  '😊', '😂', '🥰', '😍', '😎', '🤔', '😢', '😭', '😤', '😡',
  '🎉', '🎊', '🎈', '❤️', '💚', '💙', '💜', '⭐', '✨', '🌟',
  '🔥', '💪', '🙏', '👍', '👏', '✅', '❌', '🎯', '🌈', '☀️',
  '🌙', '⚡', '💡', '🎵', '🎶', '📝', '📚', '🏆', '🎁', '🌸',
  '🌺', '🌻', '🌹', '🍀', '🌿', '🌱', '🦋', '🐝', '🌊', '🏔️'
];

const colors = [
  { name: 'Black', value: '#000000', gradient: 'from-gray-800 to-black' },
  { name: 'Emerald', value: '#059669', gradient: 'from-emerald-400 to-emerald-600' },
  { name: 'Green', value: '#16a34a', gradient: 'from-green-400 to-green-600' },
  { name: 'Teal', value: '#0d9488', gradient: 'from-teal-400 to-teal-600' },
  { name: 'Mint', value: '#10b981', gradient: 'from-emerald-300 to-green-500' },
  { name: 'Forest', value: '#065f46', gradient: 'from-green-700 to-emerald-900' },
  { name: 'Blue', value: '#2563eb', gradient: 'from-blue-400 to-blue-600' },
  { name: 'Indigo', value: '#4f46e5', gradient: 'from-indigo-400 to-indigo-600' },
  { name: 'Purple', value: '#9333ea', gradient: 'from-purple-400 to-purple-600' },
  { name: 'Pink', value: '#ec4899', gradient: 'from-pink-400 to-pink-600' },
  { name: 'Red', value: '#dc2626', gradient: 'from-red-400 to-red-600' },
  { name: 'Orange', value: '#ea580c', gradient: 'from-orange-400 to-orange-600' },
  { name: 'Yellow', value: '#eab308', gradient: 'from-yellow-400 to-yellow-600' },
  { name: 'Lime', value: '#84cc16', gradient: 'from-lime-400 to-lime-600' },
  { name: 'Cyan', value: '#06b6d4', gradient: 'from-cyan-400 to-cyan-600' },
  { name: 'White', value: '#ffffff', gradient: 'from-gray-100 to-white' },
];

const musicOptions = [
  { 
    label: 'Peaceful Piano', 
    value: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
    icon: '🎹'
  },
  { 
    label: 'Calm Ambience', 
    value: 'https://assets.mixkit.co/active_storage/sfx/513/513-preview.mp3',
    icon: '🌊'
  },
  { 
    label: 'Gentle Guitar', 
    value: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
    icon: '🎸'
  },
  { 
    label: 'Nature Sounds', 
    value: 'https://assets.mixkit.co/active_storage/sfx/2459/2459-preview.mp3',
    icon: '🌲'
  },
  { 
    label: 'Soft Melody', 
    value: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3',
    icon: '🎵'
  },
];

export function JournalEditor({ onSave }: JournalEditorProps) {
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState(moods[0]);
  const [isListening, setIsListening] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(musicOptions[0].value);
  const [currentColor, setCurrentColor] = useState('#000000');
  const editorRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript && editorRef.current) {
          const selection = window.getSelection();
          const range = selection?.getRangeAt(0);
          const span = document.createElement('span');
          span.textContent = finalTranscript;
          span.style.color = currentColor;
          
          if (range) {
            range.insertNode(span);
            range.collapse(false);
          }
          
          updateContent();
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition error. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (musicEnabled) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(selectedMusic);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(err => console.error('Audio play error:', err));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [musicEnabled, selectedMusic]);

  const updateContent = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const toggleVoiceTyping = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.info('Voice typing stopped');
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Voice typing started - speak now!');
    }
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const insertEmoji = (emoji: string) => {
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    const span = document.createElement('span');
    span.textContent = emoji;
    
    if (range && editorRef.current) {
      range.insertNode(span);
      range.collapse(false);
      updateContent();
    }
  };

  const handleSave = () => {
    if (!content.trim()) {
      toast.error('Please write something before saving');
      return;
    }

    onSave(content, selectedMood.label, selectedMood.emoji);
    
    // Clear editor
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    setContent('');
    
    toast.success(`Journal entry saved with mood: ${selectedMood.emoji} ${selectedMood.label}`);
  };

  return (
    <Card className="p-8 bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/20 rounded-3xl">
      <div className="space-y-6">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
          {/* Text Formatting */}
          <div className="flex gap-2 border-r border-white/30 pr-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => applyFormat('bold')}
              className="hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white hover:text-white hover:scale-110 transition-all duration-200 shadow-lg"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => applyFormat('italic')}
              className="hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white hover:text-white hover:scale-110 transition-all duration-200 shadow-lg"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => applyFormat('underline')}
              className="hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white hover:text-white hover:scale-110 transition-all duration-200 shadow-lg"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </Button>
          </div>

          {/* Color Picker */}
          <div className="flex gap-2 border-r border-white/30 pr-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white hover:text-white hover:scale-110 transition-all duration-200 shadow-lg"
                  title="Text Color"
                >
                  <Palette className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
                <div className="space-y-3">
                  <Label className="text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Choose Text Color
                  </Label>
                  <div className="grid grid-cols-4 gap-3">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        className={`group relative w-full h-12 rounded-xl border-2 hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl ${
                          currentColor === color.value ? 'border-white scale-110' : 'border-white/30'
                        }`}
                        onClick={() => {
                          setCurrentColor(color.value);
                          applyFormat('foreColor', color.value);
                        }}
                        title={color.name}
                      >
                        <div className={`w-full h-full rounded-lg bg-gradient-to-br ${color.gradient}`}></div>
                        <span className="absolute inset-x-0 -bottom-6 text-xs text-white/80 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {color.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Emoji Picker */}
          <div className="flex gap-2 border-r border-white/30 pr-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white hover:text-white hover:scale-110 transition-all duration-200 shadow-lg"
                  title="Insert Emoji"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
                <div className="space-y-3">
                  <Label className="text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Choose Emoji
                  </Label>
                  <div className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto pr-2">
                    {emojis.map((emoji, index) => (
                      <button
                        key={index}
                        className="text-2xl hover:scale-125 transition-transform duration-200 hover:bg-white/20 rounded-lg p-2"
                        onClick={() => insertEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Voice Typing */}
          <Button
            size="sm"
            variant={isListening ? "default" : "ghost"}
            onClick={toggleVoiceTyping}
            className={`${
              isListening 
                ? "bg-gradient-to-br from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-xl border-0" 
                : "hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white hover:text-white"
            } hover:scale-110 transition-all duration-200 shadow-lg`}
            title="Voice Typing"
          >
            {isListening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
          </Button>

          {/* Music Options */}
          <div className="flex items-center gap-3 ml-auto bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
            <Select value={selectedMusic} onValueChange={setSelectedMusic}>
              <SelectTrigger className="w-[180px] border-white/30 text-white bg-white/10 backdrop-blur-sm focus:ring-emerald-400">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/10 backdrop-blur-2xl border border-white/20">
                {musicOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                    className="text-white hover:bg-white/20 focus:bg-white/20"
                  >
                    <span className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <span>{option.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Switch
              checked={musicEnabled}
              onCheckedChange={setMusicEnabled}
              className="data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-emerald-500 data-[state=checked]:to-green-500"
            />
            {musicEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/50" />
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            onInput={updateContent}
            className="min-h-[450px] p-6 bg-white/20 backdrop-blur-xl border-2 border-white/30 rounded-2xl focus:outline-none focus:border-emerald-400/50 focus:shadow-2xl transition-all duration-300 text-white placeholder:text-white/50 shadow-xl"
            style={{ caretColor: currentColor }}
            suppressContentEditableWarning
          >
            {!content && (
              <span className="text-white/50 pointer-events-none">
                Start writing your journal entry...
              </span>
            )}
          </div>
        </div>

        {/* Mood Selector and Save */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 border-t border-white/20">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20 shadow-lg">
            <Label className="text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Current Mood:
            </Label>
            <Select
              value={selectedMood.value}
              onValueChange={(value) => {
                const mood = moods.find(m => m.value === value);
                if (mood) setSelectedMood(mood);
              }}
            >
              <SelectTrigger className="w-[220px] border-white/30 text-white bg-white/10 backdrop-blur-sm focus:ring-emerald-400 shadow-lg">
                <SelectValue>
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">{selectedMood.emoji}</span>
                    <span>{selectedMood.label}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white/10 backdrop-blur-2xl border border-white/20">
                {moods.map((mood) => (
                  <SelectItem 
                    key={mood.value} 
                    value={mood.value}
                    className="text-white hover:bg-white/20 focus:bg-white/20"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-2xl">{mood.emoji}</span>
                      <span>{mood.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSave}
            className="bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-2xl border-0 hover:scale-105 transition-all duration-300 px-8 py-6 rounded-2xl"
            size="lg"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Entry
          </Button>
        </div>
      </div>
    </Card>
  );
}