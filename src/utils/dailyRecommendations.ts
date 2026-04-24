// Parse Daily Recommendations CSV and get random recommendation

export interface DailyRecommendation {
  id: number;
  text: string;
}

// All recommendations from CSV (skipping header line)
const recommendations: string[] = [
  "Drink a glass of water now and aim for 8 glasses today.",
  "Roll your shoulders back and sit up straight for the next 10 minutes.",
  "Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain.",
  "Stand up and try to touch your toes for 30 seconds to wake up your hamstrings.",
  "Spend at least 10 minutes outdoors today to get some natural Vitamin D.",
  "Skip the elevator today and take the stairs instead.",
  "Turn off all notifications for 1 hour this evening to give your brain a break.",
  "Write down three small things that made you smile today.",
  "Take 5 deep breaths—inhale for 4 seconds, hold for 4, and exhale for 6.",
  "Send a quick \"thank you\" or \"thinking of you\" message to a friend or colleague.",
  "Spend 5 minutes writing down everything on your mind to clear mental clutter.",
  "Focus on doing just one thing at a time for the next hour—no multitasking!",
  "Eat one meal today without using your phone or watching TV.",
  "Replace one sugary snack or drink today with a piece of fruit or plain water.",
  "Move your phone away from your bed tonight to improve your sleep quality.",
  "Prepare your clothes or a healthy lunch for tomorrow tonight to reduce morning stress.",
  "Listen to one of your favorite upbeat songs to boost your mood instantly.",
  "Clear your physical workspace of any trash or unnecessary papers.",
  "Try a 1-minute plank to engage your core muscles.",
  "Take a cold shower or splash cold water on your face to increase alertness.",
  "Write a positive sticky note for yourself and put it on your mirror.",
  "Walk while you are on your next phone call instead of sitting down.",
  "Avoid caffeine at least 6 hours before your planned bedtime.",
  "Learn one new word today and try to use it in a sentence.",
  "Spend 2 minutes practicing a \"power pose\" to boost your confidence.",
  "Do 15 jumping jacks to get your heart rate up quickly.",
  "Identify one thing you are worried about and decide if it will matter in 5 years.",
  "Stretch your neck gently by tilting your head side to side for 1 minute.",
  "Unsubscribe from one junk email or newsletter that litters your inbox.",
  "Try eating a high-protein breakfast to keep your energy stable all morning.",
  "Sit in silence for 3 minutes without any music, phone, or distractions.",
  "Compliment a stranger or a loved one sincerely today.",
  "Practice \"Box Breathing\": Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s.",
  "Read at least 5 pages of a physical book before going to sleep.",
  "Wash your hands and face with cool water as a \"reset\" during a stressful task.",
  "Do a quick 2-minute tidy-up of the room you are currently in.",
  "Check your jaw right now; if it's clenched, relax it and let your teeth part.",
  "Try a \"Meatless Monday\" or just one plant-based meal today.",
  "Park your car further away than usual to get some extra steps in.",
  "Spend 5 minutes stretching your wrists and fingers if you've been typing a lot.",
  "Take a 10-minute walk without your phone to clear your head.",
  "Drink a glass of water immediately after waking up tomorrow morning.",
  "Do 10 air squats right now to pump some blood to your legs.",
  "Write down one goal you want to achieve by the end of this week.",
  "Clean your phone screen with a microfiber cloth to remove germs and smudges.",
  "Replace your afternoon coffee with a cup of herbal tea or warm lemon water.",
  "Spend 2 minutes stretching your neck and upper back to release tension.",
  "Unsubscribe from one YouTube channel or social media account that makes you feel negative.",
  "Try a 1-minute plank challenge to strengthen your core.",
  "Eat a handful of nuts or seeds instead of a processed snack today.",
  "Listen to a 5-minute guided meditation before starting your work.",
  "Leave your phone in another room while you eat your dinner.",
  "Do 20 jumping jacks to instantly boost your heart rate and energy.",
  "Write a \"Thank You\" note to someone who helped you recently.",
  "Take 3 slow, deep breaths every time you open a new tab on your browser.",
  "Organize one drawer in your desk or kitchen that has become messy.",
  "Spend 5 minutes sitting in silence and just observing your thoughts.",
  "Avoid looking at any screens for the first 30 minutes of your day.",
  "Try balancing on one leg for 30 seconds, then switch to the other.",
  "Add one extra serving of green vegetables to your dinner tonight.",
  "Think of one thing you are proud of yourself for accomplishing this month.",
  "Stretch your wrists and forearms for 2 minutes if you've been typing a lot.",
  "Set a reminder to stand up and move every hour during your work shift.",
  "Smile at yourself in the mirror for 10 seconds to trigger \"feel-good\" hormones.",
  "Dim the lights in your house an hour before you plan to sleep.",
  "Identify one task you've been procrastinating on and work on it for just 5 minutes.",
  "Go for a quick jog or a brisk walk around the block.",
  "Try a \"no-spend day\" today—avoid buying anything that isn't a necessity.",
  "Spend 5 minutes looking out of a window at the sky or trees.",
  "Do 15 push-ups (on your knees if needed) to build upper body strength.",
  "Prepare your outfit for tomorrow morning to make your start easier.",
  "Read three pages of a book instead of scrolling through social media.",
  "Keep your water bottle in sight at all times today to remind you to drink.",
  "Give someone a sincere compliment today, even if it's a stranger.",
  "Take a cold shower to improve your circulation and wake up your senses.",
  "Declutter your digital desktop by deleting files you no longer need.",
  "Spend 10 minutes practicing a hobby you enjoy but haven't done lately.",
  "Before sleeping, visualize one positive thing you want to happen tomorrow.",
  "Write down one thing you are looking forward to this week.",
  "Do 20 standing calf raises while waiting for your water to boil or food to heat up.",
  "Take a deep breath and consciously relax your shoulders away from your ears.",
  "Clear your browser history and close all tabs you aren't currently using.",
  "Spend 5 minutes stretching your lower back to relieve sitting tension.",
  "Eat a piece of fruit before you reach for any processed sweets today.",
  "Try to memorize a short poem or a famous quote today.",
  "Spend 10 minutes tidying up your digital photo gallery and deleting blurry shots.",
  "Go for a 5-minute walk outside as soon as you finish your work or study session.",
  "Replace your scrolling time with 10 minutes of light reading today.",
  "Practice \"alternate nostril breathing\" for 2 minutes to balance your energy.",
  "Do 10 slow lunges on each leg to build lower body stability.",
  "Reflect on one mistake you made recently and what it taught you.",
  "Try a 30-second cold rinse at the end of your shower today.",
  "Organize your desktop icons so you can see your wallpaper clearly.",
  "Spend 5 minutes sitting on the floor to improve your hip mobility.",
  "Avoid looking at your phone for at least 30 minutes after you wake up.",
  "Write a short positive review for a small business or app you enjoy.",
  "Take 10 slow, mindful sips of your next glass of water.",
];

