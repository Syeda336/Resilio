import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { CalendarIcon, Clock, Music, Send, Trash2, Gift, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner@2.0.3';
import { FutureMessage } from '../App';

interface FutureSelfMessageProps {
  messages: FutureMessage[];
  onAddMessage: (message: string, scheduledDate: Date, music?: string) => void;
  onDeleteMessage: (id: string) => void;
}

const musicOptions = [
  { label: 'None', value: 'none', icon: '🔇' },
  { label: 'Calm Piano', value: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', icon: '🎹' },
  { label: 'Uplifting Melody', value: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3', icon: '🎵' },
  { label: 'Peaceful Ambience', value: 'https://assets.mixkit.co/active_storage/sfx/513/513-preview.mp3', icon: '🌊' },
  { label: 'Nature Sounds', value: 'https://assets.mixkit.co/active_storage/sfx/2459/2459-preview.mp3', icon: '🌲' },
  { label: 'Soft Melody', value: 'https://assets.mixkit.co/active_storage/sfx/2567/2567-preview.mp3', icon: '🎶' },
  { label: 'Gentle Guitar', value: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3', icon: '🎸' },
];

const timeOptions = [
  '12:00 AM', '01:00 AM', '02:00 AM', '03:00 AM', '04:00 AM', '05:00 AM',
  '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM',
];

export function FutureSelfMessage({ messages, onAddMessage, onDeleteMessage }: FutureSelfMessageProps) {
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('09:00 AM');
  const [selectedMusic, setSelectedMusic] = useState('none');
  const [deliveredMessage, setDeliveredMessage] = useState<FutureMessage | null>(null);

  // Check for messages that should be delivered
  useEffect(() => {
    const checkMessages = setInterval(() => {
      const now = new Date();
      messages.forEach(msg => {
        if (!msg.delivered && new Date(msg.scheduledDate) <= now) {
          setDeliveredMessage(msg);
          
          // Play music if selected
          if (msg.music && msg.music !== 'none') {
            const audio = new Audio(msg.music);
            audio.play().catch(err => console.error('Audio play error:', err));
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkMessages);
  }, [messages]);

  const handleSubmit = () => {
    if (!message.trim()) {
      toast.error('Please write a message');
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }

    // Combine date and time
    const [time, period] = selectedTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let finalHours = hours;
    
    if (period === 'PM' && hours !== 12) {
      finalHours = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      finalHours = 0;
    }

    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(finalHours, minutes, 0, 0);

    // Check if date is in the future
    if (scheduledDate <= new Date()) {
      toast.error('Please select a future date and time');
      return;
    }

    const musicUrl = selectedMusic !== 'none' ? selectedMusic : undefined;
    onAddMessage(message, scheduledDate, musicUrl);

    // Reset form
    setMessage('');
    setSelectedDate(undefined);
    setSelectedTime('09:00 AM');
    setSelectedMusic('none');

    toast.success('Future message scheduled! 🎉');
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Create Message Card */}
      <Card className="p-8 bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/20 rounded-3xl h-fit">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-2xl border border-white/30 shadow-lg">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-white">Message Your Future Self</h2>
          </div>

          {/* Message Input */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Your Message
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message to your future self..."
              className="min-h-[180px] border-white/30 bg-white/10 backdrop-blur-xl text-white placeholder:text-white/50 focus:ring-emerald-400 focus:border-emerald-400/50 resize-none rounded-2xl shadow-lg"
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Select Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left border-white/30 bg-white/10 backdrop-blur-xl text-white hover:bg-white/20 rounded-2xl h-12 shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                  <CalendarIcon className="mr-3 h-5 w-5" />
                  {selectedDate ? format(selectedDate, 'PPP') : <span className="text-white/70">Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white/10 backdrop-blur-2xl border border-white/20" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Picker */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Select Time
            </Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger className="border-white/30 bg-white/10 backdrop-blur-xl text-white focus:ring-emerald-400 rounded-2xl h-12 shadow-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white/10 backdrop-blur-2xl border border-white/20">
                <ScrollArea className="h-[200px]">
                  {timeOptions.map((time) => (
                    <SelectItem 
                      key={time} 
                      value={time}
                      className="text-white hover:bg-white/20 focus:bg-white/20"
                    >
                      {time}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>

          {/* Music Selection */}
          <div className="space-y-3">
            <Label className="text-white flex items-center gap-2">
              <Music className="w-4 h-4" />
              Background Music
            </Label>
            <Select value={selectedMusic} onValueChange={setSelectedMusic}>
              <SelectTrigger className="border-white/30 bg-white/10 backdrop-blur-xl text-white focus:ring-emerald-400 rounded-2xl h-12 shadow-lg">
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5" />
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
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{option.icon}</span>
                      <span>{option.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-2xl border-0 hover:scale-105 transition-all duration-300 h-14 rounded-2xl"
            size="lg"
          >
            <Send className="w-5 h-5 mr-2" />
            Schedule Message
          </Button>
        </div>
      </Card>

      {/* Scheduled Messages List */}
      <Card className="p-8 bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/20 rounded-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-2xl border border-white/30 shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-white">Scheduled Messages</h2>
        </div>
        
        {messages.length === 0 ? (
          <div className="text-center text-white/70 py-16">
            <div className="space-y-3">
              <p className="text-xl">No messages scheduled yet.</p>
              <p>Create your first message to your future self!</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[580px] pr-4">
            <div className="space-y-4">
              {messages
                .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
                .map((msg) => (
                  <Card
                    key={msg.id}
                    className="p-6 border border-white/20 hover:shadow-2xl transition-all bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-xl rounded-2xl hover:scale-[1.02] duration-300 group"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-3 flex-1">
                          <p className="text-white/90 line-clamp-3">{msg.message}</p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg text-white/80 text-sm">
                              <CalendarIcon className="w-3 h-3" />
                              {format(new Date(msg.scheduledDate), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg text-white/80 text-sm">
                              <Clock className="w-3 h-3" />
                              {format(new Date(msg.scheduledDate), 'hh:mm a')}
                            </span>
                            {msg.music && msg.music !== 'none' && (
                              <span className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm px-3 py-1 rounded-lg text-emerald-300 text-sm border border-emerald-400/30">
                                <Music className="w-3 h-3" />
                                With music
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20 backdrop-blur-sm border border-white/20 hover:border-red-400/50 transition-all duration-200 rounded-xl shadow-lg hover:scale-110"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white/10 backdrop-blur-2xl border border-white/20">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Message?</AlertDialogTitle>
                              <AlertDialogDescription className="text-white/70">
                                This scheduled message will be permanently deleted and won't be delivered.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeleteMessage(msg.id)}
                                className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-xl"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </ScrollArea>
        )}
      </Card>

      {/* Delivered Message Dialog */}
      <Dialog open={!!deliveredMessage} onOpenChange={() => setDeliveredMessage(null)}>
        <DialogContent className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-3xl flex items-center gap-3 text-white">
              <div className="p-3 bg-gradient-to-br from-emerald-500/30 to-green-500/30 rounded-2xl border border-white/30 shadow-lg">
                <Gift className="w-8 h-8" />
              </div>
              Message from Your Past Self! 🎉
            </DialogTitle>
            <DialogDescription className="text-white/70 text-lg">
              Scheduled for {deliveredMessage && format(new Date(deliveredMessage.scheduledDate), 'PPP')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <p className="text-xl text-white/90 leading-relaxed">{deliveredMessage?.message}</p>
          </div>
          <Button
            onClick={() => {
              if (deliveredMessage) {
                onDeleteMessage(deliveredMessage.id);
                setDeliveredMessage(null);
              }
            }}
            className="bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-2xl border-0 hover:scale-105 transition-all duration-300 h-12 rounded-2xl"
          >
            Got it!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
