'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Users, ChevronRight, Timer } from 'lucide-react';

interface StartlistEntry {
  id: string;
  rider_name: string;
  horse_name: string;
  team_name: string | null;
  club_name: string | null;
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
  points: number;
  status: string;
}

interface ClassData {
  id: string;
  class_name: string;
  class_rule: string;
  time_allowed: number | null;
  time_allowed_round2: number | null;
  optimum_time: number | null;
  status: string;
  shows: {
    name: string;
  };
}

const STATUS_LABELS: Record<string, string> = {
  eliminated: 'ELIMINATED',
  retired: 'RETIRED',
  withdrawn: 'WITHDRAWN',
  canceled: 'CANCELED',
  completed: 'COMPLETED',
};

export default function DisplayPage() {
  const params = useParams();
  const classId = params.classId as string;

  const [classData, setClassData] = useState<ClassData | null>(null);
  const [startlist, setStartlist] = useState<StartlistEntry[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLive = classData?.status === 'in_progress';
  const isAccumulator = classData?.class_rule === 'accumulator';

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
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

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const getLeaderboard = () => {
    const leaderboard = Object.values(scores)
      .map((score) => {
        const entry = startlist.find((e) => e.id === score.startlist_id);
        if (!entry) return null;
        return {
          ...entry,
          score,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    // Separate completed and non-completed riders
    const completedRiders = leaderboard.filter(item => item.score.status === 'completed');
    const nonCompletedRiders = leaderboard.filter(item => item.score.status !== 'completed');

    // Sort completed riders
    if (isAccumulator) {
      completedRiders.sort((a, b) => {
        const pointsA = a.score.points || 0;
        const pointsB = b.score.points || 0;
        if (pointsA !== pointsB) {
          return pointsB - pointsA;
        }
        return (a.score.time_taken || 999) - (b.score.time_taken || 999);
      });
    } else if (classData?.class_rule === 'optimum_time' && classData?.optimum_time) {
      const optimumTime = classData.optimum_time;
      completedRiders.sort((a, b) => {
        if (a.score.total_faults !== b.score.total_faults) {
          return a.score.total_faults - b.score.total_faults;
        }
        const timeA = a.score.time_taken || 999;
        const timeB = b.score.time_taken || 999;
        const diffA = Math.abs(timeA - optimumTime);
        const diffB = Math.abs(timeB - optimumTime);
        if (diffA !== diffB) {
          return diffA - diffB;
        }
        return timeA - timeB;
      });
    } else {
      completedRiders.sort((a, b) => {
        if (a.score.total_faults !== b.score.total_faults) {
          return a.score.total_faults - b.score.total_faults;
        }
        return (a.score.time_taken || 999) - (b.score.time_taken || 999);
      });
    }

    return [...completedRiders, ...nonCompletedRiders];
  };

  const getLastRider = () => {
    // Find the most recent completed rider
    const completedScores = Object.values(scores)
      .filter((score) => score.status === 'completed')
      .sort((a, b) => {
        const entryA = startlist.find((e) => e.id === a.startlist_id);
        const entryB = startlist.find((e) => e.id === b.startlist_id);
        return (entryB?.start_order || 0) - (entryA?.start_order || 0);
      });

    if (completedScores.length === 0) return null;
    const lastScore = completedScores[0];
    const entry = startlist.find((e) => e.id === lastScore.startlist_id);
    return entry ? { ...entry, score: lastScore } : null;
  };

  const getNextRider = () => {
    // Find the first rider without a score
    return startlist.find((entry) => !scores[entry.id]);
  };

  const getRemainingRiders = () => {
    const totalRiders = startlist.length;
    const ridersWithScores = Object.values(scores).length;
    return totalRiders - ridersWithScores;
  };

  const leaderboard = getLeaderboard();
  const lastRider = getLastRider();
  const nextRider = getNextRider();
  const remainingRiders = getRemainingRiders();

  // Auto-scroll leaderboard
  useEffect(() => {
    if (leaderboard.length > 10) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const maxIndex = Math.max(0, leaderboard.length - 10);
          return prev >= maxIndex ? 0 : prev + 1;
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [leaderboard.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-4xl font-bold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Class Details - Fixed */}
      <div className="bg-black/40 backdrop-blur-md border-b-4 border-purple-500 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{classData?.class_name}</h1>
              <p className="text-lg md:text-2xl text-purple-300">{classData?.shows.name}</p>
            </div>
            <div className="flex flex-wrap gap-4 md:gap-8 text-sm md:text-xl">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 md:w-7 md:h-7" />
                <div>
                  <div className="text-gray-400 text-xs md:text-sm">Total Riders</div>
                  <div className="font-bold text-xl md:text-3xl">{startlist.length}</div>
                </div>
              </div>
              {classData?.time_allowed && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 md:w-7 md:h-7" />
                  <div>
                    <div className="text-gray-400 text-xs md:text-sm">Time Allowed</div>
                    <div className="font-bold text-xl md:text-3xl">{classData.time_allowed}s</div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 md:w-7 md:h-7" />
                <div>
                  <div className="text-gray-400 text-xs md:text-sm">Class Rule</div>
                  <div className="font-bold text-sm md:text-lg uppercase">
                    {classData?.class_rule.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Info - Fixed (only for in_progress classes) */}
      {isLive && (
        <div className="bg-black/20 backdrop-blur-sm border-b-2 border-purple-400 p-4 md:p-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Last Rider */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-blue-600/30 to-blue-800/30 rounded-2xl p-4 md:p-6 border border-blue-400/50"
            >
              <div className="text-xs md:text-sm text-blue-300 mb-2 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                LAST RIDER
              </div>
              {lastRider ? (
                <>
                  <div className="font-bold text-lg md:text-2xl mb-1">{lastRider.rider_name}</div>
                  <div className="text-sm md:text-lg text-gray-300 mb-3">{lastRider.horse_name}</div>
                  <div className="flex items-center gap-4 text-xl md:text-3xl font-bold">
                    {lastRider.score.status !== 'completed' ? (
                      <span className="text-red-400 text-sm md:text-lg uppercase">
                        {STATUS_LABELS[lastRider.score.status] || lastRider.score.status}
                      </span>
                    ) : isAccumulator ? (
                      <>
                        <span className="text-green-400">{lastRider.score.points} pts</span>
                        <span className="text-gray-400 text-lg md:text-2xl">
                          {lastRider.score.time_taken?.toFixed(2)}s
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-yellow-400">{lastRider.score.total_faults} F</span>
                        <span className="text-gray-400 text-lg md:text-2xl">
                          {lastRider.score.time_taken?.toFixed(2)}s
                        </span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-sm md:text-lg">No completed riders yet</div>
              )}
            </motion.div>

            {/* Next Rider */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-600/30 to-green-800/30 rounded-2xl p-4 md:p-6 border border-green-400/50"
            >
              <div className="text-xs md:text-sm text-green-300 mb-2 flex items-center gap-2">
                <ChevronRight className="w-4 h-4" />
                NEXT RIDER
              </div>
              {nextRider ? (
                <>
                  <div className="font-bold text-lg md:text-2xl mb-1">{nextRider.rider_name}</div>
                  <div className="text-sm md:text-lg text-gray-300 mb-3">{nextRider.horse_name}</div>
                  <div className="text-3xl md:text-5xl font-bold text-green-400">
                    #{nextRider.start_order}
                  </div>
                </>
              ) : (
                <div className="text-gray-400 text-sm md:text-lg">All riders competed</div>
              )}
            </motion.div>

            {/* Remaining Riders */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-r from-purple-600/30 to-purple-800/30 rounded-2xl p-4 md:p-6 border border-purple-400/50"
            >
              <div className="text-xs md:text-sm text-purple-300 mb-2 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                REMAINING RIDERS
              </div>
              <div className="text-5xl md:text-7xl font-bold text-purple-400">
                {remainingRiders}
              </div>
              <div className="text-xs md:text-sm text-gray-400 mt-2">
                out of {startlist.length} riders
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Rankings - Scrollable */}
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-black/40 backdrop-blur-md rounded-3xl border-2 border-purple-500 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 md:p-6">
              <h2 className="text-2xl md:text-4xl font-bold flex items-center gap-3">
                <Trophy className="w-8 h-8 md:w-12 md:h-12 text-yellow-400" />
                Current Rankings
              </h2>
            </div>

            {/* Leaderboard */}
            <div className="p-4 md:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-3 md:space-y-4"
                >
                  {leaderboard.slice(currentIndex, currentIndex + 10).map((entry, index) => {
                    const actualIndex = currentIndex + index;
                    const isTop3 = actualIndex < 3;
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 md:gap-6 p-4 md:p-6 rounded-2xl ${
                          actualIndex === 0
                            ? 'bg-gradient-to-r from-yellow-600/40 to-yellow-800/40 border-2 border-yellow-400'
                            : actualIndex === 1
                            ? 'bg-gradient-to-r from-gray-400/40 to-gray-600/40 border-2 border-gray-400'
                            : actualIndex === 2
                            ? 'bg-gradient-to-r from-orange-600/40 to-orange-800/40 border-2 border-orange-400'
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        {/* Rank */}
                        <div className={`${isTop3 ? 'text-4xl md:text-6xl' : 'text-2xl md:text-4xl'} font-bold w-16 md:w-24 text-center`}>
                          {actualIndex === 0 ? '🥇' : actualIndex === 1 ? '🥈' : actualIndex === 2 ? '🥉' : `#${actualIndex + 1}`}
                        </div>

                        {/* Rider Info */}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xl md:text-3xl truncate">{entry.rider_name}</div>
                          <div className="text-sm md:text-xl text-gray-300 truncate">{entry.horse_name}</div>
                          {entry.club_name && (
                            <div className="text-xs md:text-sm text-gray-400 truncate">{entry.club_name}</div>
                          )}
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          {entry.score.status !== 'completed' ? (
                            <div className={`text-lg md:text-2xl font-bold uppercase ${
                              entry.score.status === 'eliminated' ? 'text-red-400' :
                              entry.score.status === 'retired' ? 'text-orange-400' :
                              entry.score.status === 'withdrawn' ? 'text-gray-400' :
                              entry.score.status === 'canceled' ? 'text-red-500' :
                              'text-gray-400'
                            }`}>
                              {STATUS_LABELS[entry.score.status] || entry.score.status}
                            </div>
                          ) : isAccumulator ? (
                            <>
                              <div className="text-3xl md:text-5xl font-bold text-green-400">
                                {entry.score.points} <span className="text-xl md:text-3xl">pts</span>
                              </div>
                              <div className="text-sm md:text-xl text-gray-400">
                                {entry.score.time_taken?.toFixed(2)}s
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-3xl md:text-5xl font-bold text-yellow-400">
                                {entry.score.total_faults} <span className="text-xl md:text-3xl">F</span>
                              </div>
                              <div className="text-sm md:text-xl text-gray-400">
                                {entry.score.time_taken?.toFixed(2)}s
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>

              {/* Scroll Indicator */}
              {leaderboard.length > 10 && (
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: Math.ceil(leaderboard.length / 10) }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                        Math.floor(currentIndex / 10) === i ? 'bg-purple-400 w-6 md:w-8' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