// Get today's date in YYYY-MM-DD format
function getTodayString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Get a random recommendation
function getRandomRecommendation(): DailyRecommendation {
  const randomIndex = Math.floor(Math.random() * recommendations.length);
  return {
    id: randomIndex + 1,
    text: recommendations[randomIndex]
  };
}

// Get daily recommendation for a specific user (user-specific)
export async function getDailyRecommendation(
  userId: string, 
  accessToken: string, 
  projectId: string,
  publicAnonKey: string
): Promise<DailyRecommendation> {
  const today = getTodayString();
  const kvKey = `user_recommendation_${userId}_${today}`;
  
  try {
    // Check if user has a recommendation for today from backend KV store
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/kv/${kvKey}`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
        }
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      if (data && data.value) {
        // User already has a recommendation for today
        console.log('📖 Existing recommendation found for user:', userId);
        return JSON.parse(data.value);
      }
    }

    // No recommendation for today, generate a new one
    const newRecommendation = getRandomRecommendation();
    
    // Save to backend KV store
    const saveResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-40d4d8fd/kv/${kvKey}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: JSON.stringify(newRecommendation) })
      }
    );

    if (saveResponse.ok) {
      console.log('💾 New recommendation saved for user:', userId);
    } else {
      console.error('Failed to save recommendation');
      // Continue anyway - we still have the recommendation
    }

    return newRecommendation;
    
  } catch (error) {
    console.error('Error fetching/saving daily recommendation:', error);
    // Fallback to random recommendation
    return getRandomRecommendation();
  }
}

// Cleanup old recommendations (optional - can be called periodically)
export async function cleanupOldRecommendations(
  accessToken: string,
  projectId: string,
  publicAnonKey: string,
  daysToKeep: number = 7
): Promise<void> {
  // Note: KV store cleanup would require backend implementation
  // For now, recommendations will accumulate but use minimal storage
  try {
    console.log('🧹 Recommendation cleanup (KV store - no action needed)');
  } catch (error) {
    console.error('Error cleaning up old recommendations:', error);
  }
}