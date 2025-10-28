'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Team {
  name: string;
  score: number;
  logo?: string;
}

interface ScoreboardProps {
  homeTeam?: Team;
  awayTeam?: Team;
  timeRemaining?: string;
  period?: string;
  isCompact?: boolean;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  homeTeam = { name: 'Home Team', score: 0 },
  awayTeam = { name: 'Away Team', score: 0 },
  timeRemaining = '00:00',
  period = 'Live',
  isCompact = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 rounded-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold uppercase tracking-wide">{period}</span>
            </div>
          </div>
          <div className="text-xs font-mono text-white/80">{currentTime.toLocaleTimeString()}</div>
        </div>

        {/* Scores */}
        <div className="space-y-3">
          {/* Home Team */}
          <motion.div
            className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
                  style={{ margin: 0, padding: 0, marginRight: '-13px', marginBottom: '8px' }}
                >
                  {homeTeam.logo || homeTeam.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold">{homeTeam.name}</div>
                  <div className="text-xs text-slate-400">Home</div>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent text-center">
              {homeTeam.score}
            </div>
          </motion.div>

          {/* Away Team */}
          <motion.div
            className="bg-slate-800/50 rounded-lg p-3 border border-slate-700"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
                  style={{ margin: 0, padding: 0, marginRight: '-13px', marginBottom: '8px' }}
                >
                  {awayTeam.logo || awayTeam.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold">{awayTeam.name}</div>
                  <div className="text-xs text-slate-400">Away</div>
                </div>
              </div>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent text-center">
              {awayTeam.score}
            </div>
          </motion.div>
        </div>

        {/* Time Remaining */}
        <div className="mt-4 bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Time Remaining</div>
          <div className="text-xl font-mono font-bold">{timeRemaining}</div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-1 gap-2">
          <div className="bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700 text-center">
            <div className="text-lg font-bold text-blue-400">42%</div>
            <div className="text-xs text-slate-400">Possession</div>
          </div>
          <div className="bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700 text-center">
            <div className="text-lg font-bold text-yellow-400">12</div>
            <div className="text-xs text-slate-400">Shots</div>
          </div>
          <div className="bg-slate-800/50 px-3 py-2 rounded-lg border border-slate-700 text-center">
            <div className="text-lg font-bold text-green-400">8</div>
            <div className="text-xs text-slate-400">Corners</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
