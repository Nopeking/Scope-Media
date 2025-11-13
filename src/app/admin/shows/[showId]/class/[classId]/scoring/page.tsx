'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trophy, Clock, AlertCircle, Share2, Copy, Check } from 'lucide-react';

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

interface Class {
  id: string;
  class_name: string;
  class_rule: string;
  time_allowed: number | null;
  time_allowed_round2: number | null;
  optimum_time: number | null;
  number_of_rounds: number;
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

export default function ScoringPage({
  params,
}: {
  params: Promise<{ showId: string; classId: string }>;
}) {
  const unwrappedParams = use(params);
  const { showId, classId } = unwrappedParams;
  const router = useRouter();

  const [classInfo, setClassInfo] = useState<Class | null>(null);
  const [startlist, setStartlist] = useState<StartlistEntry[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});
  const [currentRound, setCurrentRound] = useState(1);
  const [loading, setLoading] = useState(true);
  const [linkCopied, setLinkCopied] = useState(false);
  const [resultsLinkCopied, setResultsLinkCopied] = useState(false);

  // Check if this is a two-phase class
  const isTwoPhase = classInfo?.class_rule === 'two_phases' || classInfo?.class_rule === 'special_two_phases';
  const isSpecialTwoPhase = classInfo?.class_rule === 'special_two_phases';
  const isRegularTwoPhase = classInfo?.class_rule === 'two_phases';

  // Scoring form state for each rider
  const [scoringData, setScoringData] = useState<Record<string, {
    time_taken: string;
    jumping_faults: string;
    time_faults: string;
    status: string;
    notes: string;
    // Phase 2 data (for two-phase classes)
    time_taken_phase2: string;
    jumping_faults_phase2: string;
    time_faults_phase2: string;
  }>>({});

  useEffect(() => {
    const loadData = async () => {
      await fetchClassInfo();
      await fetchStartlist();
      await fetchScores();
    };
    loadData();
  }, [classId, currentRound]);

  const fetchClassInfo = async () => {
    try {
      const response = await fetch(`/api/classes/${classId}`);
      if (response.ok) {
        const data = await response.json();
        setClassInfo(data);
      }
    } catch (error) {
      console.error('Error fetching class info:', error);
    }
  };

