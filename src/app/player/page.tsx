'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize, AlertCircle, ExternalLink } from 'lucide-react';
import Scoreboard from '@/components/Scoreboard';
import { useAuth } from '@/contexts/AuthContext';

function PlayerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [isScoreboardVisible, setIsScoreboardVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/player?' + searchParams.toString());
    }
  }, [user, loading, router, searchParams]);

  // Get video details from URL params
  const videoIdParam = searchParams.get('videoId');
  const videoUrlParam = searchParams.get('url');
  const title = searchParams.get('title') || 'Video Player';

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

  // Get the actual video ID (from param or extracted from URL)
  const getVideoId = () => {
    if (videoIdParam) {
      // If videoId is already provided, use it directly
      return videoIdParam;
    }
    if (videoUrlParam) {
      // Otherwise, extract from full URL (legacy support)
      return extractYouTubeId(videoUrlParam);
    }
    return null;
  };

  const videoId = getVideoId();

  // Get embed URL for YouTube with privacy-enhanced parameters
  const getEmbedUrl = () => {
    if (videoId) {
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=1&enablejsapi=1&disablekb=1&fs=0&iv_load_policy=3&cc_load_policy=0&playsinline=1`;
    }
    return null;
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      document.documentElement.requestFullscreen?.();
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    }
  };

  // Protect iframe from inspection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Prevent inspection of iframe elements
      const hideIframeSrc = () => {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
          try {
            // Attempt to hide the src attribute from easy inspection
            Object.defineProperty(iframe, 'src', {
              get: function() {
                console.warn('⚠️ Unauthorized access attempt detected');
                return '';
              },
              configurable: false
            });
          } catch (e) {
            // Silently fail if can't override
          }
        });
      };

      // Run immediately and after a delay
      setTimeout(hideIframeSrc, 100);
      setTimeout(hideIframeSrc, 500);
      setTimeout(hideIframeSrc, 1000);
    }
  }, [videoId]);

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
    router.back();
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-3 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <h2 className="text-white font-bold text-lg">{decodeURIComponent(title)}</h2>
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
      <div className="relative flex h-[calc(100vh-60px)] bg-black">
        {/* Video Section */}
        <motion.div
          animate={{
            width: isScoreboardVisible ? '85%' : '100%'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative h-full bg-black"
          onContextMenu={(e) => e.preventDefault()}
        >
          {!videoId ? (
            <div className="flex items-center justify-center h-full bg-gray-900 text-white">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                <p className="text-lg font-semibold">No Video ID</p>
                <p className="text-sm text-gray-400">Please provide a valid video ID or URL</p>
              </div>
            </div>
          ) : (
            <div
              className="w-full h-full relative"
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }}
              style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
            >
              <iframe
                src={getEmbedUrl() || undefined}
                title="Video Player"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Transparent overlay covering center area (thumbnail/play button) to block right-click */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-transparent"
                style={{
                  pointerEvents: 'auto',
                  width: '70%',
                  height: '70%',
                  zIndex: 10,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }}
              />

              {/* Black overlay bar at top - blocks mouse interactions */}
              <div
                className="absolute top-0 left-0 right-0 bg-black cursor-default"
                style={{ pointerEvents: 'auto', height: '8rem', zIndex: 12 }}
                onContextMenu={(e) => { e.preventDefault(); return false; }}
              />

              {/* Black overlay bar at bottom-right corner - covers fullscreen icon, settings icon and YouTube elements */}
              <div
                className="absolute bottom-0 right-0 bg-black cursor-default transition-all duration-300"
                style={{
                  pointerEvents: 'auto',
                  width: isScoreboardVisible ? '5rem' : '8rem',
                  height: isScoreboardVisible ? '2rem' : '3rem',
                  zIndex: 12
                }}
                onContextMenu={(e) => { e.preventDefault(); return false; }}
              />
            </div>
          )}

          {/* Scoreboard Toggle Button */}
          <button
            onClick={toggleScoreboard}
            className="absolute top-4 right-4 bg-slate-900/90 hover:bg-slate-800 text-white p-3 rounded-lg shadow-lg transition-all z-30 flex items-center gap-2"
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
        {isScoreboardVisible && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-[15%] h-full border-l border-slate-700 bg-slate-900"
          >
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Scoreboard</h3>
                <p className="text-slate-400 text-sm">Coming Soon</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function PlayerPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <PlayerContent />
    </Suspense>
  );
}
