import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Save, Smile, Palette, Type, AlignLeft, Heading } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { EmojiPicker } from './EmojiPicker';
import { diaryAPI } from '../utils/api';
import { logActivity } from '../utils/activityTracker';
import { dashboardRefresh } from '../utils/dashboardRefresh';

interface DiaryEntry {
  id: string;
  content: string;
  mood: string;
  date: string;
  time: string;
}

export function DiaryEditor() {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [saving, setSaving] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const editorRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        console.log('🎤 Speech recognition started');
        setListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece + ' ';
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        if (finalTranscript && editorRef.current) {
          console.log('✅ Final transcript:', finalTranscript);
          // Insert text at cursor position
          editorRef.current.focus();
          document.execCommand('insertText', false, finalTranscript);
          setContent(editorRef.current.innerHTML);
        }

        setTranscript(interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('�� Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access in your browser settings.');
        }
        setListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log('🛑 Speech recognition ended');
        setListening(false);
        setTranscript('');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Voice typing is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (listening) {
      try {
        recognitionRef.current.stop();
        setListening(false);
        setTranscript('');
      } catch (error) {
        console.error('Error stopping recognition:', error);
        setListening(false);
        setTranscript('');
      }
    } else {
      try {
        // Make sure recognition is not already running
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            // Ignore if already stopped
          }
        }
        
        // Small delay to ensure previous session is fully stopped
        setTimeout(() => {
          try {
            recognitionRef.current.start();
            console.log('🎤 Starting speech recognition...');
          } catch (error) {
            console.error('Error starting recognition:', error);
            alert('Could not start voice typing. Please try again.');
            setListening(false);
          }
        }, 100);
      } catch (error) {
        console.error('Error in toggle:', error);
        setListening(false);
      }
    }
  };

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertText', false, emoji);
    }
    setShowEmojiPicker(false);
  };

  const applyFormatting = (command: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false);
    }
  };

  const applyFontFamily = (fontName: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('fontName', false, fontName);
    }
  };

  const applyFontSize = (fontSize: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('fontSize', false, fontSize);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const saveEntry = async () => {
    if (!content.trim() || content === '<br>') {
      return;
    }

    setSaving(true);

    const entry: DiaryEntry = {
      id: Date.now().toString(),
      content,
      mood,
      date: new Date().toLocaleDateString('en-US'), // Use consistent date format
      time: new Date().toLocaleTimeString('en-US'), // Use consistent time format
    };
    
    console.log('💾 Saving diary entry:', { mood: entry.mood, date: entry.date, time: entry.time });

    diaryAPI.create(entry)
      .then(async () => {
        console.log('✅ Diary entry saved successfully');
        setContent('');
        setMood('');
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
        }
        // Note: No need to log activity separately - activities are auto-generated from diary_entries table
        // Trigger dashboard refresh
        console.log('🔄 Triggering dashboard refresh...');
        dashboardRefresh.trigger();
      })
      .catch((error) => {
        console.error('❌ Error saving entry:', error);
      })
      .finally(() => {
        setSaving(false);
      });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-black text-center">Write Your Thoughts</h2>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 justify-center items-center">
        {/* Style Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowStyleMenu(!showStyleMenu);
              setShowColorPicker(false);
              setShowEmojiPicker(false);
              setShowFontMenu(false);
              setShowSizeMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-gray-300 hover:border-blue-500 transition-all rounded-lg"
          >
            <Type className="w-5 h-5" />
            Style
          </button>
          {showStyleMenu && (
            <div className="absolute top-full mt-2 z-50 bg-white border-2 border-gray-300 shadow-lg rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  applyFormatting('bold');
                  setShowStyleMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
              >
                <strong>Bold</strong>
              </button>
              <button
                onClick={() => {
                  applyFormatting('italic');
                  setShowStyleMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
              >
                <em>Italic</em>
              </button>
              <button
                onClick={() => {
                  applyFormatting('underline');
                  setShowStyleMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all"
              >
                <u>Underline</u>
              </button>
            </div>
          )}
        </div>

        {/* Font Family Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFontMenu(!showFontMenu);
              setShowColorPicker(false);
              setShowEmojiPicker(false);
              setShowStyleMenu(false);
              setShowSizeMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-gray-300 hover:border-blue-500 transition-all rounded-lg"
          >
            <AlignLeft className="w-5 h-5" />
            Font
          </button>
          {showFontMenu && (
            <div className="absolute top-full mt-2 z-50 bg-white border-2 border-gray-300 shadow-lg rounded-lg overflow-hidden max-h-80 overflow-y-auto">
              <button
                onClick={() => {
                  applyFontFamily('Times New Roman');
                  setShowFontMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
                style={{ fontFamily: 'Times New Roman' }}
              >
                Times New Roman
              </button>
              <button
                onClick={() => {
                  applyFontFamily('Aptos');
                  setShowFontMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
                style={{ fontFamily: 'Aptos, sans-serif' }}
              >
                Aptos
              </button>
              <button
                onClick={() => {
                  applyFontFamily('Bahnschrift');
                  setShowFontMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
                style={{ fontFamily: 'Bahnschrift, sans-serif' }}
              >
                Bahnschrift Condensed
              </button>
              <button
                onClick={() => {
                  applyFontFamily('Berlin Sans FB');
                  setShowFontMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
                style={{ fontFamily: 'Berlin Sans FB, sans-serif' }}
              >
                Berlin Sans FB
              </button>
              <button
                onClick={() => {
                  applyFontFamily('Britannic Bold');
                  setShowFontMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
                style={{ fontFamily: 'Britannic Bold, sans-serif' }}
              >
                Britannic Bold
              </button>
              <button
                onClick={() => {
                  applyFontFamily('Brush Script MT');
                  setShowFontMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
                style={{ fontFamily: 'Brush Script MT, cursive' }}
              >
                Brush Script M7
              </button>
              <button
                onClick={() => {
                  applyFontFamily('Cascadia Code');
                  setShowFontMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
                style={{ fontFamily: 'Cascadia Code, monospace' }}
              >
                Cascadia Code
              </button>
              <button
                onClick={() => {
                  applyFontFamily('Arial Rounded MT Bold');
                  setShowFontMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
                style={{ fontFamily: 'Arial Rounded MT Bold, sans-serif' }}
              >
                Arial Rounded MT Bold
              </button>
              <button
                onClick={() => {
                  applyFontFamily('Baguet Script');
                  setShowFontMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
                style={{ fontFamily: 'Baguet Script, cursive' }}
              >
                Baguet Script
              </button>
              <button
                onClick={() => {
                  applyFontFamily('Broadway');
                  setShowFontMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all"
                style={{ fontFamily: 'Broadway, serif' }}
              >
                Broadway
              </button>
            </div>
          )}
        </div>

        {/* Font Size Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSizeMenu(!showSizeMenu);
              setShowColorPicker(false);
              setShowEmojiPicker(false);
              setShowFontMenu(false);
              setShowStyleMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-gray-300 hover:border-blue-500 transition-all rounded-lg"
          >
            <Heading className="w-5 h-5" />
            Size
          </button>
          {showSizeMenu && (
            <div className="absolute top-full mt-2 z-50 bg-white border-2 border-gray-300 shadow-lg rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  applyFontSize('1');
                  setShowSizeMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
              >
                <span style={{ fontSize: '10px' }}>Small</span>
              </button>
              <button
                onClick={() => {
                  applyFontSize('2');
                  setShowSizeMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
              >
                <span style={{ fontSize: '12px' }}>Medium</span>
              </button>
              <button
                onClick={() => {
                  applyFontSize('3');
                  setShowSizeMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
              >
                <span style={{ fontSize: '14px' }}>Large</span>
              </button>
              <button
                onClick={() => {
                  applyFontSize('4');
                  setShowSizeMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
              >
                <span style={{ fontSize: '16px' }}>X-Large</span>
              </button>
              <button
                onClick={() => {
                  applyFontSize('5');
                  setShowSizeMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
              >
                <span style={{ fontSize: '18px' }}>XX-Large</span>
              </button>
              <button
                onClick={() => {
                  applyFontSize('6');
                  setShowSizeMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all border-b border-gray-200"
              >
                <span style={{ fontSize: '20px' }}>XXX-Large</span>
              </button>
              <button
                onClick={() => {
                  applyFontSize('7');
                  setShowSizeMenu(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-blue-50 transition-all"
              >
                <span style={{ fontSize: '22px' }}>XXXX-Large</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={toggleRecording}
          className={`flex items-center gap-2 px-4 py-2 border-2 rounded-lg transition-all ${
            listening
              ? 'bg-red-500 text-white border-red-500 animate-pulse'
              : 'bg-white text-black border-gray-300 hover:border-blue-500'
          }`}
        >
          {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          {listening ? 'Listening...' : 'Voice Type'}
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowColorPicker(false);
              setShowFontMenu(false);
              setShowStyleMenu(false);
              setShowSizeMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-gray-300 hover:border-blue-500 transition-all rounded-lg"
          >
            <Smile className="w-5 h-5" />
            Emoji
          </button>
          {showEmojiPicker && (
            <div className="absolute top-full mt-2 z-50">
              <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmojiPicker(false)} />
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowEmojiPicker(false);
              setShowFontMenu(false);
              setShowStyleMenu(false);
              setShowSizeMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black border-2 border-gray-300 hover:border-blue-500 transition-all rounded-lg"
          >
            <Palette className="w-5 h-5" />
            Text Color
          </button>
          {showColorPicker && (
            <div className="absolute top-full mt-2 z-50">
              <ColorPicker
                currentColor={currentColor}
                onSelect={(color) => {
                  setCurrentColor(color);
                  setShowColorPicker(false);
                }}
                onClose={() => setShowColorPicker(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mood Input */}
      <div className="space-y-2">
        <label className="text-black">How are you feeling?</label>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none text-black"
        >
          <option value="">Select your mood...</option>
          <option value="Happy 😊">Happy 😊</option>
          <option value="Excited 🎉">Excited 🎉</option>
          <option value="Grateful 🙏">Grateful 🙏</option>
          <option value="Peaceful 🌿">Peaceful 🌿</option>
          <option value="Calm 😌">Calm 😌</option>
          <option value="Content 😊">Content 😊</option>
          <option value="Thoughtful 🤔">Thoughtful 🤔</option>
          <option value="Hopeful ✨">Hopeful ✨</option>
          <option value="Loved 💖">Loved 💖</option>
          <option value="Energetic ⚡">Energetic ⚡</option>
          <option value="Relaxed 😌">Relaxed 😌</option>
          <option value="Neutral 😐">Neutral 😐</option>
          <option value="Tired 😴">Tired 😴</option>
          <option value="Stressed 😰">Stressed 😰</option>
          <option value="Anxious 😟">Anxious 😟</option>
          <option value="Sad 😢">Sad 😢</option>
          <option value="Frustrated 😤">Frustrated 😤</option>
          <option value="Overwhelmed 😵">Overwhelmed 😵</option>
          <option value="Angry 😠">Angry 😠</option>
          <option value="Lonely 😔">Lonely 😔</option>
        </select>
      </div>

      {/* Debug Display - Remove this after testing */}
      {listening && (
        <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
          <p className="text-sm text-gray-600 mb-2">Debug Info:</p>
          <p className="text-sm"><strong>Listening:</strong> {listening ? 'Yes ✅' : 'No ❌'}</p>
          <p className="text-sm"><strong>Transcript:</strong> {transcript || '(empty)'}</p>
        </div>
      )}

      {/* Text Editor */}
      <div className="space-y-2">
        <label className="text-black">Your Journal Entry</label>
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorInput}
          data-placeholder="Start writing your thoughts here..."
          style={{ color: currentColor }}
          className="w-full min-h-96 px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none overflow-auto empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-center">
        <button
          onClick={saveEntry}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 via-teal-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Entry'}
        </button>
      </div>
    </div>
  );
}