  const fetchStartlist = async () => {
    try {
      const response = await fetch(`/api/startlist?class_id=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setStartlist(data);

        // Initialize scoring data for each rider only if not already present
        setScoringData((prev) => {
          const initialData: Record<string, any> = { ...prev };
          data.forEach((entry: StartlistEntry) => {
            if (!initialData[entry.id]) {
              initialData[entry.id] = {
                time_taken: '',
                jumping_faults: '0',
                time_faults: '0',
                status: 'completed',
                notes: '',
                // Phase 2 fields for two-phase classes
                time_taken_phase2: '',
                jumping_faults_phase2: '0',
                time_faults_phase2: '0',
              };
            }
          });
          return initialData;
        });
      }
    } catch (error) {
      console.error('Error fetching startlist:', error);
    }
  };

  const fetchScores = async () => {
    try {
      setLoading(true);

      // For two-phase classes, fetch both rounds
      if (isTwoPhase) {
        // Fetch Phase 1 (round 1)
        const response1 = await fetch(`/api/scores?class_id=${classId}&round_number=1`);
        // Fetch Phase 2 (round 2)
        const response2 = await fetch(`/api/scores?class_id=${classId}&round_number=2`);

        if (response1.ok && response2.ok) {
          const data1 = await response1.json();
          const data2 = await response2.json();

          const scoresMap: Record<string, Score> = {};
          const newScoringData: Record<string, any> = {};

          // Process Phase 1 data
          data1.forEach((score: Score & { startlist: StartlistEntry }) => {
            scoresMap[score.startlist_id] = score;
            newScoringData[score.startlist_id] = {
              time_taken: score.time_taken?.toString() || '',
              jumping_faults: score.jumping_faults.toString(),
              time_faults: score.time_faults.toString(),
              status: score.status,
              notes: score.notes || '',
              time_taken_phase2: '',
              jumping_faults_phase2: '0',
              time_faults_phase2: '0',
            };
          });

          // Process Phase 2 data
          data2.forEach((score: Score & { startlist: StartlistEntry }) => {
            if (newScoringData[score.startlist_id]) {
              newScoringData[score.startlist_id].time_taken_phase2 = score.time_taken?.toString() || '';
              newScoringData[score.startlist_id].jumping_faults_phase2 = score.jumping_faults.toString();
              newScoringData[score.startlist_id].time_faults_phase2 = score.time_faults.toString();
            }
          });

          setScores(scoresMap);

          if (Object.keys(newScoringData).length > 0) {
            setScoringData((prev) => ({
              ...prev,
              ...newScoringData,
            }));
          }
        }
      } else {
        // For non-two-phase classes, fetch current round
        const response = await fetch(
          `/api/scores?class_id=${classId}&round_number=${currentRound}`
        );
        if (response.ok) {
          const data = await response.json();
          const scoresMap: Record<string, Score> = {};

          // Build scores map and update scoring data
          const newScoringData: Record<string, any> = {};
          data.forEach((score: Score & { startlist: StartlistEntry }) => {
            scoresMap[score.startlist_id] = score;

            // Populate form with existing score data
            newScoringData[score.startlist_id] = {
              time_taken: score.time_taken?.toString() || '',
              jumping_faults: score.jumping_faults.toString(),
              time_faults: score.time_faults.toString(),
              status: score.status,
              notes: score.notes || '',
            };
          });

          setScores(scoresMap);

          // Update scoring data with existing scores
          if (Object.keys(newScoringData).length > 0) {
            setScoringData((prev) => ({
              ...prev,
              ...newScoringData,
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeFaults = (timeTaken: number, timeAllowed: number | null): number => {
    if (!timeAllowed || !timeTaken) return 0;
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
        const timeFaults1 = classInfo?.time_allowed && timeTaken1
          ? calculateTimeFaults(timeTaken1, classInfo.time_allowed)
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
        const timeFaults2 = classInfo?.time_allowed_round2 && timeTaken2
          ? calculateTimeFaults(timeTaken2, classInfo.time_allowed_round2)
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
          await fetchScores();
          alert('Two-phase score saved successfully!');
        }
      } else {
        // For non-two-phase classes, save single round
        const timeTaken = parseFloat(data.time_taken) || null;
        const jumpingFaults = parseInt(data.jumping_faults) || 0;

        // Use correct time allowed based on round
        const timeAllowed = currentRound === 2
          ? classInfo?.time_allowed_round2
          : classInfo?.time_allowed;

        const timeFaults = timeAllowed && timeTaken
          ? calculateTimeFaults(timeTaken, timeAllowed)
          : parseInt(data.time_faults) || 0;
        const totalFaults = jumpingFaults + timeFaults;

        const scoreData = {
          startlist_id: startlistId,
          class_id: classId,
          round_number: currentRound,
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
            await fetchScores();
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
            await fetchScores();
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
    setScoringData((prev) => ({
      ...prev,
      [startlistId]: {
        ...prev[startlistId],
        [field]: value,
      },
    }));
  };

  const handleCopyLink = async () => {
    const publicUrl = `${window.location.origin}/scoring/live/${classId}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy link to clipboard');
    }
  };

  const handleCopyResultsLink = async () => {
    const resultsUrl = `${window.location.origin}/results/${classId}`;
    try {
      await navigator.clipboard.writeText(resultsUrl);
      setResultsLinkCopied(true);
      setTimeout(() => setResultsLinkCopied(false), 3000);
    } catch (error) {
      console.error('Failed to copy results link:', error);
      alert('Failed to copy results link to clipboard');
    }
  };

  const getStatusColor = (status: string) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.color || 'gray';
  };

