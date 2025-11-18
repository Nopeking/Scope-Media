'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, RefreshCw, Trophy, Clock, Save, Settings, AlertCircle, CheckCircle } from 'lucide-react';

interface StartlistEntry {
  id: string;
  rider_name: string;
  rider_id: string;
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
  rank: number | null;
  notes: string | null;
}

interface ClassData {
  id: string;
  class_name: string;
  class_rule: string;
  time_allowed: number | null;
  time_allowed_round2: number | null;
  optimum_time: number | null;
  scoring_password: string | null;
  shows: {
    name: string;
  };
}

const STATUS_OPTIONS = [
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'retired', label: 'Retired', color: 'orange' },
  { value: 'eliminated', label: 'Eliminated', color: 'red' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'gray' },
  { value: 'canceled', label: 'Canceled', color: 'red' },
];

export default function PublicScoringPage() {
  const params = useParams();
  const classId = params.classId as string;

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [startlist, setStartlist] = useState<StartlistEntry[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Local time allowed state (can be updated before scoring)
  const [timeAllowed, setTimeAllowed] = useState<string>('');
  const [timeAllowedRound2, setTimeAllowedRound2] = useState<string>('');

  // Check if this is a two-phase class
  const isTwoPhase = classData?.class_rule === 'two_phases' || classData?.class_rule === 'special_two_phases';
  const isRegularTwoPhase = classData?.class_rule === 'two_phases';
  const isSpecialTwoPhase = classData?.class_rule === 'special_two_phases';

  // Check if this is an accumulator class
  const isAccumulator = classData?.class_rule === 'accumulator';

  // Scoring form state for each rider
  const [scoringData, setScoringData] = useState<Record<string, {
    time_taken: string;
    jumping_faults: string;
    time_faults: string;
    points: string; // For accumulator class
    status: string;
    notes: string;
    // Phase 2 data (for two-phase classes)
    time_taken_phase2: string;
    jumping_faults_phase2: string;
    time_faults_phase2: string;
  }>>({});

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  useEffect(() => {
    if (authenticated && classData) {
      fetchScoringData();
      const interval = setInterval(fetchScoringData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [authenticated, classData]);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/classes/${classId}`);
      if (response.ok) {
        const data = await response.json();
        setClassData(data);
        setTimeAllowed(data.time_allowed?.toString() || '');
        setTimeAllowedRound2(data.time_allowed_round2?.toString() || '');

        // If no password is set, allow access
        if (!data.scoring_password || data.scoring_password.trim() === '') {
          setAuthenticated(true);
        }
      } else {
        console.error('Failed to fetch class data');
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScoringData = async () => {
    try {
      setRefreshing(true);

      // Fetch startlist
      const startlistResponse = await fetch(`/api/startlist?class_id=${classId}`);
      if (startlistResponse.ok) {
        const startlistData = await startlistResponse.json();
        setStartlist(startlistData);
      }

      // For two-phase classes, fetch both rounds
      if (isTwoPhase) {
        // Fetch Phase 1 (round 1)
        const response1 = await fetch(`/api/scores?class_id=${classId}&round_number=1`);
        // Fetch Phase 2 (round 2)
        const response2 = await fetch(`/api/scores?class_id=${classId}&round_number=2`);

        const scoresMap: Record<string, Score> = {};
        const newScoringData: Record<string, any> = {};

        // Process Phase 1 data
        if (response1.ok) {
          const data1 = await response1.json();
          data1.forEach((score: Score) => {
            scoresMap[score.startlist_id] = score;
            newScoringData[score.startlist_id] = {
              time_taken: score.time_taken != null ? score.time_taken.toString() : '',
              jumping_faults: score.jumping_faults != null ? score.jumping_faults.toString() : '0',
              time_faults: score.time_faults != null ? score.time_faults.toString() : '0',
              status: score.status || 'completed',
              notes: score.notes != null ? score.notes : '',
              time_taken_phase2: '',
              jumping_faults_phase2: '0',
              time_faults_phase2: '0',
            };
          });
        }

        // Process Phase 2 data
        if (response2.ok) {
          const data2 = await response2.json();
          data2.forEach((score: Score) => {
            if (newScoringData[score.startlist_id]) {
              newScoringData[score.startlist_id].time_taken_phase2 = score.time_taken != null ? score.time_taken.toString() : '';
              newScoringData[score.startlist_id].jumping_faults_phase2 = score.jumping_faults != null ? score.jumping_faults.toString() : '0';
              newScoringData[score.startlist_id].time_faults_phase2 = score.time_faults != null ? score.time_faults.toString() : '0';
            }
          });
        }

        setScores(scoresMap);

        if (Object.keys(newScoringData).length > 0) {
          setScoringData((prev) => ({
            ...prev,
            ...newScoringData,
          }));
        }
      } else {
        // For non-two-phase classes, fetch round 1
        const scoresResponse = await fetch(`/api/scores?class_id=${classId}&round_number=1`);
        if (scoresResponse.ok) {
          const scoresData = await scoresResponse.json();
          const scoresMap: Record<string, Score> = {};
          const newScoringData: Record<string, any> = {};

          scoresData.forEach((score: Score) => {
            scoresMap[score.startlist_id] = score;
            newScoringData[score.startlist_id] = {
              time_taken: score.time_taken != null ? score.time_taken.toString() : '',
              jumping_faults: score.jumping_faults != null ? score.jumping_faults.toString() : '0',
              time_faults: score.time_faults != null ? score.time_faults.toString() : '0',
              points: score.points != null ? score.points.toString() : '',
              status: score.status || 'completed',
              notes: score.notes != null ? score.notes : '',
            };
          });

          setScores(scoresMap);

          if (Object.keys(newScoringData).length > 0) {
            setScoringData((prev) => ({
              ...prev,
              ...newScoringData,
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching scoring data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!classData?.scoring_password) {
      setAuthenticated(true);
      return;
    }

    if (password === classData.scoring_password) {
      setAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
    }
  };

  const handleUpdateTimeAllowed = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          time_allowed: timeAllowed ? parseInt(timeAllowed) : null,
          time_allowed_round2: timeAllowedRound2 ? parseInt(timeAllowedRound2) : null,
        }),
      });

      if (response.ok) {
        await fetchClassData();
        alert('Time allowed updated successfully!');
        setShowSettings(false);
      } else {
        alert('Failed to update time allowed');
      }
    } catch (error) {
      console.error('Error updating time allowed:', error);
      alert('Error updating time allowed');
    }
  };

  const calculateTimeFaults = (timeTaken: number, timeAllowed: number) => {
    const overtime = timeTaken - timeAllowed;
    if (overtime <= 0) return 0;
    return Math.ceil(overtime);
  };

  const handleSaveScore = async (startlistId: string) => {
    const data = scoringData[startlistId];
    if (!data) return;

    try {
      if (isTwoPhase) {
        // For two-phase classes, save both phases
        // Phase 1
        const timeTaken1 = parseFloat(data.time_taken) || null;
        const jumpingFaults1 = parseInt(data.jumping_faults) || 0;
        const timeFaults1 = classData?.time_allowed && timeTaken1
          ? calculateTimeFaults(timeTaken1, classData.time_allowed)
          : parseInt(data.time_faults) || 0;
        const totalFaults1 = jumpingFaults1 + timeFaults1;

        const scoreData1 = {
          startlist_id: startlistId,
          class_id: classId,
          round_number: 1,
          time_taken: timeTaken1,
          jumping_faults: jumpingFaults1,
          time_faults: timeFaults1,
          total_faults: totalFaults1,
          status: data.status,
          notes: data.notes || null,
        };

        // Phase 2
        const timeTaken2 = parseFloat(data.time_taken_phase2) || null;
        const jumpingFaults2 = parseInt(data.jumping_faults_phase2) || 0;
        const timeFaults2 = classData?.time_allowed_round2 && timeTaken2
          ? calculateTimeFaults(timeTaken2, classData.time_allowed_round2)
          : parseInt(data.time_faults_phase2) || 0;
        const totalFaults2 = jumpingFaults2 + timeFaults2;

        const scoreData2 = {
          startlist_id: startlistId,
          class_id: classId,
          round_number: 2,
          time_taken: timeTaken2,
          jumping_faults: jumpingFaults2,
          time_faults: timeFaults2,
          total_faults: totalFaults2,
          status: data.status,
          notes: data.notes || null,
        };

        // Save Phase 1
        const response1 = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scoreData1),
        });

        // Save Phase 2 if time is entered
        if (timeTaken2 !== null) {
          const response2 = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scoreData2),
          });
        }

        if (response1.ok) {
          await fetchScoringData();
          alert('Two-phase score saved successfully!');
        }
      } else if (isAccumulator) {
        // For accumulator class
        const timeTaken = parseFloat(data.time_taken) || null;
        let points = parseInt(data.points) || 0;

        // Apply time penalty if time exceeded
        if (classData?.time_allowed && timeTaken) {
          const overtime = timeTaken - classData.time_allowed;
          if (overtime > 0) {
            // Deduct 1 point per second over time allowed (can go negative)
            points = points - Math.ceil(overtime);
          }
        }

        const scoreData = {
          startlist_id: startlistId,
          class_id: classId,
          round_number: 1,
          time_taken: timeTaken,
          points: points,
          jumping_faults: 0,
          time_faults: 0,
          total_faults: 0,
          status: data.status,
          notes: data.notes || null,
        };

        const existingScore = scores[startlistId];

        if (existingScore) {
          // Update existing score
          const response = await fetch(`/api/scores?id=${existingScore.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scoreData),
          });

          if (response.ok) {
            await fetchScoringData();
            alert('Accumulator score updated successfully!');
          }
        } else {
          // Create new score
          const response = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scoreData),
          });

          if (response.ok) {
            await fetchScoringData();
            alert('Accumulator score saved successfully!');
          }
        }
      } else {
        // For non-two-phase classes, save single round
        const timeTaken = parseFloat(data.time_taken) || null;
        const jumpingFaults = parseInt(data.jumping_faults) || 0;

        const currentTimeAllowed = classData?.time_allowed;
        const timeFaults = currentTimeAllowed && timeTaken
          ? calculateTimeFaults(timeTaken, currentTimeAllowed)
          : parseInt(data.time_faults) || 0;
        const totalFaults = jumpingFaults + timeFaults;

        const scoreData = {
          startlist_id: startlistId,
          class_id: classId,
          round_number: 1,
          time_taken: timeTaken,
          jumping_faults: jumpingFaults,
          time_faults: timeFaults,
          total_faults: totalFaults,
          status: data.status,
          notes: data.notes || null,
        };

        const existingScore = scores[startlistId];

        if (existingScore) {
          // Update existing score
          const response = await fetch(`/api/scores?id=${existingScore.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scoreData),
          });

          if (response.ok) {
            await fetchScoringData();
            alert('Score updated successfully!');
          }
        } else {
          // Create new score
          const response = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scoreData),
          });

          if (response.ok) {
            await fetchScoringData();
            alert('Score saved successfully!');
          }
        }
      }
    } catch (error) {
      console.error('Error saving score:', error);
      alert('Error saving score');
    }
  };

  const handleInputChange = (
    startlistId: string,
    field: string,
    value: string
  ) => {
    setScoringData((prev) => {
      const defaultData = {
        time_taken: '',
        jumping_faults: '0',
        time_faults: '0',
        points: '',
        status: 'completed',
        notes: '',
        time_taken_phase2: '',
        jumping_faults_phase2: '0',
        time_faults_phase2: '0',
      };
      return {
        ...prev,
        [startlistId]: {
          ...defaultData,
          ...prev[startlistId],
          [field]: value || '',
        },
      };
    });
  };

  const getLeaderboard = () => {
    const leaderboard = Object.values(scores)
      .map((score) => {
        const entry = startlist.find((e) => e.id === score.startlist_id);
        return {
          startlist_id: score.startlist_id,
          rider_name: entry?.rider_name || '',
          horse_name: entry?.horse_name || '',
          club_name: entry?.club_name || '',
          total_faults: score.total_faults,
          points: score.points,
          time_taken: score.time_taken,
          status: score.status,
        };
      });

    // Separate completed and non-completed riders
    const completedRiders = leaderboard.filter(entry => entry.status === 'completed');
    const nonCompletedRiders = leaderboard.filter(entry => entry.status !== 'completed');

    // Sort based on class rule
    if (isAccumulator) {
      // Accumulator: Sort by points (descending - higher points first), then by time (ascending - faster first)
      completedRiders.sort((a, b) => {
        if (a.points !== b.points) {
          return b.points - a.points; // Descending
        }
        return (a.time_taken || 999) - (b.time_taken || 999); // Ascending
      });
    } else if (classData?.class_rule === 'optimum_time' && classData?.optimum_time) {
      const optimumTime = classData.optimum_time;
      // Optimum Time: Sort by (faults, abs(time - optimum_time), time)
      completedRiders.sort((a, b) => {
        // First: faults (ascending - lower faults first)
        if (a.total_faults !== b.total_faults) {
          return a.total_faults - b.total_faults;
        }
        // Second: absolute difference from optimum time (ascending - closest first)
        const timeA = a.time_taken || 999;
        const timeB = b.time_taken || 999;
        const diffA = Math.abs(timeA - optimumTime);
        const diffB = Math.abs(timeB - optimumTime);
        if (diffA !== diffB) {
          return diffA - diffB;
        }
        // Third: time as tiebreaker (ascending - faster first)
        return timeA - timeB;
      });
    } else {
      // For other classes: Sort by faults first, then by time (fastest wins)
      completedRiders.sort((a, b) => {
        if (a.total_faults !== b.total_faults) {
          return a.total_faults - b.total_faults;
        }
        return (a.time_taken || 999) - (b.time_taken || 999);
      });
    }

    // Return completed riders first, then non-completed at the bottom
    return [...completedRiders, ...nonCompletedRiders];
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/20"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="bg-purple-500/20 p-4 rounded-full">
              <Lock className="w-8 h-8 text-purple-300" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-2">
            Live Scoring Entry
          </h1>
          <p className="text-purple-200 text-center mb-2">
            {classData?.class_name}
          </p>
          <p className="text-purple-300 text-center text-sm mb-6">
            {classData?.shows.name}
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Enter Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:border-purple-400"
                placeholder="Password"
                autoFocus
              />
              {passwordError && (
                <p className="text-red-300 text-sm mt-2">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              Access Scoring
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const leaderboard = getLeaderboard();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-4 md:p-8">
      <div className="max-w-[95%] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 mb-6 border border-white/20"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <h1 className="text-2xl md:text-3xl font-bold">{classData?.class_name}</h1>
              </div>
              <p className="text-purple-200">{classData?.shows.name}</p>
              <p className="text-sm text-gray-400 mt-1">
                Rule: {classData?.class_rule.replace(/_/g, ' ').toUpperCase()}
                {classData?.time_allowed && (
                  <span className="ml-4">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Time Allowed: {classData.time_allowed}s
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                onClick={fetchScoringData}
                disabled={refreshing}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Settings Panel */}
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20"
          >
            <h2 className="text-xl font-bold mb-4">Scoring Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Time Allowed Round 1 (seconds)
                </label>
                <input
                  type="number"
                  value={timeAllowed}
                  onChange={(e) => setTimeAllowed(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  placeholder="e.g., 76"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Time Allowed Round 2 (seconds) - Optional
                </label>
                <input
                  type="number"
                  value={timeAllowedRound2}
                  onChange={(e) => setTimeAllowedRound2(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                  placeholder="e.g., 60"
                />
              </div>
            </div>
            <button
              onClick={handleUpdateTimeAllowed}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Update Time Allowed
            </button>
          </motion.div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-600/20 border border-blue-600/50 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <div className="w-full">
            {isRegularTwoPhase ? (
              <div>
                <p className="mb-2 text-lg font-bold text-green-300">
                  ⚡ Two-Phase Competition - ONE continuous run from A → B → C
                </p>
                <p className="mb-2">
                  Enter times in seconds (e.g., 65.50). Time faults will be calculated automatically
                  if Time Allowed is set.
                </p>
                <div className="mt-3 bg-yellow-500/20 border border-yellow-500/50 rounded p-3">
                  <p className="font-bold text-yellow-300 mb-2">Two-Phase Rules:</p>
                  <ul className="text-sm space-y-1 text-yellow-100">
                    <li>• Phase 1 (A→B) and Phase 2 (B→C) are completed in ONE continuous run</li>
                    <li>• <strong>If rider has faults in Phase 1, they DO NOT continue to Phase 2</strong></li>
                    <li>• Only riders with 0 faults in Phase 1 continue to Phase 2</li>
                    <li>• <strong>Ranking:</strong> Riders who completed Phase 2 rank FIRST (by Phase 2 time), riders with Phase 1 faults rank below them</li>
                    <li>• <strong>Winner:</strong> Fastest Phase 2 time among riders with 0 Phase 1 faults</li>
                  </ul>
                </div>
              </div>
            ) : isSpecialTwoPhase ? (
              <div>
                <p className="mb-2 text-lg font-bold text-purple-300">
                  ⚡ Special Two-Phase Competition - ONE continuous run from A → B → C
                </p>
                <p className="mb-2">
                  Enter times in seconds (e.g., 65.50). Time faults will be calculated automatically
                  if Time Allowed is set.
                </p>
                <div className="mt-3 bg-purple-500/20 border border-purple-500/50 rounded p-3">
                  <p className="font-bold text-purple-300 mb-2">Special Two-Phase Rules:</p>
                  <ul className="text-sm space-y-1 text-purple-100">
                    <li>• Phase 1 (A→B) and Phase 2 (B→C) are completed in ONE continuous run</li>
                    <li>• <strong>ALL riders complete BOTH phases</strong> regardless of Phase 1 faults</li>
                    <li>• Total faults = Phase 1 faults + Phase 2 faults (combined)</li>
                    <li>• <strong>Ranking:</strong> By total faults (lowest first), then by Phase 2 time (fastest)</li>
                    <li>• <strong>Winner:</strong> Lowest total faults with fastest Phase 2 time</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p>
                Enter times in seconds (e.g., 65.50). Time faults will be calculated automatically
                if Time Allowed is set. Click Save after entering each rider's score.
              </p>
            )}
          </div>
        </div>

        {/* Scoring Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                {isTwoPhase ? (
                  <tr>
                    <th className="px-2 py-2 text-left w-10">#</th>
                    <th className="px-2 py-2 text-left w-32">Rider</th>
                    <th className="px-2 py-2 text-left w-28">Horse</th>
                    <th className="px-2 py-2 text-left w-24">Club</th>
                    <th className="px-1 py-2 text-center bg-blue-600/20 text-xs" colSpan={3}>Phase 1 (A→B)</th>
                    <th className="px-1 py-2 text-center bg-green-600/20 text-xs" colSpan={3}>
                      Phase 2 (B→C)
                      {isRegularTwoPhase && (
                        <div className="text-xs font-normal text-yellow-300 mt-1">
                          Only if 0 faults Phase 1
                        </div>
                      )}
                    </th>
                    <th className="px-2 py-2 text-left w-12">Total</th>
                    <th className="px-2 py-2 text-left w-24">Status</th>
                    <th className="px-2 py-2 text-left w-32">Notes</th>
                    <th className="px-2 py-2 text-right w-20">Action</th>
                  </tr>
                ) : isAccumulator ? (
                  <tr>
                    <th className="px-2 py-2 text-left w-10">#</th>
                    <th className="px-2 py-2 text-left w-32">Rider</th>
                    <th className="px-2 py-2 text-left w-28">Horse</th>
                    <th className="px-2 py-2 text-left w-24">Club</th>
                    <th className="px-2 py-2 text-left w-20">Time (s)</th>
                    <th className="px-2 py-2 text-left w-20">Points</th>
                    <th className="px-2 py-2 text-left w-24">Status</th>
                    <th className="px-2 py-2 text-left w-32">Notes</th>
                    <th className="px-2 py-2 text-right w-20">Action</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-2 py-2 text-left w-10">#</th>
                    <th className="px-2 py-2 text-left w-32">Rider</th>
                    <th className="px-2 py-2 text-left w-28">Horse</th>
                    <th className="px-2 py-2 text-left w-24">Club</th>
                    <th className="px-2 py-2 text-left w-20">Time (s)</th>
                    <th className="px-2 py-2 text-left w-20">Jump</th>
                    <th className="px-2 py-2 text-left w-20">Time F.</th>
                    <th className="px-2 py-2 text-left w-12">Total</th>
                    <th className="px-2 py-2 text-left w-24">Status</th>
                    <th className="px-2 py-2 text-left w-32">Notes</th>
                    <th className="px-2 py-2 text-right w-20">Action</th>
                  </tr>
                )}
                {isTwoPhase && (
                  <tr className="bg-white/5 text-xs">
                    <th colSpan={4}></th>
                    <th className="px-1 py-1 text-center bg-blue-600/10">Time (s)</th>
                    <th className="px-1 py-1 text-center bg-blue-600/10">Jump</th>
                    <th className="px-1 py-1 text-center bg-blue-600/10">Time F.</th>
                    <th className="px-1 py-1 text-center bg-green-600/10">Time (s)</th>
                    <th className="px-1 py-1 text-center bg-green-600/10">Jump</th>
                    <th className="px-1 py-1 text-center bg-green-600/10">Time F.</th>
                    <th colSpan={3}></th>
                  </tr>
                )}
              </thead>
              <tbody>
                {startlist.map((entry) => {
                  const defaultData = {
                    time_taken: '',
                    jumping_faults: '0',
                    time_faults: '0',
                    points: '',
                    status: 'completed',
                    notes: '',
                    time_taken_phase2: '',
                    jumping_faults_phase2: '0',
                    time_faults_phase2: '0',
                  };
                  const existingData = scoringData[entry.id] || {};
                  const data = {
                    ...defaultData,
                    ...existingData,
                    // Ensure all values are strings, never null or undefined
                    time_taken: existingData.time_taken ?? '',
                    jumping_faults: existingData.jumping_faults ?? '0',
                    time_faults: existingData.time_faults ?? '0',
                    points: existingData.points ?? '',
                    status: existingData.status ?? 'completed',
                    notes: existingData.notes ?? '',
                    time_taken_phase2: existingData.time_taken_phase2 ?? '',
                    jumping_faults_phase2: existingData.jumping_faults_phase2 ?? '0',
                    time_faults_phase2: existingData.time_faults_phase2 ?? '0',
                  };

                  if (isTwoPhase) {
                    // Two-phase: show both phases in one row
                    const totalFaults =
                      (parseInt(data.jumping_faults) || 0) +
                      (parseInt(data.time_faults) || 0) +
                      (parseInt(data.jumping_faults_phase2) || 0) +
                      (parseInt(data.time_faults_phase2) || 0);

                    return (
                      <tr
                        key={entry.id}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <td className="px-2 py-2">{entry.start_order}</td>
                        <td className="px-2 py-2 font-medium text-sm truncate" title={entry.rider_name}>{entry.rider_name}</td>
                        <td className="px-2 py-2 text-sm truncate" title={entry.horse_name}>{entry.horse_name}</td>
                        <td className="px-2 py-2 text-sm truncate">{entry.club_name || '-'}</td>

                        {/* Phase 1 (A→B) */}
                        <td className="px-1 py-2 bg-blue-600/5">
                          <input
                            type="number"
                            step="0.01"
                            value={data.time_taken}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'time_taken', e.target.value)
                            }
                            className="w-16 px-1 py-1 text-sm bg-white/10 border border-blue-400/30 rounded focus:outline-none focus:border-blue-500"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-1 py-2 bg-blue-600/5">
                          <input
                            type="number"
                            value={data.jumping_faults}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'jumping_faults', e.target.value)
                            }
                            className="w-12 px-1 py-1 text-sm bg-white/10 border border-blue-400/30 rounded focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-1 py-2 bg-blue-600/5">
                          <input
                            type="number"
                            value={data.time_faults}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'time_faults', e.target.value)
                            }
                            className="w-12 px-1 py-1 text-sm bg-white/10 border border-blue-400/30 rounded focus:outline-none focus:border-blue-500"
                            disabled={!!classData?.time_allowed}
                          />
                        </td>

                        {/* Phase 2 (B→C) */}
                        <td className="px-1 py-2 bg-green-600/5">
                          <input
                            type="number"
                            step="0.01"
                            value={data.time_taken_phase2}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'time_taken_phase2', e.target.value)
                            }
                            className="w-16 px-1 py-1 text-sm bg-white/10 border border-green-400/30 rounded focus:outline-none focus:border-green-500"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-1 py-2 bg-green-600/5">
                          <input
                            type="number"
                            value={data.jumping_faults_phase2}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'jumping_faults_phase2', e.target.value)
                            }
                            className="w-12 px-1 py-1 text-sm bg-white/10 border border-green-400/30 rounded focus:outline-none focus:border-green-500"
                          />
                        </td>
                        <td className="px-1 py-2 bg-green-600/5">
                          <input
                            type="number"
                            value={data.time_faults_phase2}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'time_faults_phase2', e.target.value)
                            }
                            className="w-12 px-1 py-1 text-sm bg-white/10 border border-green-400/30 rounded focus:outline-none focus:border-green-500"
                            disabled={!!classData?.time_allowed_round2}
                          />
                        </td>

                        <td className="px-2 py-2 font-bold text-yellow-400 text-sm">
                          {totalFaults}
                        </td>

                        <td className="px-2 py-2">
                          <select
                            value={data.status}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'status', e.target.value)
                            }
                            className="px-1 py-1 text-xs bg-white/10 border border-white/20 rounded focus:outline-none w-full"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value} className="bg-gray-900">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={data.notes}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'notes', e.target.value)
                            }
                            className="w-full px-1 py-1 text-sm bg-white/10 border border-white/20 rounded focus:outline-none focus:border-purple-500"
                            placeholder="Notes..."
                          />
                        </td>

                        <td className="px-2 py-2 text-right">
                          <button
                            onClick={() => handleSaveScore(entry.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-500 rounded transition text-xs"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  } else if (isAccumulator) {
                    // Accumulator class: points-based scoring
                    return (
                      <tr
                        key={entry.id}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <td className="px-2 py-2">{entry.start_order}</td>
                        <td className="px-2 py-2 font-medium text-sm truncate" title={entry.rider_name}>{entry.rider_name}</td>
                        <td className="px-2 py-2 text-sm truncate" title={entry.horse_name}>{entry.horse_name}</td>
                        <td className="px-2 py-2 text-sm truncate">{entry.club_name || '-'}</td>

                        <td className="px-2 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={data.time_taken}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'time_taken', e.target.value)
                            }
                            className="w-16 px-1 py-1 text-sm bg-white/10 border border-white/20 rounded focus:outline-none focus:border-purple-500"
                            placeholder="0.00"
                          />
                        </td>

                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={data.points || ''}
                            max="65"
                            onChange={(e) =>
                              handleInputChange(entry.id, 'points', e.target.value)
                            }
                            className="w-16 px-1 py-1 text-sm bg-white/10 border border-white/20 rounded focus:outline-none focus:border-purple-500"
                            placeholder="0-65"
                          />
                        </td>

                        <td className="px-2 py-2">
                          <select
                            value={data.status}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'status', e.target.value)
                            }
                            className="px-1 py-1 text-xs bg-white/10 border border-white/20 rounded focus:outline-none w-full"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value} className="bg-gray-900">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={data.notes}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'notes', e.target.value)
                            }
                            className="w-full px-1 py-1 text-sm bg-white/10 border border-white/20 rounded focus:outline-none focus:border-purple-500"
                            placeholder="Notes..."
                          />
                        </td>

                        <td className="px-2 py-2 text-right">
                          <button
                            onClick={() => handleSaveScore(entry.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-500 rounded transition text-xs"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  } else {
                    // Non-two-phase: single row
                    const totalFaults =
                      (parseInt(data.jumping_faults) || 0) +
                      (parseInt(data.time_faults) || 0);

                    return (
                      <tr
                        key={entry.id}
                        className="border-t border-white/10 hover:bg-white/5"
                      >
                        <td className="px-2 py-2">{entry.start_order}</td>
                        <td className="px-2 py-2 font-medium text-sm truncate" title={entry.rider_name}>{entry.rider_name}</td>
                        <td className="px-2 py-2 text-sm truncate" title={entry.horse_name}>{entry.horse_name}</td>
                        <td className="px-2 py-2 text-sm truncate">{entry.club_name || '-'}</td>

                        <td className="px-2 py-2">
                          <input
                            type="number"
                            step="0.01"
                            value={data.time_taken}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'time_taken', e.target.value)
                            }
                            className="w-16 px-1 py-1 text-sm bg-white/10 border border-white/20 rounded focus:outline-none focus:border-purple-500"
                            placeholder="0.00"
                          />
                        </td>

                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={data.jumping_faults}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'jumping_faults', e.target.value)
                            }
                            className="w-12 px-1 py-1 text-sm bg-white/10 border border-white/20 rounded focus:outline-none focus:border-purple-500"
                          />
                        </td>

                        <td className="px-2 py-2">
                          <input
                            type="number"
                            value={data.time_faults}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'time_faults', e.target.value)
                            }
                            className="w-12 px-1 py-1 text-sm bg-white/10 border border-white/20 rounded focus:outline-none focus:border-purple-500"
                            disabled={!!classData?.time_allowed}
                          />
                        </td>

                        <td className="px-2 py-2 font-bold text-yellow-400 text-sm">
                          {totalFaults}
                        </td>

                        <td className="px-2 py-2">
                          <select
                            value={data.status}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'status', e.target.value)
                            }
                            className="px-1 py-1 text-xs bg-white/10 border border-white/20 rounded focus:outline-none w-full"
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value} className="bg-gray-900">
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-2 py-2">
                          <input
                            type="text"
                            value={data.notes}
                            onChange={(e) =>
                              handleInputChange(entry.id, 'notes', e.target.value)
                            }
                            className="w-full px-1 py-1 text-sm bg-white/10 border border-white/20 rounded focus:outline-none focus:border-purple-500"
                            placeholder="Notes..."
                          />
                        </td>

                        <td className="px-2 py-2 text-right">
                          <button
                            onClick={() => handleSaveScore(entry.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-500 rounded transition text-xs"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Current Rankings */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mt-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              Current Rankings
            </h2>
            <div className="space-y-2">
              {leaderboard.slice(0, 10).map((entry, index) => (
                <div
                  key={entry.startlist_id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 ? 'bg-yellow-500/20 border border-yellow-400/50' :
                    index === 1 ? 'bg-gray-400/20 border border-gray-400/50' :
                    index === 2 ? 'bg-orange-600/20 border border-orange-400/50' :
                    'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold w-8">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                    </div>
                    <div>
                      <div className="font-semibold">{entry.rider_name}</div>
                      <div className="text-sm text-purple-200">{entry.horse_name}</div>
                      {entry.club_name && (
                        <div className="text-xs text-purple-300">{entry.club_name}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {entry.status !== 'completed' ? (
                      <div className={`text-xl font-bold uppercase ${
                        entry.status === 'eliminated' ? 'text-red-400' :
                        entry.status === 'retired' ? 'text-orange-400' :
                        entry.status === 'withdrawn' ? 'text-gray-400' :
                        entry.status === 'canceled' ? 'text-red-500' :
                        'text-gray-400'
                      }`}>
                        {entry.status}
                      </div>
                    ) : isAccumulator ? (
                      <>
                        <div className="text-2xl font-bold text-green-400">
                          {entry.points} pts
                        </div>
                        <div className="text-sm text-purple-200 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {entry.time_taken?.toFixed(2)}s
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {entry.total_faults} F
                        </div>
                        <div className="text-sm text-purple-200 flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" />
                          {entry.time_taken?.toFixed(2)}s
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Complete Class Button */}
        {classData && (
          <div className="mt-8 flex items-center justify-center gap-4">
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
    </div>
  );
}
