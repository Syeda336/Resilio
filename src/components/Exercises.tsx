import { useState } from 'react';
import { Dumbbell, Play, CheckCircle, Clock, Award, TrendingUp, X } from 'lucide-react';
import { logActivity } from '../utils/activityTracker';
import { exercisesAPI } from '../utils/exercisesAPI';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Exercise {
  id: string;
  name: string;
  icon: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  videoId: string;
}

interface ExercisesProps {
  userName: string;
  userId: string;
}

export function Exercises({ userName, userId }: ExercisesProps) {
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [activeSessions, setActiveSessions] = useState<Map<string, string>>(new Map());
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [exerciseTrackingIds, setExerciseTrackingIds] = useState<Map<string, string>>(new Map());

  const exercises: Exercise[] = [
    { 
      id: 'yoga', 
      name: 'Morning Yoga', 
      icon: 'https://images.unsplash.com/photo-1663412070733-e7d0031c53f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 
      duration: '15 min', 
      difficulty: 'Easy', 
      description: 'Gentle stretches to start your day',
      videoId: 'v7AYKMP6rOE' 
    },
    { 
      id: 'cardio', 
      name: 'Cardio Blast', 
      icon: 'https://images.unsplash.com/photo-1737736193172-f3b87a760ad5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 
      duration: '20 min', 
      difficulty: 'Hard', 
      description: 'High-intensity cardio workout',
      videoId: 'ml6cT4AZdqI'
    },
    { 
      id: 'strength', 
      name: 'Strength Training', 
      icon: 'https://images.unsplash.com/photo-1758738645033-e6aa84e4bfa5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 
      duration: '30 min', 
      difficulty: 'Medium', 
      description: 'Build muscle and strength',
      videoId: 'V09O2rwArjI' 
    },
    { 
      id: 'meditation', 
      name: 'Meditation', 
      icon: 'https://images.unsplash.com/photo-1641391400871-3a6578a11d5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 
      duration: '10 min', 
      difficulty: 'Easy', 
      description: 'Calm your mind and relax',
      videoId: 'inpok4MKVLM'
    },
    { 
      id: 'stretching', 
      name: 'Full Body Stretch', 
      icon: 'https://images.unsplash.com/photo-1574406280735-351fc1a7c5e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 
      duration: '12 min', 
      difficulty: 'Easy', 
      description: 'Improve flexibility',
      videoId: 'g_tea8ZNk5A'
    },
    { 
      id: 'hiit', 
      name: 'HIIT Workout', 
      icon: 'https://images.unsplash.com/photo-1739430548323-d3a55a714052?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 
      duration: '25 min', 
      difficulty: 'Hard', 
      description: 'Intense interval training',
      videoId: 'jp-G_8T911E'
    },
    { 
      id: 'pilates', 
      name: 'Pilates Core', 
      icon: 'https://images.unsplash.com/photo-1763403921315-f2ef8697199f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 
      duration: '20 min', 
      difficulty: 'Medium', 
      description: 'Strengthen your core muscles',
      videoId: 'cF_GnvOD52s' 
    },
    { 
      id: 'cycling', 
      name: 'Indoor Cycling', 
      icon: 'https://images.unsplash.com/photo-1635706055150-5827085ca635?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 
      duration: '15 min', 
      difficulty: 'Medium', 
      description: 'Low-impact cardio cycling',
      videoId: 'Pte7Jcp3IcQ' 
    },
    { 
      id: 'boxing', 
      name: 'Boxing Workout', 
      icon: 'https://images.unsplash.com/photo-1734191797121-de71b48ba038?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 
      duration: '25 min', 
      difficulty: 'Hard', 
      description: 'Cardio boxing and strength',
      videoId: 'KidSVNv0WcY'
    },
    { 
      id: 'swimming', 
      name: 'Swimming Session', 
      icon: 'https://images.unsplash.com/photo-1707365025743-23177fac01e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 
      duration: '40 min', 
      difficulty: 'Medium', 
      description: 'Full body water workout',
      videoId: 'xVeXGKPOH58'
    },
    { 
      id: 'taichi', 
      name: 'Tai Chi Flow', 
      icon: 'https://images.unsplash.com/photo-1600738769309-bf997d3cdba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 
      duration: '18 min', 
      difficulty: 'Easy', 
      description: 'Mindful movement and balance',
      videoId: 'vHBR5MZmEsY'
    },
    { 
      id: 'dance', 
      name: 'Dance Fitness', 
      icon: 'https://images.unsplash.com/photo-1759375201813-572504b6ba9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', 
      duration: '35 min', 
      difficulty: 'Medium', 
      description: 'Fun cardio dance workout',
      videoId: '1vRto-2MMZo'
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'from-teal-500 to-teal-600';
      case 'Medium': return 'from-purple-500 to-purple-600';
      case 'Hard': return 'from-rose-500 to-rose-600';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-teal-100 text-teal-700 border-teal-300';
      case 'Medium': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Hard': return 'bg-rose-100 text-rose-700 border-rose-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const handleStartExercise = async (exercise: Exercise) => {
    try {
      // Start tracking
      const { exerciseTracking } = await import('../utils/graphsTracking');
      const trackId = await exerciseTracking.start(exercise.name, exercise.videoId);
      setExerciseTrackingIds(new Map(exerciseTrackingIds).set(exercise.id, trackId));

      const sessionId = await exercisesAPI.startExercise(exercise.id);
      setActiveSessions(new Map(activeSessions).set(exercise.id, sessionId));
      // Don't log activity on start - only on completion
      setSelectedVideo(exercise.videoId);
    } catch (error) {
      console.error('Error starting exercise:', error);
    }
  };

  const handleCompleteExercise = async (exercise: Exercise) => {
    try {
      const trackId = exerciseTrackingIds.get(exercise.id);
      
      if (trackId) {
        // Complete tracking (no validation, all times count now)
        const { exerciseTracking } = await import('../utils/graphsTracking');
        await exerciseTracking.complete(trackId);
      }
      
      if (!completedExercises.includes(exercise.id)) {
        const sessionId = activeSessions.get(exercise.id);
        if (sessionId) {
          await exercisesAPI.update(sessionId, {
            completedAt: new Date().toISOString(),
            completed: true,
          });
        }
        setCompletedExercises([...completedExercises, exercise.id]);
        await logActivity('exercise', 'Completed Exercise', `${exercise.name} (${exercise.duration})`);
        alert(`✅ Great job! ${exercise.name} completed!`);
        
        // Refresh dashboard
        const { dashboardRefresh } = await import('../utils/dashboardRefresh');
        dashboardRefresh.trigger();
      }
    } catch (error) {
      console.error('Error completing exercise:', error);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-teal-50/30 min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 text-white px-4 md:px-8 py-8 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-teal-400 via-purple-400 to-rose-400"></div>
        <div className="absolute right-0 top-0 bottom-0 w-2 bg-gradient-to-b from-rose-400 via-purple-400 to-teal-400"></div>
        <div className="relative z-10 pl-14 md:pl-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/50">
              <Dumbbell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-white mb-1 font-bold text-2xl uppercase tracking-tight">Mind & Body Exercises</h1>
              <p className="text-indigo-100 text-sm">Strengthen your body and calm your mind</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-300" />
              <span className="text-white text-sm font-medium">{completedExercises.length} completed today</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Exercises Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {exercises.map((exercise, index) => {
              const isCompleted = completedExercises.includes(exercise.id);
              return (
                <div key={exercise.id} className="group relative">
                  <div className={`absolute top-0 bottom-0 ${index % 2 === 0 ? 'left-0' : 'right-0'} w-1 bg-gradient-to-b ${getDifficultyColor(exercise.difficulty)} rounded-full`}></div>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 h-full flex flex-col border border-slate-100 dark:border-slate-700">
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback
                        src={exercise.icon}
                        alt={exercise.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyBadge(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </div>
                      {isCompleted && (
                        <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-slate-900 dark:text-white mb-2 font-bold text-lg">{exercise.name}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 flex-1">{exercise.description}</p>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartExercise(exercise)}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${getDifficultyColor(exercise.difficulty)} text-white rounded-xl hover:shadow-xl transition-all font-bold`}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Start
                        </button>
                        {!isCompleted && (
                          <button
                            onClick={() => handleCompleteExercise(exercise)}
                            className="px-4 py-3 border-2 border-teal-500 text-teal-600 rounded-xl hover:bg-teal-50 transition-all"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* VIDEO PLAYER MODAL */}
      {selectedVideo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <button 
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&rel=0&showinfo=0&enablejsapi=1`}
                title="Exercise Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}