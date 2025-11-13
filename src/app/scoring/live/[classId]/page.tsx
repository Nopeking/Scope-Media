'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, RefreshCw, Trophy, Clock, Save, Settings, AlertCircle } from 'lucide-react';

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
  { value: 'disqualified', label: 'Disqualified', color: 'red' },
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

  // Local time allowed state (can be updated before scoring)
  const [timeAllowed, setTimeAllowed] = useState<string>('');
  const [timeAllowedRound2, setTimeAllowedRound2] = useState<string>('');

  // Scoring form state for each rider
  const [scoringData, setScoringData] = useState<Record<string, {
    time_taken: string;
    jumping_faults: string;
    time_faults: string;
    status: string;
    notes: string;
  }>>({});

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  useEffect(() => {
    if (authenticated) {
      fetchScoringData();
      const interval = setInterval(fetchScoringData, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [authenticated]);

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

      // Fetch scores for round 1
      const scoresResponse = await fetch(`/api/scores?class_id=${classId}&round_number=1`);
      if (scoresResponse.ok) {
        const scoresData = await scoresResponse.json();
        const scoresMap: Record<string, Score> = {};
        const newScoringData: Record<string, any> = {};

        scoresData.forEach((score: Score) => {
          scoresMap[score.startlist_id] = score;
          newScoringData[score.startlist_id] = {
            time_taken: score.time_taken?.toString() || '',
            jumping_faults: score.jumping_faults.toString(),
            time_faults: score.time_faults.toString(),
            status: score.status,
            notes: score.notes || '',
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
    setScoringData((prev) => ({
      ...prev,
      [startlistId]: {
        ...prev[startlistId],
        [field]: value,
      },
    }));
  };

  const getLeaderboard = () => {
    return Object.values(scores)
      .filter((score) => score.status === 'completed')
      .sort((a, b) => {
        if (a.total_faults !== b.total_faults) {
          return a.total_faults - b.total_faults;
        }
        return (a.time_taken || 999) - (b.time_taken || 999);
      })
      .map((score) => {
        const entry = startlist.find((e) => e.id === score.startlist_id);
        return {
          startlist_id: score.startlist_id,
          rider_name: entry?.rider_name || '',
          horse_name: entry?.horse_name || '',
          club_name: entry?.club_name || '',
          total_faults: score.total_faults,
          time_taken: score.time_taken,
        };
      });
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
      <div className="max-w-7xl mx-auto">
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
          <p>
            Enter times in seconds (e.g., 65.50). Time faults will be calculated automatically
            if Time Allowed is set. Click Save after entering each rider's score.
          </p>
        </div>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-6 border border-white/20"
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
                    <div className="text-2xl font-bold">
                      {entry.total_faults} F
                    </div>
                    <div className="text-sm text-purple-200 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      {entry.time_taken?.toFixed(2)}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Scoring Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Rider</th>
                  <th className="px-4 py-3 text-left">Horse</th>
                  <th className="px-4 py-3 text-left">Club</th>
                  <th className="px-4 py-3 text-left">Time (s)</th>
                  <th className="px-4 py-3 text-left">Jump Faults</th>
                  <th className="px-4 py-3 text-left">Time Faults</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {startlist.map((entry) => {
                  const defaultData = {
                    time_taken: '',
                    jumping_faults: '0',
                    time_faults: '0',
                    status: 'completed',
                    notes: '',
                  };
                  const data = scoringData[entry.id] ? {
                    ...defaultData,
                    ...scoringData[entry.id]
                  } : defaultData;

                  const totalFaults =
                    (parseInt(data.jumping_faults) || 0) +
                    (parseInt(data.time_faults) || 0);

                  return (
                    <tr
                      key={entry.id}
                      className="border-t border-white/10 hover:bg-white/5"
                    >
                      <td className="px-4 py-3">{entry.start_order}</td>
                      <td className="px-4 py-3 font-medium">{entry.rider_name}</td>
                      <td className="px-4 py-3">{entry.horse_name}</td>
                      <td className="px-4 py-3 text-sm">{entry.club_name || '-'}</td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={data.time_taken}
                          onChange={(e) =>
                            handleInputChange(entry.id, 'time_taken', e.target.value)
                          }
                          className="w-24 px-2 py-1 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-purple-500"
                          placeholder="0.00"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.jumping_faults}
                          onChange={(e) =>
                            handleInputChange(entry.id, 'jumping_faults', e.target.value)
                          }
                          className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-purple-500"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={data.time_faults}
                          onChange={(e) =>
                            handleInputChange(entry.id, 'time_faults', e.target.value)
                          }
                          className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-purple-500"
                          disabled={!!classData?.time_allowed}
                        />
                      </td>

                      <td className="px-4 py-3 font-bold text-yellow-400">
                        {totalFaults}
                      </td>

                      <td className="px-4 py-3">
                        <select
                          value={data.status}
                          onChange={(e) =>
                            handleInputChange(entry.id, 'status', e.target.value)
                          }
                          className="px-2 py-1 bg-white/10 border border-white/20 rounded focus:outline-none text-sm"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value} className="bg-gray-900">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={data.notes}
                          onChange={(e) =>
                            handleInputChange(entry.id, 'notes', e.target.value)
                          }
                          className="w-32 px-2 py-1 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-purple-500"
                          placeholder="Notes..."
                        />
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleSaveScore(entry.id)}
                          className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-500 rounded transition text-sm ml-auto"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
