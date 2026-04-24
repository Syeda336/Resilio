import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Trash2, Search, Calendar, Clock } from 'lucide-react';
import { JournalEntry } from '../App';
import { format } from 'date-fns';

interface JournalEntriesProps {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
}

export function JournalEntries({ entries, onDelete }: JournalEntriesProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter(entry => {
    const contentText = entry.content.replace(/<[^>]*>/g, '');
    return contentText.toLowerCase().includes(searchQuery.toLowerCase()) ||
           entry.mood.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card className="p-6 bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/20 rounded-3xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-300 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search entries by content or mood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 focus:ring-emerald-400 focus:border-emerald-400/50 rounded-2xl h-12 shadow-lg"
          />
        </div>
      </Card>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card className="p-16 bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/20 rounded-3xl">
            <div className="text-center text-white/70">
              {searchQuery ? (
                <p>No entries found matching "{searchQuery}"</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xl">No journal entries yet.</p>
                  <p>Start writing your first entry in the Write tab!</p>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-5">
              {filteredEntries.map((entry) => (
                <Card
                  key={entry.id}
                  className="p-8 bg-white/10 backdrop-blur-2xl shadow-2xl border border-white/20 hover:shadow-emerald-500/20 transition-all hover:scale-[1.02] duration-300 rounded-3xl group"
                >
                  {/* Entry Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-2xl border border-white/30 shadow-lg">
                        <span className="text-5xl">{entry.moodEmoji}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-4 py-2 bg-gradient-to-br from-emerald-500/30 to-green-500/30 backdrop-blur-sm rounded-xl border border-white/30 text-white shadow-lg">
                            {entry.mood}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-white/70">
                          <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(entry.date), 'MMMM dd, yyyy')}
                          </span>
                          <span className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg">
                            <Clock className="w-4 h-4" />
                            {format(new Date(entry.date), 'hh:mm a')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
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
                          <AlertDialogTitle className="text-white">Delete Entry?</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/70">
                            This action cannot be undone. This entry will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDelete(entry.id)}
                            className="bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 shadow-xl"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Entry Content */}
                  <div
                    className="prose prose-invert max-w-none text-white/90 prose-headings:text-white prose-strong:text-emerald-300 prose-em:text-green-300"
                    dangerouslySetInnerHTML={{ __html: entry.content }}
                  />
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
