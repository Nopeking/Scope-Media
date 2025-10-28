'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize, AlertCircle, ExternalLink } from 'lucide-react';
import Scoreboard from './Scoreboard';

interface Team {
  name: string;
  score: number;
  logo?: string;
}

interface CustomVideoPlayerProps {
  url: string;
  thumbnail?: string;
  title?: string;
  homeTeam?: Team;
  awayTeam?: Team;
  timeRemaining?: string;
  period?: string;
  onClose?: () => void;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({
  url,
  thumbnail,
  title = 'Video Player',
  homeTeam = { name: 'Home Team', score: 0 },
  awayTeam = { name: 'Away Team', score: 0 },
  timeRemaining = '00:00',
  period = 'Live',
  onClose
}) => {
  const [isScoreboardVisible, setIsScoreboardVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // Extract YouTube video ID from URL
  const extractYouTubeId = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
      /(?:youtu\.be\/)([^&\n?#]+)/,
      /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtube\.com\/live\/)([^&\n?#]+)/,
      /(?:v=|v\/|embed\/)([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  // Check if URL is a YouTube URL
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Get embed URL for YouTube
  const getEmbedUrl = (url: string) => {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      const isLiveStream = url.includes('/live/');
      return isLiveStream
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&enablejsapi=1&live=1`
        : `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&enablejsapi=1`;
    }
    return null;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (fullscreenRef.current) {
        fullscreenRef.current.requestFullscreen?.();
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleScoreboard = () => {
    setIsScoreboardVisible(!isScoreboardVisible);
  };

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <>
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50"
          onClick={handleClose}
        />

        {/* Video Player Modal */}
        <motion.div
          ref={fullscreenRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`fixed z-[60] ${
            isFullscreen
              ? 'inset-0 bg-black'
              : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] h-[90vh] shadow-2xl rounded-xl overflow-hidden bg-slate-900'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-white font-bold text-lg">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded transition-colors"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
              <button
                onClick={handleClose}
                className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="relative flex h-[calc(100%-60px)] bg-black">
            {/* Video Section */}
            <motion.div
              animate={{
                width: isScoreboardVisible ? '85%' : '100%'
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative h-full bg-black"
            >
              {!url ? (
                <div className="flex items-center justify-center h-full bg-gray-900 text-white">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <p className="text-lg font-semibold">No Video URL</p>
                    <p className="text-sm text-gray-400">Please provide a video URL</p>
                  </div>
                </div>
              ) : !isYouTubeUrl(url) ? (
                <div className="flex items-center justify-center h-full bg-gray-900 text-white">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <p className="text-lg font-semibold">Non-YouTube URL</p>
                    <p className="text-sm text-gray-400 mb-4">This player currently supports YouTube videos only</p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open in New Tab
                    </a>
                  </div>
                </div>
              ) : !extractYouTubeId(url) ? (
                <div className="flex items-center justify-center h-full bg-gray-900 text-white">
                  <div className="text-center">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <p className="text-lg font-semibold">Invalid YouTube URL</p>
                    <p className="text-sm text-gray-400 mb-4">Please provide a valid YouTube URL</p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Try Opening in New Tab
                    </a>
                  </div>
                </div>
              ) : (
                <iframe
                  src={getEmbedUrl(url)}
                  title="Video Player"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}

              {/* Scoreboard Toggle Button */}
              <button
                onClick={toggleScoreboard}
                className="absolute top-4 right-4 bg-slate-900/90 hover:bg-slate-800 text-white p-3 rounded-lg shadow-lg transition-all z-10 flex items-center gap-2"
                title={isScoreboardVisible ? "Hide Scoreboard" : "Show Scoreboard"}
              >
                {isScoreboardVisible ? (
                  <>
                    <ChevronRight className="h-5 w-5" />
                    <span className="text-sm font-medium">Hide Scores</span>
                  </>
                ) : (
                  <>
                    <ChevronLeft className="h-5 w-5" />
                    <span className="text-sm font-medium">Show Scores</span>
                  </>
                )}
              </button>
            </motion.div>

            {/* Scoreboard Section */}
            <AnimatePresence>
              {isScoreboardVisible && (
                <motion.div
                  initial={{ x: '100%', opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: '100%', opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="w-[15%] h-full border-l border-slate-700"
                >
                  <Scoreboard
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    timeRemaining={timeRemaining}
                    period={period}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
};

export default CustomVideoPlayer;
