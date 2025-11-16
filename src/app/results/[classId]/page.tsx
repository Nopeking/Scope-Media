'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, ArrowRight, CheckCircle } from 'lucide-react';

interface StartlistEntry {
  id: string;
  rider_name: string;
  rider_id: string | null;
  fei_id: string | null;
  license: string | null;
  horse_name: string;
  team_name: string | null;
  club_name: string | null;
  is_handicap: boolean;
  country_code: string | null;
  start_order: number;
}

interface Score {
  id: string;
  startlist_id: string;
  round_number: number;
  time_taken: number | null;
  time_faults: number;
  jumping_faults: number;
  total_faults: number;
  status: string;
}

interface ClassData {
  id: string;
  class_name: string;
  status: string;
  class_rule: string;
  optimum_time: number | null;
  shows: {
    name: string;
  };
}

export default function ResultsPage() {
  const params = useParams();
  const classId = params.classId as string;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [startlist, setStartlist] = useState<StartlistEntry[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [classId]);

  const fetchData = async () => {
    try {
      // Fetch class data
      const classResponse = await fetch(`/api/classes/${classId}`);
      if (classResponse.ok) {
        const classInfo = await classResponse.json();
        setClassData(classInfo);
      }

      // Fetch startlist
      const startlistResponse = await fetch(`/api/startlist?class_id=${classId}`);
      if (startlistResponse.ok) {
        const startlistData = await startlistResponse.json();
        setStartlist(startlistData);
      }

      // Fetch scores
      const scoresResponse = await fetch(`/api/scores?class_id=${classId}&round_number=1`);
      if (scoresResponse.ok) {
        const scoresData = await scoresResponse.json();
        const scoresMap: Record<string, Score> = {};
        scoresData.forEach((score: Score) => {
          scoresMap[score.startlist_id] = score;
        });
        setScores(scoresMap);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeaderboard = () => {
    const scoredEntries = Object.values(scores)
      .filter((score) => score.status === 'completed')
      .map((score) => {
        const entry = startlist.find((e) => e.id === score.startlist_id);
        if (!entry) return null;
        return {
          ...entry,
          score,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Separate H/C and regular riders
    const regularRiders = scoredEntries.filter((item) => !item.is_handicap);
    const handicapRiders = scoredEntries.filter((item) => item.is_handicap);

    // Sort function based on class rule
    const sortRiders = (riders: typeof regularRiders) => {
      if (classData?.class_rule === 'optimum_time' && classData?.optimum_time) {
        // Optimum Time: Sort by (faults, abs(time - optimum_time), time)
        const optimumTime = classData.optimum_time;
        return riders.sort((a, b) => {
          // First: faults (ascending - lower faults first)
          if (a.score.total_faults !== b.score.total_faults) {
            return a.score.total_faults - b.score.total_faults;
          }
          // Second: absolute difference from optimum time (ascending - closest first)
          const timeA = a.score.time_taken || 999;
          const timeB = b.score.time_taken || 999;
          const diffA = Math.abs(timeA - optimumTime);
          const diffB = Math.abs(timeB - optimumTime);
          if (diffA !== diffB) {
            return diffA - diffB;
          }
          // Third: time as tiebreaker (ascending - faster first)
          return timeA - timeB;
        });
      } else {
        // Other class rules: Sort by faults first, then by time (fastest wins)
        return riders.sort((a, b) => {
          if (a.score.total_faults !== b.score.total_faults) {
            return a.score.total_faults - b.score.total_faults;
          }
          return (a.score.time_taken || 999) - (b.score.time_taken || 999);
        });
      }
    };

    // Sort regular riders
    const sortedRegular = sortRiders(regularRiders);

    // Sort H/C riders (they'll appear at bottom)
    const sortedHandicap = sortRiders(handicapRiders);

    // Return regular riders first, then H/C riders at bottom
    return [...sortedRegular, ...sortedHandicap];
  };

  const getNextRider = () => {
    // Find the first rider without a score
    return startlist.find((entry) => !scores[entry.id]);
  };

  const getRemainingRiders = () => {
    return startlist.filter((entry) => !scores[entry.id]);
  };

  const handleCompleteClass = async () => {
    if (!confirm('Are you sure you want to mark this class as completed?')) {
      return;
    }

    try {
      setCompleting(true);
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });

      if (response.ok) {
        const updatedClass = await response.json();
        setClassData(updatedClass);
        alert('Class marked as completed!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to complete class'}`);
      }
    } catch (error) {
      console.error('Error completing class:', error);
      alert('Error completing class');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">Loading Results...</div>
      </div>
    );
  }

  const leaderboard = getLeaderboard();
  const nextRider = getNextRider();
  const remainingRiders = getRemainingRiders();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            {classData?.class_name}
          </h1>
          <p className="text-xl text-gray-400 mb-4">{classData?.shows.name}</p>
          
          {/* Complete Class Button */}
          {classData && (
            <div className="flex items-center justify-center gap-4">
              {classData.status !== 'completed' && (
                <button
                  onClick={handleCompleteClass}
                  disabled={completing}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  <CheckCircle className="w-5 h-5" />
                  {completing ? 'Completing...' : 'Complete Class'}
                </button>
              )}
              {classData.status === 'completed' && (
                <span className="px-6 py-3 bg-green-600/20 border-2 border-green-500 rounded-lg text-green-400 flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  Class Completed
                </span>
              )}
            </div>
          )}
        </div>

        {/* Next Rider - Highlighted */}
        <AnimatePresence mode="wait">
          {nextRider && (
            <motion.div
              key={nextRider.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-8"
            >
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 border-4 border-yellow-400 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-yellow-400 text-gray-900 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold">
                      {nextRider.start_order}
                    </div>
                    <div>
                      <div className="text-sm text-yellow-200 mb-1">UP NEXT</div>
                      <div className="text-3xl md:text-4xl font-bold">{nextRider.rider_name}</div>
                      <div className="text-xl text-blue-200">{nextRider.horse_name}</div>
                      {nextRider.club_name && (
                        <div className="text-sm text-gray-300 mt-1">{nextRider.club_name}</div>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="w-16 h-16 text-yellow-400 animate-pulse" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Leaderboard */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Current Rankings
            </h2>
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 ? 'bg-yellow-500/30 border-2 border-yellow-400' :
                    index === 1 ? 'bg-gray-400/20 border-2 border-gray-300' :
                    index === 2 ? 'bg-orange-600/30 border-2 border-orange-400' :
                    'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold w-10">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                    </div>
                    <div>
                      <div className="font-bold text-lg">{entry.rider_name}</div>
                      <div className="text-sm text-gray-300">{entry.horse_name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-400">
                      {entry.score.total_faults} F
                    </div>
                    <div className="text-sm text-gray-300 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {entry.score.time_taken?.toFixed(2)}s
                    </div>
                  </div>
                </motion.div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No results yet
                </div>
              )}
            </div>
          </div>

          {/* Remaining Riders */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">
              Remaining Riders ({remainingRiders.length})
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {remainingRiders.slice(0, 20).map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    index === 0 ? 'bg-blue-500/20 border border-blue-400' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl font-bold text-gray-400 w-8">
                      {entry.start_order}
                    </div>
                    <div>
                      <div className="font-semibold">{entry.rider_name}</div>
                      <div className="text-sm text-gray-400">{entry.horse_name}</div>
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="text-xs bg-blue-500 px-2 py-1 rounded">
                      NEXT
                    </div>
                  )}
                </div>
              ))}
              {remainingRiders.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  All riders have completed
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-500 text-sm">
          Auto-refreshing every 3 seconds
        </div>
      </div>
    </div>
  );
}