  // Compute leaderboard for two-phase classes
  const getLeaderboard = () => {
    if (isTwoPhase) {
      // For two-phase classes, we need to aggregate both phases
      const leaderboardEntries: Array<{
        startlist_id: string;
        rider_name: string;
        horse_name: string;
        phase1_faults: number;
        phase2_time: number | null;
        phase2_faults: number;
        total_faults: number;
        hasPhase2: boolean;
      }> = [];

      startlist.forEach((entry) => {
        const data = scoringData[entry.id];
        if (!data) return;

        const phase1Faults = (parseInt(data.jumping_faults) || 0) + (parseInt(data.time_faults) || 0);
        const phase2Faults = (parseInt(data.jumping_faults_phase2) || 0) + (parseInt(data.time_faults_phase2) || 0);
        const phase2Time = parseFloat(data.time_taken_phase2) || null;
        const hasPhase2 = phase2Time !== null && data.time_taken_phase2 !== '';

        leaderboardEntries.push({
          startlist_id: entry.id,
          rider_name: entry.rider_name,
          horse_name: entry.horse_name,
          phase1_faults: phase1Faults,
          phase2_time: phase2Time,
          phase2_faults: phase2Faults,
          total_faults: phase1Faults + phase2Faults,
          hasPhase2: hasPhase2,
        });
      });

      if (isRegularTwoPhase) {
        // Regular two-phase: Only riders who completed Phase 2 rank first
        const phase2Riders = leaderboardEntries.filter((e) => e.hasPhase2);
        const phase1OnlyRiders = leaderboardEntries.filter((e) => !e.hasPhase2 && e.phase1_faults > 0);

        // Sort Phase 2 riders by Phase 2 faults first, then Phase 2 time
        phase2Riders.sort((a, b) => {
          if (a.phase2_faults !== b.phase2_faults) {
            return a.phase2_faults - b.phase2_faults;
          }
          return (a.phase2_time || 999) - (b.phase2_time || 999);
        });

        // Sort Phase 1 only riders by Phase 1 faults
        phase1OnlyRiders.sort((a, b) => a.phase1_faults - b.phase1_faults);

        return [...phase2Riders, ...phase1OnlyRiders];
      } else {
        // Special two-phase: All riders ranked by total faults, then Phase 2 time
        return leaderboardEntries
          .filter((e) => e.hasPhase2) // Only show riders who have completed both phases
          .sort((a, b) => {
            if (a.total_faults !== b.total_faults) {
              return a.total_faults - b.total_faults;
            }
            return (a.phase2_time || 999) - (b.phase2_time || 999);
          });
      }
    } else {
      // Non-two-phase: Use existing scores
      return Object.values(scores)
        .filter((score) => score.status === 'completed')
        .sort((a, b) => a.total_faults - b.total_faults || (a.time_taken || 999) - (b.time_taken || 999))
        .map((score) => {
          const entry = startlist.find((e) => e.id === score.startlist_id);
          return {
            startlist_id: score.startlist_id,
            rider_name: entry?.rider_name || '',
            horse_name: entry?.horse_name || '',
            total_faults: score.total_faults,
            time_taken: score.time_taken,
          };
        });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/admin/shows/${showId}/class/${classId}/startlist`)}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <Trophy className="w-10 h-10" />
                Live Scoring
                {classInfo && classInfo.number_of_rounds > 1 && !isTwoPhase && (
                  <span className="text-2xl bg-purple-600 px-4 py-2 rounded-lg">
                    Round {currentRound}
                  </span>
                )}
                {isRegularTwoPhase && (
                  <span className="text-2xl bg-green-600 px-4 py-2 rounded-lg">
                    Two-Phase
                  </span>
                )}
                {isSpecialTwoPhase && (
                  <span className="text-2xl bg-purple-600 px-4 py-2 rounded-lg">
                    Special Two-Phase
                  </span>
                )}
              </h1>
              {classInfo && (
                <div className="text-gray-400 mt-2">
                  <p className="text-lg">{classInfo.shows.name} - {classInfo.class_name}</p>
                  <p className="text-sm">
                    Rule: {classInfo.class_rule.replace(/_/g, ' ').toUpperCase()}
                    {isTwoPhase ? (
                      <span className="ml-4">
                        <Clock className="inline w-4 h-4 mr-1" />
                        Phase 1: {classInfo.time_allowed || 'N/A'}s
                        {classInfo.time_allowed_round2 && (
                          <span className="ml-3">Phase 2: {classInfo.time_allowed_round2}s</span>
                        )}
                      </span>
                    ) : classInfo.time_allowed ? (
                      <span className="ml-4">
                        <Clock className="inline w-4 h-4 mr-1" />
                        Time Allowed: {classInfo.time_allowed}s
                      </span>
                    ) : null}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            {/* Copy Links Section */}
            <div className="flex gap-2">
              {/* Share Public Scoring Entry Link */}
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  linkCopied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Scoring Entry Link
                  </>
                )}
              </button>

              {/* Copy Results Display Link (for streams) */}
              <button
                onClick={handleCopyResultsLink}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                  resultsLinkCopied
                    ? 'bg-green-600 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {resultsLinkCopied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4" />
                    Results Link (Stream)
                  </>
                )}
              </button>
            </div>

            {/* Round Switcher for multi-round classes */}
            {classInfo && classInfo.number_of_rounds > 1 && !isTwoPhase && (
              <div className="flex flex-col items-end gap-2">
                <p className="text-sm text-gray-400">Switch Round:</p>
                <div className="flex gap-2">
                  {Array.from({ length: classInfo.number_of_rounds }, (_, i) => i + 1).map(
                    (round) => (
                      <button
                        key={round}
                        onClick={() => setCurrentRound(round)}
                        className={`px-6 py-3 rounded-lg font-bold text-lg transition shadow-lg ${
                          currentRound === round
                            ? 'bg-purple-600 ring-4 ring-purple-400/50'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        Round {round}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

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
            ) : classInfo && classInfo.number_of_rounds > 1 ? (
              <div>
                <p className="mb-2 text-lg font-bold text-yellow-300">
                  ⚡ Currently Entering: ROUND {currentRound}
                </p>
                <p>
                  Enter times in seconds (e.g., 65.50). Time faults will be calculated automatically
                  if Time Allowed is set.
                </p>
              </div>
            ) : (
              <p>
                Enter times in seconds (e.g., 65.50). Time faults will be calculated automatically
                if Time Allowed is set.
              </p>
            )}
          </div>
        </div>

        {/* Scoring Table */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : startlist.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No riders in startlist.{' '}
              <button
                onClick={() => router.push(`/admin/shows/${showId}/class/${classId}/startlist`)}
                className="text-blue-400 hover:underline"
              >
                Add riders to startlist first
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/10">
                  {isTwoPhase ? (
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Bib</th>
                      <th className="px-4 py-3 text-left">Rider</th>
                      <th className="px-4 py-3 text-left">Horse</th>
                      <th className="px-4 py-3 text-left">Team</th>
                      <th className="px-2 py-3 text-center bg-blue-600/20" colSpan={3}>Phase 1 (A→B)</th>
                      <th className="px-2 py-3 text-center bg-green-600/20" colSpan={3}>
                        Phase 2 (B→C)
                        {isRegularTwoPhase && (
                          <div className="text-xs font-normal text-yellow-300 mt-1">
                            Only if 0 faults Phase 1
                          </div>
                        )}
                      </th>
                      <th className="px-4 py-3 text-left">Total</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Notes</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-3 text-left">#</th>
                      <th className="px-4 py-3 text-left">Bib</th>
                      <th className="px-4 py-3 text-left">Rider</th>
                      <th className="px-4 py-3 text-left">Horse</th>
                      <th className="px-4 py-3 text-left">Team</th>
                      <th className="px-4 py-3 text-left">Time (s)</th>
                      <th className="px-4 py-3 text-left">Jump Faults</th>
                      <th className="px-4 py-3 text-left">Time Faults</th>
                      <th className="px-4 py-3 text-left">Total</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Notes</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  )}
                  {isTwoPhase && (
                    <tr className="bg-white/5 text-xs">
                      <th colSpan={5}></th>
                      <th className="px-2 py-2 text-center bg-blue-600/10">Time (s)</th>
                      <th className="px-2 py-2 text-center bg-blue-600/10">Jump</th>
                      <th className="px-2 py-2 text-center bg-blue-600/10">Time F.</th>
                      <th className="px-2 py-2 text-center bg-green-600/10">Time (s)</th>
                      <th className="px-2 py-2 text-center bg-green-600/10">Jump</th>
                      <th className="px-2 py-2 text-center bg-green-600/10">Time F.</th>
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
                      status: 'completed',
                      notes: '',
                      time_taken_phase2: '',
                      jumping_faults_phase2: '0',
                      time_faults_phase2: '0',
                    };
                    const data = scoringData[entry.id] ? {
                      ...defaultData,
                      ...scoringData[entry.id]
                    } : defaultData;

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
                          <td className="px-4 py-3">{entry.start_order}</td>
                          <td className="px-4 py-3">{entry.bib_number || '-'}</td>
                          <td className="px-4 py-3 font-medium">{entry.rider_name}</td>
                          <td className="px-4 py-3">{entry.horse_name}</td>
                          <td className="px-4 py-3">{entry.team_name || '-'}</td>

                          {/* Phase 1 (A→B) */}
                          <td className="px-2 py-3 bg-blue-600/5">
                            <input
                              type="number"
                              step="0.01"
                              value={data.time_taken}
                              onChange={(e) =>
                                handleInputChange(entry.id, 'time_taken', e.target.value)
                              }
                              className="w-20 px-2 py-1 bg-white/10 border border-blue-400/30 rounded focus:outline-none focus:border-blue-500"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="px-2 py-3 bg-blue-600/5">
                            <input
                              type="number"
                              value={data.jumping_faults}
                              onChange={(e) =>
                                handleInputChange(entry.id, 'jumping_faults', e.target.value)
                              }
                              className="w-16 px-2 py-1 bg-white/10 border border-blue-400/30 rounded focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="px-2 py-3 bg-blue-600/5">
                            <input
                              type="number"
                              value={data.time_faults}
                              onChange={(e) =>
                                handleInputChange(entry.id, 'time_faults', e.target.value)
                              }
                              className="w-16 px-2 py-1 bg-white/10 border border-blue-400/30 rounded focus:outline-none focus:border-blue-500"
                              disabled={!!classInfo?.time_allowed}
                            />
                          </td>

                          {/* Phase 2 (B→C) */}
                          <td className="px-2 py-3 bg-green-600/5">
                            <input
                              type="number"
                              step="0.01"
                              value={data.time_taken_phase2}
                              onChange={(e) =>
                                handleInputChange(entry.id, 'time_taken_phase2', e.target.value)
                              }
                              className="w-20 px-2 py-1 bg-white/10 border border-green-400/30 rounded focus:outline-none focus:border-green-500"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="px-2 py-3 bg-green-600/5">
                            <input
                              type="number"
                              value={data.jumping_faults_phase2}
                              onChange={(e) =>
                                handleInputChange(entry.id, 'jumping_faults_phase2', e.target.value)
                              }
                              className="w-16 px-2 py-1 bg-white/10 border border-green-400/30 rounded focus:outline-none focus:border-green-500"
                            />
                          </td>
                          <td className="px-2 py-3 bg-green-600/5">
                            <input
                              type="number"
                              value={data.time_faults_phase2}
                              onChange={(e) =>
                                handleInputChange(entry.id, 'time_faults_phase2', e.target.value)
                              }
                              className="w-16 px-2 py-1 bg-white/10 border border-green-400/30 rounded focus:outline-none focus:border-green-500"
                              disabled={!!classInfo?.time_allowed_round2}
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
                              className={`px-2 py-1 bg-${getStatusColor(
                                data.status
                              )}-600/30 border border-${getStatusColor(
                                data.status
                              )}-600/50 rounded focus:outline-none`}
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
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
                              className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-500 rounded transition text-sm"
                            >
                              <Save className="w-4 h-4" />
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
                          <td className="px-4 py-3">{entry.start_order}</td>
                          <td className="px-4 py-3">{entry.bib_number || '-'}</td>
                          <td className="px-4 py-3 font-medium">{entry.rider_name}</td>
                          <td className="px-4 py-3">{entry.horse_name}</td>
                          <td className="px-4 py-3">{entry.team_name || '-'}</td>

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
                              disabled={!!classInfo?.time_allowed}
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
                              className={`px-2 py-1 bg-${getStatusColor(
                                data.status
                              )}-600/30 border border-${getStatusColor(
                                data.status
                              )}-600/50 rounded focus:outline-none`}
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
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
                              className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-500 rounded transition text-sm"
                            >
                              <Save className="w-4 h-4" />
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
          )}
        </div>

        {/* Leaderboard Preview */}
        {(() => {
          const leaderboard = getLeaderboard();
          return leaderboard.length > 0 && (
            <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Current Standings
                {isTwoPhase && (
                  <span className="text-xs font-normal text-gray-400 ml-2">
                    ({isRegularTwoPhase ? 'Phase 2 faults, then time' : 'Total faults, then Phase 2 time'})
                  </span>
                )}
              </h2>
              <div className="space-y-2">
                {leaderboard.map((entry: any, index: number) => {
                  const isTop3 = index < 3;
                  return (
                    <div
                      key={entry.startlist_id}
                      className={`flex items-center gap-3 p-2 rounded ${
                        index === 0
                          ? 'bg-yellow-600/20 border border-yellow-600/50'
                          : index === 1
                          ? 'bg-gray-400/20 border border-gray-400/50'
                          : index === 2
                          ? 'bg-orange-600/20 border border-orange-600/50'
                          : 'bg-white/5'
                      }`}
                    >
                      <div className={`${isTop3 ? 'text-2xl font-bold w-12' : 'text-lg font-semibold w-10'} text-center`}>
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <span className="font-semibold">{entry.rider_name}</span>
                        <span className="text-gray-400 text-sm ml-2">on {entry.horse_name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        {isTwoPhase ? (
                          <>
                            {entry.hasPhase2 ? (
                              <>
                                <span className="text-yellow-400 font-bold">{entry.total_faults}F total</span>
                                <span className="text-blue-300">P1: {entry.phase1_faults}F</span>
                                <span className="text-green-300">P2: {entry.phase2_faults}F, {entry.phase2_time}s</span>
                              </>
                            ) : (
                              <>
                                <span className="text-orange-400 font-bold">P1: {entry.phase1_faults}F</span>
                                <span className="text-xs text-gray-500">(No P2)</span>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            <span className="text-yellow-400 font-bold">{entry.total_faults} faults</span>
                            <span className="text-gray-400">{entry.time_taken}s</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
